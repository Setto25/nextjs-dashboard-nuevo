import { NextRequest, NextResponse } from "next/server";
import { prisma } from '@/app/lib/prisma'; 

// Este archivo funciona como el "Archivista" del sistema.
// Su unica responsabilidad es recibir los datos de texto y los links que el Frontend ya genero
// y guardarlos permanentemente en la base de datos Neon.
export async function POST(solicitud: NextRequest) {
    try {
        // 1. RECEPCION DE DATOS
        // El sistema lee el JSON que envio el navegador (Frontend).
        // Aqui NO llegan archivos pesados (PDFs), solo llegan textos y las URLs de Backblaze.
        const datos = await solicitud.json();

        // Se extraen las variables individuales del paquete de datos.
        const { 
            titulo, 
            tema,           // OJO: El frontend envia esto como 'tema' (lo que selecciono en el dropdown)
            descripcion, 
            urlFinalManual, // Esta es la URL publica completa (https://...) del PDF
            urlFinalPortada // Esta es la URL publica completa (https://...) de la imagen
        } = datos;

        // 2. GUARDADO EN BASE DE DATOS
        // Se usa Prisma para crear un nuevo registro en la tabla 'manualEquipo'.
        // Es importante que el nombre de la tabla coincida exactamente con el schema.prisma.
        const nuevoManual = await prisma.manualEquipo.create({
            data: {
                titulo: titulo,
                
                // MAPEO DE CAMPOS (Traduccion Frontend -> Base de Datos)
                // La columna en la base de datos se llama 'categorias', pero recibe el valor de 'tema'.
                categorias: tema,          
                
                descripcion: descripcion,
                
                // Aqui se asignan las URLs definitivas que permiten descargar los archivos desde cualquier lugar.
                url: urlFinalManual,       
                portada: urlFinalPortada,  
                
                // NOTA PARA EL FUTURO:
                // En el codigo original habia campos para 'fechaSubida' y 'formato'.
                // Estan comentados aqui abajo por si Cristian decide reactivarlos en la base de datos mas adelante.
                // fechaSubida: new Date(),
                // formato: datos.formato || 'pdf'
            }
        });

        // 3. RESPUESTA EXITOSA
        // Si Prisma guardo todo bien, se devuelve el objeto creado con estado 201 (Created).
        return NextResponse.json(nuevoManual, { status: 201 });

    } catch (error) {
        // MANEJO DE ERRORES
        // Si la base de datos falla (conexion perdida, error de prisma), se captura aqui
        // para que el servidor no se caiga y se pueda avisar al usuario.
        console.error("Error al guardar manual en BD:", error);
        return NextResponse.json(
            { message: "Error al guardar registro en base de datos" }, 
            { status: 500 }
        );
    }
}