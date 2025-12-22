import { NextResponse } from "next/server";  
import {prisma}  from '@/app/lib/prisma';
import path from 'node:path'
import fs from 'node:fs/promises'

type Params = Promise<{ id: string }>

// Obtener protocolo específico
export async function GET(request: Request, { params }: { params: Params }) {
  const { id } = await params

  try {
       const decodedId = decodeURIComponent(id); // Decodifica caracteres especiales
        const filePath = path.join(process.cwd(), 'public', 'uploads', 'protocolos', decodedId)
        const file = await fs.readFile(filePath)

    return new NextResponse(file, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `inline; filename="${id}"`
      }
    })
  } catch (error) {
    return NextResponse.json(
      { message: 'Error obteniendo protocolo' },
      { status: 500 }
    )
  }
}

// Actualizar protocolo   
export async function PUT(  
    request: Request,  
    { params }: { params: Params }  
) {  
    const{ id} = await params
    try {  
        const data = await request.json();  
        const protocoloActualizado = await prisma.protocolo.update({  
            where: { id: Number(id) },  
            data  
        });  

        return NextResponse.json(protocoloActualizado);  
    } catch (error) {  
        return NextResponse.json(  
            { message: "Error actualizando protocolo" },  
            { status: 500 }  
        );  
    }  
}  

// Eliminar protocolo  
export async function DELETE(  
    request: Request,  
    { params }: { params: Params }  
) {  
    const{ id} = await params
    try {  
        await prisma.protocolo.delete({  
            where: { id: Number(id) }  
        });  

        return NextResponse.json(  
            { message: "Protocolo eliminado" },  
            { status: 200 }  
        );  
    } catch (error) {  
        return NextResponse.json(  
            { message: "Error eliminando protocolo" },  
            { status: 500 }  
        );  
    }  
}