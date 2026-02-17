import { NextRequest, NextResponse } from "next/server";
import { prisma } from '@/app/lib/prisma'; // Asegúrate de que la ruta a prisma sea correcta

export async function POST(solicitud: NextRequest) {
    try {
        // 1. Recibimos el JSON limpio desde el Frontend
        const datos = await solicitud.json();

        const { 
            titulo, 
            tema, // En el front lo llamamos 'tema' (que viene del select categorias)
            descripcion, 
            urlFinalManual, 
            urlFinalPortada 
        } = datos;

        // 2. Guardamos en la tabla correcta: 'manualEquipo'
        const nuevoManual = await prisma.manualEquipo.create({
            data: {
                titulo: titulo,
                
                // Mapeamos lo que llega del front a tus columnas de la BD
                categorias: tema,          // Tu columna se llama 'categorias'
                descripcion: descripcion,
                
                url: urlFinalManual,       // Guardamos la URL pública completa de Backblaze
                portada: urlFinalPortada,  // Guardamos la URL pública completa de la portada
                
                // NOTA: En tu código anterior tenías 'fechaSubida' y 'formato' comentados.
                // Si decides activarlos en tu BD, descomenta esto:
                // fechaSubida: new Date(),
                // formato: datos.formato || 'pdf'
            }
        });

        return NextResponse.json(nuevoManual, { status: 201 });

    } catch (error) {
        console.error("Error al guardar manual en BD:", error);
        return NextResponse.json(
            { message: "Error al guardar registro en base de datos" }, 
            { status: 500 }
        );
    }
}