import { NextRequest, NextResponse } from "next/server";
import { prisma } from '@/app/lib/prisma';

// -------------------------------------------------------------------------
// API ARCHIVISTA (Guardado en Base de Datos)
// -------------------------------------------------------------------------
// Este archivo NO necesita configuracion de S3 (Backblaze).
// Su unica funcion es recibir texto y URLs para guardarlas en Neon (Prisma).

export async function POST(solicitud: NextRequest) {
    try {
        // 1. RECEPCION DE DATOS
        // El sistema recibe el paquete de datos JSON enviado por el Frontend.
        // Aqui ya vienen las URLs definitivas (https://...) generadas previamente.
        const datosParaPrisma = await solicitud.json();

        // 2. DESESTRUCTURACION
        // Se extraen las variables individuales para ordenarlas antes de guardar.
        const { 
            titulo, 
            tema, 
            descripcion, 
            categorias, 
            urlFinalLibro,   // Esta URL ya viene lista desde el Frontend (https://...)
            urlFinalPortada, // Esta URL ya viene lista desde el Frontend (https://...)
            formatoOriginal 
        } = datosParaPrisma;

        // 3. GUARDADO EN NEON (Prisma)
        // Se crea el registro en la tabla 'Libro'.
        // Es crucial que los nombres de los campos coincidan con el schema.prisma.
        const nuevoLibro = await prisma.libro.create({
            data: {
                titulo: titulo,
                tema: tema,
                
                // Asignacion de las URLs publicas a los campos de la base de datos.
                url: urlFinalLibro, 
                portada: urlFinalPortada, 
                
                descripcion: descripcion,
                categorias: categorias,
                
                // Si no llega un formato especifico, se asume que es 'pdf'.
                formato: formatoOriginal || 'pdf',
                
                // Se registra la fecha y hora exacta de la subida.
                fechaSubida: new Date(),
                
                // Se deja constancia de que el archivo fisico vive en Backblaze.
                storageProvider: "BACKBLAZE_B2"
            }
        });

        // 4. CONFIRMACION
        // Se devuelve el objeto creado para confirmar que todo salio bien.
        return NextResponse.json(nuevoLibro);

    } catch (error) {
        // En caso de error (ej: base de datos caida), se muestra en consola
        // y se avisa al Frontend.
        console.error("Error al guardar libro en BD:", error);
        return NextResponse.json(
            { message: "Error al guardar el libro" }, 
            { status: 500 }
        );
    }
}