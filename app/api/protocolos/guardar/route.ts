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
            // CORRECCIÓN: El Frontend ya nos está mandando la URL completa (https://...)
            // Así que las renombramos para que sea más claro.
            rutaFinalProtocolo, 
            rutaFinalPortada    
        } = datos;

        // --- Guardar en Prisma (Neon) ---
        const nuevoProtocolo = await prisma.protocolo.create({
            data: {
                codigo,
                titulo,
                descripcion,
                categoria,
                version,
                creadoPor,
                
                // CORRECCIÓN: Guardamos la URL directamente sin concatenar nada
                url: rutaFinalProtocolo,   
                portada: rutaFinalPortada, 
                
                fechaCreacion: new Date(),
                fechaRevision: new Date(),
                vigencia: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 año de vigencia
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