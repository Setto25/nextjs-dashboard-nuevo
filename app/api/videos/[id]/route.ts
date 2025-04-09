import { NextResponse } from "next/server";
import { prisma } from '@/app/lib/prisma';



type Params = Promise<{ id: string }>;

// app/api/videos/[id]/route.ts  
export async function GET(  
    request: Request,  
    { params }: { params: Params }  
  ) {  
    const {id} = await params;  
    
    try {  
      const video = await prisma.video.findUnique({  
        where: { id: Number(id) }  
      });  
  
      if (!video) {  
        return NextResponse.json(  
          { message: "Video no encontrado" },  
          { status: 404 }  
        );  
      }  
  
      return NextResponse.json(video);  
    } catch (error) {  
      return NextResponse.json(  
        { message: "Error al obtener video" },  
        { status: 500 }  
      );  
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