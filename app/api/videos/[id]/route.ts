import { NextResponse } from "next/server";
import { prisma } from '@/app/lib/prisma';
import path from 'node:path'
import fs from 'node:fs/promises'

type Params = Promise<{ id: string }>

// Obtener video específico
export async function GET(request: Request, { params }: { params: Params }) {
  const { id } = await params

  try {
        const decodedId = decodeURIComponent(id); // Decodifica caracteres especiales
            const filePath = path.join(process.cwd(), 'public', 'uploads', 'videos', decodedId)
            const file = await fs.readFile(filePath)

            // fs.readFile devuelve un Buffer (Node). NextResponse espera un BodyInit
            // compatible con el estándar Web (ArrayBuffer, Uint8Array, Blob, string, etc.).
            // Convertimos el Buffer a Uint8Array para evitar el error de tipos TS2345.
            const body = new Uint8Array(file)

            return new NextResponse(body, {
      headers: {
        'Content-Type': 'video/mp4',
        'Content-Disposition': `inline; filename="${id}"`
      }
    })
  } catch (error) {
    return NextResponse.json(
      { message: 'Error obteniendo video' },
      { status: 500 }
    )
  }
}
  
  export async function PUT(  
    request: Request,  
    { params }: { params: Params}  
  ) {  
    const {id} = await params;  
    const data = await request.json();  
  
    try {  
      const videoActualizado = await prisma.video.update({  
        where: { id: Number(id) },  
        data  
      });  
  
      return NextResponse.json(videoActualizado);  
    } catch (error) {  
      return NextResponse.json(  
        { message: "Error al actualizar video" },  
        { status: 500 }  
      );  
    }  
  }  
  
  export async function DELETE(  
    request: Request,  
    { params }: { params: Params }  
  ) {  
    const {id }= await params;  
  
    try {  
      await prisma.video.delete({  
        where: { id: Number(id) }  
      });  
  
      return NextResponse.json(  
        { message: "Video eliminado correctamente" },  
        { status: 200 }  
      );  
    } catch (error) {  
      return NextResponse.json(  
        { message: "Error al eliminar video" },  
        { status: 500 }  
      );  
    }  
  }