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
            tema,           // Texto del tema
            temaId,         // ID numerico para la relacion con MenuCategoria
            descripcion, 
            categorias, 
            urlFinalDocumento, // URL publica https://...
            urlFinalPortada    // URL publica https://...
        } = datos;

        // Validacion de seguridad para evitar errores de clave foranea.
        if (!temaId || isNaN(Number(temaId))) {
             return NextResponse.json({ message: "Tema ID invalido" }, { status: 400 });
        }

        // 2. CREACION DEL REGISTRO
        // Se guarda el documento conectandolo a su categoria correspondiente.
        const nuevoDocumento = await prisma.documento.create({
            data: {
                titulo: titulo,
                tema: tema, 
                descripcion: descripcion,
                categorias: categorias,
                
                // URLs definitivas que vienen del paso anterior
                url: urlFinalDocumento,
                portada: urlFinalPortada,
                
                fechaSubida: new Date(),
                
                // 3. RELACION CON MENU CATEGORIA
                // Se conecta este documento con un registro existente en la tabla MenuCategoria.
                menuCategoria: {
                    connect: { id: Number(temaId) }
                }
            }
        });

        return NextResponse.json(nuevoDocumento, { status: 201 });

    } catch (error) {
        console.error("Error al guardar documento en BD:", error);
        return NextResponse.json({ message: "Error al guardar en base de datos" }, { status: 500 });
    }
}