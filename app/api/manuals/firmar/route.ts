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

function limpiarNombre(nombre: string): string {
  return nombre.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/ñ/g, 'n').replace(/\s+/g, '-').replace(/[^a-zA-Z0-9.-]/g, '').toLowerCase();
}

export async function POST(solicitud: NextRequest) {
    try {
        const { nombreManual, tipoManual, nombrePortada, tipoPortada } = await solicitud.json();

        // 1. MANUAL (PDF, DOC, etc.)
        const rutaManual = `manuales/${Date.now()}-${limpiarNombre(nombreManual)}`;
        const ordenManual = new PutObjectCommand({
            Bucket: process.env.B2_BUCKET_NAME!,
            Key: rutaManual,
            ContentType: tipoManual,
        });
        const urlSubidaManual = await getSignedUrl(s3Client, ordenManual, { expiresIn: 300 });
        
        // URL Pública
        const urlPublicaManual = `${process.env.CUSTOM_DOMAIN_URL}/file/${process.env.B2_BUCKET_NAME}/${rutaManual}`;

        // 2. PORTADA (Opcional)
        let urlSubidaPortada = null;
        let urlPublicaPortada = null;

        if (nombrePortada && tipoPortada) {
            const rutaPortada = `manuales/portadas/${Date.now()}-${limpiarNombre(nombrePortada)}`;
            const ordenPortada = new PutObjectCommand({
                Bucket: process.env.B2_BUCKET_NAME!,
                Key: rutaPortada,
                ContentType: tipoPortada,
            });
            urlSubidaPortada = await getSignedUrl(s3Client, ordenPortada, { expiresIn: 300 });
            
            // URL Pública
            urlPublicaPortada = `${process.env.CUSTOM_DOMAIN_URL}/file/${process.env.B2_BUCKET_NAME}/${rutaPortada}`;
        }

        return NextResponse.json({
            urlSubidaManual,
            urlSubidaPortada,
            urlPublicaManual,
            urlPublicaPortada
        });

    } catch (error) {
        console.error("Error firmando manual:", error);
        return NextResponse.json({ message: "Error al generar firma" }, { status: 500 });
    }
}