import { NextResponse } from "next/server";  
import { prisma } from '@/app/lib/prisma';
import path from 'node:path'
import fs from 'node:fs/promises'

type Params = Promise<{ id: string }>

// Obtener documento específico
export async function GET(request: Request, { params }: { params: Params }) {
  const { id } = await params

  console.log("ID del documento:", id); // Para depuración

  try {
        const decodedId = decodeURIComponent(id); // Decodifica caracteres especiales
    const filePath = path.join(process.cwd(), 'public', 'uploads', 'documentos', decodedId)
    const file = await fs.readFile(filePath)

    return new NextResponse(file, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `inline; filename="${decodedId}"`
      }
    })
  } catch (error) {
    return NextResponse.json(
      { message: 'Error obteniendo documento' },
      { status: 500 }
    )
  }
}

// Actualizar documento 
export async function PUT(  
    request: Request,  
    { params }: { params: Params }  
) {  
    const{ id} = await params
    try {  
        const data = await request.json();  
        const documentoActualizado = await prisma.documento.update({  
            where: { id: Number(id) },  
            data  
        });  

        return NextResponse.json(documentoActualizado);  
    } catch (error) {  
        return NextResponse.json(  
            { message: "Error actualizando documento" },  
            { status: 500 }  
        );  
    }  
}  

// Eliminar documento
export async function DELETE(  
    request: Request,  
    { params }: { params: Params }  
) {  
    const{ id} = await params
    try {  
        await prisma.documento.delete({  
            where: { id: Number(id) }  
        });  

        return NextResponse.json(  
            { message: "documento eliminado" },  
            { status: 200 }  
        );  
    } catch (error) {  
        return NextResponse.json(  
            { message: "Error eliminando documento" },  
            { status: 500 }  
        );  
    }  
}