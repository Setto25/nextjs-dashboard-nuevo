import { NextResponse } from "next/server";

export async function GET() {
  try {
    // 👇👇👇 VUELVE A PEGAR TU BUCKET ID AQUÍ 👇👇👇
    const BUCKET_ID_MANUAL = "0bd333a709a7f2b891910814"; 
    // -----------------------------------------------------------

    const keyId = process.env.B2_KEY_ID;
    const appKey = process.env.B2_APPLICATION_KEY;

    if (!keyId || !appKey) {
        return NextResponse.json({ error: "Faltan credenciales en .env" }, { status: 500 });
    }

    // Validación rápida para que no se te olvide el ID
    if (BUCKET_ID_MANUAL === "TU_BUCKET_ID_AQUI" || BUCKET_ID_MANUAL.length < 10) {
        return NextResponse.json({ error: "⚠️ ¡Falta pegar el Bucket ID real en el código!" }, { status: 400 });
    }

    // 1. AUTORIZACIÓN
    const authHeaders = new Headers();
    authHeaders.set('Authorization', 'Basic ' + Buffer.from(keyId + ":" + appKey).toString('base64'));

    const authRes = await fetch('https://api.backblazeb2.com/b2api/v3/b2_authorize_account', {
      headers: authHeaders,
    });

    if (!authRes.ok) throw new Error("Falló la autorización.");
    
    const authData = await authRes.json();
    const apiUrl = authData.apiInfo.storageApi.apiUrl;
    const authToken = authData.authorizationToken;
    const accountId = authData.accountId;

    // 2. ACTUALIZACIÓN (Lista de operaciones limpiada)
    console.log(`Actualizando CORS para bucket: ${BUCKET_ID_MANUAL}`);

    const updateRes = await fetch(`${apiUrl}/b2api/v3/b2_update_bucket`, {
      method: 'POST',
      headers: { 'Authorization': authToken },
      body: JSON.stringify({
        accountId: accountId,
        bucketId: BUCKET_ID_MANUAL,
corsRules: [
  {
    corsRuleName: "ReglaProduccionNeo",
    allowedOrigins: [

        "*"                        // <--- El comodín por si acaso
    ],
    allowedHeaders: ["*"], // IMPORTANTE: Permitir todas las cabeceras
    allowedOperations: [
      "b2_download_file_by_name",
      "b2_download_file_by_id", 
      "b2_upload_file",
      "b2_upload_part", 
      "s3_delete", 
      "s3_get", 
      "s3_head", 
      "s3_post", 
      "s3_put" // <--- Esta es la clave para la subida
    ],
    maxAgeSeconds: 3600
  }
]
      })
    });

    const updateData = await updateRes.json();

    if (!updateRes.ok) {
        return NextResponse.json({ error: "Falló la actualización", detalles: updateData }, { status: 500 });
    }

    return NextResponse.json({ 
        mensaje: "✅ ¡CORS CORREGIDO! (Versión final)", 
        reglas: updateData.corsRules 
    });

  } catch (error) {
    return NextResponse.json({ error: "Error", detalles: error instanceof Error ? error.message : error }, { status: 500 });
  }
}