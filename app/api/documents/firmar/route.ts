import { NextRequest, NextResponse } from "next/server";
import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

// -------------------------------------------------------------------------
// CONFIGURACION S3 (Solo para firmar)
// -------------------------------------------------------------------------
// El sistema necesita las credenciales de Backblaze para autorizar la subida.
const s3Client = new S3Client({
    endpoint: `https://${process.env.B2_ENDPOINT}`,
    region: process.env.B2_REGION!,
    credentials: {
        accessKeyId: process.env.B2_KEY_ID!,
        secretAccessKey: process.env.B2_APPLICATION_KEY!,
    },
});

// -------------------------------------------------------------------------
// FUNCION DE LIMPIEZA OPTIMIZADA
// -------------------------------------------------------------------------
// Esta funcion prepara el nombre del archivo para que sea seguro en la nube.
// Se usa la version mas robusta y legible.
function limpiarNombreArchivo(nombre: string): string {
  return nombre
    .trim()                       // 1. Quita espacios sobrantes al inicio/final
    .toLowerCase()                // 2. Convierte todo a minusculas
    .normalize('NFD')             // 3. Separa caracteres especiales (tildes)
    .replace(/[\u0300-\u036f]/g, '') // 4. Elimina los acentos separados
    .replace(/ñ/g, 'n')           // 5. Reemplaza ñ por n
    .replace(/\s+/g, '-')         // 6. Reemplaza espacios internos por guiones
    .replace(/[^a-z0-9.-]/g, ''); // 7. Elimina cualquier caracter raro sobrante
}

export async function POST(solicitud: NextRequest) {
    try {
        // 1. RECEPCION DE METADATOS
        // El sistema recibe solo nombres y tipos de archivo, no los binarios.
        const datos = await solicitud.json();
        const { nombreDocumento, tipoDocumento, nombrePortada, tipoPortada } = datos;

        // 2. FIRMA DEL DOCUMENTO (PDF)
        const nombreLimpio = limpiarNombreArchivo(nombreDocumento);
        // Se define la ruta interna en la carpeta 'documentos/'
        const rutaDocumento = `documentos/${Date.now()}-${nombreLimpio}`;

        const ordenDocumento = new PutObjectCommand({
            Bucket: process.env.B2_BUCKET_NAME!,
            Key: rutaDocumento,
            ContentType: tipoDocumento,
        });

        // URL temporal para subir (PUT) - Expira en 5 minutos
        const urlSubidaDocumento = await getSignedUrl(s3Client, ordenDocumento, { expiresIn: 300 });
        
        // URL publica definitiva (para guardar en la BD)
        const urlPublicaDocumento = `${process.env.CUSTOM_DOMAIN_URL}/file/${process.env.B2_BUCKET_NAME}/${rutaDocumento}`;

        // 3. FIRMA DE LA PORTADA (Opcional)
        let urlSubidaPortada = null;
        let urlPublicaPortada = null;

        if (nombrePortada && tipoPortada) {
            const rutaPortada = `documentos/portadas/${Date.now()}-${limpiarNombreArchivo(nombrePortada)}`;
            
            const ordenPortada = new PutObjectCommand({
                Bucket: process.env.B2_BUCKET_NAME!,
                Key: rutaPortada,
                ContentType: tipoPortada,
            });
            
            urlSubidaPortada = await getSignedUrl(s3Client, ordenPortada, { expiresIn: 300 });
            urlPublicaPortada = `${process.env.CUSTOM_DOMAIN_URL}/file/${process.env.B2_BUCKET_NAME}/${rutaPortada}`;
        }

        // 4. RESPUESTA AL FRONTEND
        // Se entregan las llaves para subir y las direcciones finales.
        return NextResponse.json({
            urlSubidaDocumento,
            urlSubidaPortada,
            urlPublicaDocumento,
            urlPublicaPortada
        });

    } catch (error) {
        console.error("Error firmando documento:", error);
        return NextResponse.json({ message: "Error al generar permisos" }, { status: 500 });
    }
}