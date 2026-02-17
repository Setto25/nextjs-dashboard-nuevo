import { NextResponse } from "next/server";

export async function GET() {
  try {
    // -----------------------------------------------------------
    // PASO 0: CONFIGURACIÓN INICIAL
    // Definimos a qué "caja fuerte" (Bucket) queremos cambiarle las reglas.
    // -----------------------------------------------------------
    const BUCKET_ID_MANUAL = "0bd333a709a7f2b891910814"; 

    const keyId = process.env.B2_KEY_ID;
    const appKey = process.env.B2_APPLICATION_KEY;

    // Verificamos que tengamos las llaves para entrar a la administración
    if (!keyId || !appKey) {
        return NextResponse.json({ error: "Faltan credenciales en .env" }, { status: 500 });
    }

    // Seguridad: Evitamos ejecutar el script si el usuario olvidó poner el ID real
  /* VALIDACION DE SEGURIDAD PARA EVITAR EJECUCIONES ACCIDENTALES, desactivada en produccion
    
    if (BUCKET_ID_MANUAL === "TU_BUCKET_ID_AQUI" || BUCKET_ID_MANUAL.length < 10) {
        return NextResponse.json({ error: "⚠️ ¡Falta pegar el Bucket ID real en el código!" }, { status: 400 });
    }*/

    // -----------------------------------------------------------
    // PASO 1: AUTORIZACIÓN (Login)
    // Backblaze requiere que codifiques tus credenciales en base64 para loguearte.
    // Esto es como mostrar tu carnet de identidad para obtener un pase de visita.
    // -----------------------------------------------------------
    const authHeaders = new Headers();
    authHeaders.set('Authorization', 'Basic ' + Buffer.from(keyId + ":" + appKey).toString('base64'));

    // Hacemos la petición de login a la API Nativa de Backblaze
    const authRes = await fetch('https://api.backblazeb2.com/b2api/v3/b2_authorize_account', {
      headers: authHeaders,
    });

    if (!authRes.ok) throw new Error("Falló la autorización.");
    
    // Si el login es exitoso, Backblaze nos da:
    // 1. apiUrl: La dirección exacta del servidor donde vive tu cuenta.
    // 2. authToken: El "carnet de socio" temporal para hacer cambios.
    // 3. accountId: Tu número de cliente.
    const authData = await authRes.json();
    const apiUrl = authData.apiInfo.storageApi.apiUrl;
    const authToken = authData.authorizationToken;
    const accountId = authData.accountId;

    // -----------------------------------------------------------
    // PASO 2: ACTUALIZACIÓN DE REGLAS (La Magia)
    // Usamos 'b2_update_bucket' para re-escribir las normas del Bucket.
    // -----------------------------------------------------------
    console.log(`Actualizando CORS para bucket: ${BUCKET_ID_MANUAL}`);

    const updateRes = await fetch(`${apiUrl}/b2api/v3/b2_update_bucket`, {
      method: 'POST',
      headers: { 'Authorization': authToken }, // Mostramos el "carnet" que nos dieron arriba
      body: JSON.stringify({
        accountId: accountId,
        bucketId: BUCKET_ID_MANUAL,
        
        // AQUÍ ESTÁ LA SOLUCIÓN AL PROBLEMA CORS:
        corsRules: [
          {
            corsRuleName: "ReglaProduccionNeo",
            
            // allowedOrigins: Quién puede enviar archivos.
            // "*" significa: "Cualquiera" (localhost, tu web, tu celular).
            // Esto elimina el bloqueo del navegador.
            allowedOrigins: [
                "*"  
            ],
            
            allowedHeaders: ["*"], // Permitimos enviar cualquier metadato extra.
            
            // allowedOperations: Qué acciones permitimos.
            // "s3_put" es la CRUCIAL para que funcione tu subida de archivos.
            allowedOperations: [
              "b2_download_file_by_name", // Permitir descargar
              "b2_download_file_by_id", 
              "b2_upload_file",           // Subida nativa
              "b2_upload_part", 
              "s3_delete",                // Permitir borrar vía S3 SDK
              "s3_get",                   // Permitir ver vía S3 SDK
              "s3_head",                  // Permitir verificar info vía S3 SDK
              "s3_post", 
              "s3_put"                    // <--- ¡ESTA PERMITE SUBIR ARCHIVOS!
            ],
            maxAgeSeconds: 3600 // El navegador recordará este permiso por 1 hora.
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