import { NextRequest, NextResponse } from "next/server";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const s3Client = new S3Client({
    endpoint: `https://${process.env.B2_ENDPOINT}`,
    region: process.env.B2_REGION!,
    credentials: {
        accessKeyId: process.env.B2_KEY_ID!,
        secretAccessKey: process.env.B2_APPLICATION_KEY!,
    },
});

function limpiarNombreArchivo(nombre: string): string {
    return nombre
        .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
        .replace(/ñ/g, 'n').replace(/Ñ/g, 'N')
        .replace(/\s+/g, '-')
        .replace(/[^a-zA-Z0-9.-]/g, '')
        .toLowerCase();
}

export async function POST(solicitud: NextRequest) {
    try {
        const datos = await solicitud.json();
        const { nombreProtocolo, tipoProtocolo, nombrePortada, tipoPortada } = datos;

        // --- 1. PROTOCOLO (PDF) ---
        const nombreLimpio = limpiarNombreArchivo(nombreProtocolo);
        const rutaProtocolo = `protocolos/${Date.now()}-${nombreLimpio}`;

        const ordenProtocolo = new PutObjectCommand({
            Bucket: process.env.B2_BUCKET_NAME!,
            Key: rutaProtocolo,
            ContentType: tipoProtocolo,
        });

        // Llave temporal para subir (PUT)
        const urlParaSubirProtocolo = await getSignedUrl(s3Client, ordenProtocolo, { expiresIn: 300 });

        // 🔥 NUEVO: URL PÚBLICA (Para guardar en BD)
        const urlPublicaProtocolo = `${process.env.CUSTOM_DOMAIN_URL}/file/${process.env.B2_BUCKET_NAME}/${rutaProtocolo}`;


        // --- 2. PORTADA (Opcional) ---
        let urlParaSubirPortada = null;
        let urlPublicaPortada = null;

        if (nombrePortada && tipoPortada) {
            const nombreLimpioPortada = limpiarNombreArchivo(nombrePortada);
            const rutaPortada = `protocolos/portadas/${Date.now()}-${nombreLimpioPortada}`;
            
            const ordenPortada = new PutObjectCommand({
                Bucket: process.env.B2_BUCKET_NAME!,
                Key: rutaPortada,
                ContentType: tipoPortada,
            });

            urlParaSubirPortada = await getSignedUrl(s3Client, ordenPortada, { expiresIn: 300 });
            
            // 🔥 NUEVO: URL PÚBLICA PORTADA
            urlPublicaPortada = `${process.env.CUSTOM_DOMAIN_URL}/file/${process.env.B2_BUCKET_NAME}/${rutaPortada}`;
        }

        // --- 3. RESPUESTA ---
        return NextResponse.json({
            // Llaves temporales
            urlSubidaProtocolo: urlParaSubirProtocolo,
            urlSubidaPortada: urlParaSubirPortada,
            
            // 🔥 URLs Definitivas (HTTPS)
            urlPublicaProtocolo, 
            urlPublicaPortada    
        });

    } catch (error) {
        console.error("Error firmando URLs:", error);
        return NextResponse.json({ message: "Error al generar permisos" }, { status: 500 });
    }
}