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
// Prepara el nombre del archivo para que sea seguro y limpio en la nube.
function limpiarNombreArchivo(nombre: string): string {
  return nombre
    .trim()                       // 1. Quita espacios sobrantes
    .toLowerCase()                // 2. Convierte todo a minusculas
    .normalize('NFD')             // 3. Separa caracteres especiales
    .replace(/[\u0300-\u036f]/g, '') // 4. Elimina los acentos
    .replace(/ñ/g, 'n')           // 5. Reemplaza ñ
    .replace(/\s+/g, '-')         // 6. Reemplaza espacios por guiones
    .replace(/[^a-z0-9.-]/g, ''); // 7. Elimina caracteres raros
}

export async function POST(solicitud: NextRequest) {
    try {
        // 1. RECEPCION DE METADATOS
        // Se reciben los nombres y tipos de archivo.
        const datos = await solicitud.json();
        const { nombrePlantilla, tipoPlantilla, nombrePortada, tipoPortada } = datos;

        // 2. FIRMA DEL ARCHIVO PRINCIPAL (PDF/DOCX)
        const nombreLimpio = limpiarNombreArchivo(nombrePlantilla);
        // Se define la ruta en la carpeta 'plantillas/'
        const rutaPlantilla = `plantillas/${Date.now()}-${nombreLimpio}`;

        const ordenPlantilla = new PutObjectCommand({
            Bucket: process.env.B2_BUCKET_NAME!,
            Key: rutaPlantilla,
            ContentType: tipoPlantilla,
        });

        // URL temporal para subir (PUT)
        const urlSubidaPlantilla = await getSignedUrl(s3Client, ordenPlantilla, { expiresIn: 300 });
        
        // URL publica definitiva (para guardar en la BD)
        const urlPublicaPlantilla = `${process.env.CUSTOM_DOMAIN_URL}/file/${process.env.B2_BUCKET_NAME}/${rutaPlantilla}`;

        // 3. FIRMA DE LA PORTADA (Opcional)
        let urlSubidaPortada = null;
        let urlPublicaPortada = null;

        if (nombrePortada && tipoPortada) {
            const rutaPortada = `plantillas/portadas/${Date.now()}-${limpiarNombreArchivo(nombrePortada)}`;
            
            const ordenPortada = new PutObjectCommand({
                Bucket: process.env.B2_BUCKET_NAME!,
                Key: rutaPortada,
                ContentType: tipoPortada,
            });
            
            urlSubidaPortada = await getSignedUrl(s3Client, ordenPortada, { expiresIn: 300 });
            urlPublicaPortada = `${process.env.CUSTOM_DOMAIN_URL}/file/${process.env.B2_BUCKET_NAME}/${rutaPortada}`;
        }

        // 4. RESPUESTA AL FRONTEND
        return NextResponse.json({
            urlSubidaPlantilla,
            urlSubidaPortada,
            urlPublicaPlantilla,
            urlPublicaPortada
        });

    } catch (error) {
        console.error("Error firmando plantilla:", error);
        return NextResponse.json({ message: "Error al generar permisos" }, { status: 500 });
    }
}