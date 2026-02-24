import { NextRequest, NextResponse } from "next/server";
import { prisma } from '@/app/lib/prisma';

// -------------------------------------------------------------------------
// API GUARDAR (Archivista)
// -------------------------------------------------------------------------
// Este archivo recibe la informacion final y la guarda en Neon.
// No necesita S3.

export async function POST(solicitud: NextRequest) {
    try {
        // 1. RECEPCION DE DATOS
        const datos = await solicitud.json();
        
        const { 
            titulo, 
            tema, 
            descripcion, 
            categoria,      // En este caso es un string simple segun tu codigo anterior
            palabrasClave,  // Nuevo campo para palabras clave
            urlFinalPlantilla, // URL publica https://...
            urlFinalPortada    // URL publica https://...
        } = datos;

        // 2. CREACION DEL REGISTRO
        // Se crea el registro en la tabla 'plantilla'.
        const nuevaPlantilla = await prisma.plantilla.create({
            data: {
                titulo: titulo,
                tema: tema, 
                descripcion: descripcion,
                categoria: categoria,
                palabrasClave: palabrasClave,
                
                // URLs definitivas que vienen del paso anterior
                url: urlFinalPlantilla,
                portada: urlFinalPortada,
                
                fechaSubida: new Date()
            }
        });

        return NextResponse.json(nuevaPlantilla, { status: 201 });

    } catch (error) {
        console.error("Error al guardar plantilla en BD:", error);
        return NextResponse.json({ message: "Error al guardar en base de datos" }, { status: 500 });
    }
}