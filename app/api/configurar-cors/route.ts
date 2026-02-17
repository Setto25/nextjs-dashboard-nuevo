import { NextResponse } from "next/server";

export async function GET() {
  try {
    // 1. OBTENER DATOS DE ENTORNO
    const keyId = process.env.B2_KEY_ID;
    const appKey = process.env.B2_APPLICATION_KEY;
    const bucketName = process.env.B2_BUCKET_NAME;

    if (!keyId || !appKey || !bucketName) {
      return NextResponse.json({ error: "Faltan credenciales en .env" }, { status: 500 });
    }

    // 2. AUTORIZARSE (B2 NATIVE AUTH)
    // Backblaze requiere Basic Auth con base64 para obtener el token
    const authHeaders = new Headers();
    authHeaders.set('Authorization', 'Basic ' + Buffer.from(keyId + ":" + appKey).toString('base64'));

    const authRes = await fetch('https://api.backblazeb2.com/b2api/v3/b2_authorize_account', {
      headers: authHeaders,
    });
    
    if (!authRes.ok) throw new Error("Falló la autorización con Backblaze");
    const authData = await authRes.json();
    
    const apiUrl = authData.apiInfo.storageApi.apiUrl;
    const authToken = authData.authorizationToken;
    const accountId = authData.accountId;

    // 3. ENCONTRAR EL ID DEL BUCKET
    // (Necesitamos el ID numérico, no el nombre "plafatorma-neo")
    const listBucketsRes = await fetch(`${apiUrl}/b2api/v3/b2_list_buckets?accountId=${accountId}`, {
        method: 'POST',
        headers: { 'Authorization': authToken },
        body: JSON.stringify({ accountId: accountId }) // A veces se requiere en el body también
    });

    const bucketsData = await listBucketsRes.json();
    const myBucket = bucketsData.buckets.find((b: any) => b.bucketName === bucketName);

    if (!myBucket) {
        return NextResponse.json({ error: `No encontré el bucket con nombre: ${bucketName}` }, { status: 404 });
    }

    const bucketId = myBucket.bucketId;

    // 4. ACTUALIZAR REGLAS CORS (USANDO LA API NATIVA)
    // Aquí definimos las reglas que permiten TODO (Subidas, Descargas, etc.)
    const updateRes = await fetch(`${apiUrl}/b2api/v3/b2_update_bucket`, {
      method: 'POST',
      headers: { 'Authorization': authToken },
      body: JSON.stringify({
        accountId: accountId,
        bucketId: bucketId,
        corsRules: [
          {
            corsRuleName: "ReglaPermisivaParaS3",
            allowedOrigins: ["*"], // Ojo: Cambia esto a tu dominio en producción si quieres más seguridad
            allowedHeaders: ["*"],
            allowedOperations: [
              "b2_download_file_by_name",
              "b2_download_file_by_id", 
              "b2_upload_file",
              "b2_upload_part", 
              "b2_finish_large_file",
              "s3_put" // A veces B2 interpreta esto automáticamente
            ],
            maxAgeSeconds: 3600
          }
        ]
      })
    });

    const updateData = await updateRes.json();

    if (!updateRes.ok) {
        return NextResponse.json({ error: "Falló la actualización del bucket", detalles: updateData }, { status: 500 });
    }

    return NextResponse.json({ 
        mensaje: "✅ ¡CORS NATIVO CORREGIDO!", 
        bucketId: bucketId,
        reglasAplicadas: updateData.corsRules 
    });

  } catch (error) {
    console.error(error);
    return NextResponse.json({ 
        error: "❌ Error crítico en el script", 
        detalles: error instanceof Error ? error.message : error 
    }, { status: 500 });
  }
}