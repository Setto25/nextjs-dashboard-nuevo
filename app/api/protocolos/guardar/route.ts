import { NextRequest, NextResponse } from "next/server";
import { prisma } from '@/app/lib/prisma'; // Asegúrate que esta ruta sea correcta

export async function POST(solicitud: NextRequest) {
    try {
        const datos = await solicitud.json();

        // Desestructuramos los datos que vienen del frontend
        const {
            codigo,
            titulo,
            descripcion,
            categoria,
            version,
            creadoPor,
            rutaFinalProtocolo, // La ruta parcial que nos dio la API de firma (ej: protocolos/123-guia.pdf)
            rutaFinalPortada    // La ruta parcial de la portada
        } = datos;

        // Construimos las URLs públicas completas para guardar en la BD
        const protocoloUrlPublica = `${process.env.CUSTOM_DOMAIN_URL}/file/${process.env.B2_BUCKET_NAME}/${rutaFinalProtocolo}`;
        
        let portadaUrlPublica = null;
        if (rutaFinalPortada) {
            portadaUrlPublica = `${process.env.CUSTOM_DOMAIN_URL}/file/${process.env.B2_BUCKET_NAME}/${rutaFinalPortada}`;
        }

        // --- Guardar en Prisma (Neon) ---
        const nuevoProtocolo = await prisma.protocolo.create({
            data: {
                codigo,
                titulo,
                descripcion,
                categoria,
                version,
                creadoPor,
                url: protocoloUrlPublica,   // URL final del PDF
                portada: portadaUrlPublica, // URL final de la imagen
                fechaCreacion: new Date(),
                fechaRevision: new Date(),
                vigencia: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 año de vigencia
                // Agregamos el proveedor por si acaso (opcional si lo tienes en tu esquema)
                // storageProvider: "BACKBLAZE_B2" 
            }
        });

        console.log("✅ Protocolo guardado con código:", codigo);
        return NextResponse.json(nuevoProtocolo, { status: 201 });

    } catch (error) {
        console.error('Error al guardar protocolo en BD:', error);
        return NextResponse.json(
            {
                message: "Error al guardar la información del protocolo",
                error: error instanceof Error ? error.message : 'Error desconocido'
            },
            { status: 500 }
        );
    }
}