import { NextRequest, NextResponse } from "next/server";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

// Configuración del Cliente S3 (Backblaze B2)
const s3Client = new S3Client({
    endpoint: `https://${process.env.B2_ENDPOINT}`,
    region: process.env.B2_REGION!,
    credentials: {
        accessKeyId: process.env.B2_KEY_ID!,
        secretAccessKey: process.env.B2_APPLICATION_KEY!,
    },
});

// Tu función personalizada de limpieza (La integré aquí)
function limpiarNombreArchivo(nombre: string): string {
    return nombre
        .normalize('NFD') // Separa acentos
        .replace(/[\u0300-\u036f]/g, '') // Elimina acentos
        .replace(/ñ/g, 'n')
        .replace(/Ñ/g, 'N')
        .replace(/\s+/g, '-') // REEMPLAZA ESPACIOS POR GUIONES
        .replace(/[^a-zA-Z0-9.-]/g, '') // Solo deja letras, números, puntos y guiones
        .toLowerCase(); // Todo a minúsculas
}

export async function POST(solicitud: NextRequest) {
    try {
        // Recibimos solo los metadatos (nombres y tipos), NO los archivos pesados
        const datos = await solicitud.json();
        const { nombreProtocolo, tipoProtocolo, nombrePortada, tipoPortada } = datos;

        // --- 1. Preparar firma para el Protocolo (PDF) ---
        const nombreLimpio = limpiarNombreArchivo(nombreProtocolo);
        const rutaProtocolo = `protocolos/${Date.now()}-${nombreLimpio}`;

        const ordenProtocolo = new PutObjectCommand({
            Bucket: process.env.B2_BUCKET_NAME!,
            Key: rutaProtocolo,
            ContentType: tipoProtocolo,
        });

        // Generamos la "llave" temporal (URL firmada)
        const urlParaSubirProtocolo = await getSignedUrl(s3Client, ordenProtocolo, { expiresIn: 300 });


        // --- 2. Preparar firma para la Portada (Si existe) ---
        let urlParaSubirPortada = null;
        let rutaPortada = null;

        if (nombrePortada && tipoPortada) {
            const nombreLimpioPortada = limpiarNombreArchivo(nombrePortada);
            rutaPortada = `protocolos/portadas/${Date.now()}-${nombreLimpioPortada}`;
            
            const ordenPortada = new PutObjectCommand({
                Bucket: process.env.B2_BUCKET_NAME!,
                Key: rutaPortada,
                ContentType: tipoPortada,
            });

            urlParaSubirPortada = await getSignedUrl(s3Client, ordenPortada, { expiresIn: 300 });
        }

        // --- 3. Responder al Frontend ---
        return NextResponse.json({
            urlSubidaProtocolo: urlParaSubirProtocolo,
            urlSubidaPortada: urlParaSubirPortada,
            rutaFinalProtocolo: rutaProtocolo, // Para guardar luego en la BD
            rutaFinalPortada: rutaPortada      // Para guardar luego en la BD
        });

    } catch (error) {
        console.error("Error firmando URLs:", error);
        return NextResponse.json({ message: "Error al generar permisos de subida" }, { status: 500 });
    }
}