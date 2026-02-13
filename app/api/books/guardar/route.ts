
import { NextRequest, NextResponse } from "next/server";
import {prisma}  from '@/app/lib/prisma';

export async function POST(solicitud: NextRequest) {
    const datosParaPrisma = await solicitud.json(); // Recibo el JSON del front

    // Desestructuro los datos que vienen en el JSON
    const { 
        titulo, 
        tema, 
        descripcion, 
        categorias, 
        urlFinalLibro, 
        urlFinalPortada,
        formatoOriginal 
    } = datosParaPrisma;

    // Ahora sí, guardo en la base de datos de Neon
    const nuevoLibro = await prisma.libro.create({
        data: {
            titulo: titulo,
            tema: tema,
            url: urlFinalLibro, // El link que generamos en el paso anterior
            portada: urlFinalPortada, // El link de la imagen
            descripcion: descripcion,
            categorias: categorias,
            formato: formatoOriginal || 'pdf',
            fechaSubida: new Date(),
            storageProvider: "BACKBLAZE_B2"
        }
    });

    return NextResponse.json(nuevoLibro);
}