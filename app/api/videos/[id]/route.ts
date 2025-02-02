import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// app/api/videos/[id]/route.ts  
export async function GET(  
    request: Request,  
    { params }: { params: { id: string } }  
  ) {  
    const videoId = params.id;  
    
    try {  
      const video = await prisma.video.findUnique({  
        where: { id: Number(videoId) }  
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
    { params }: { params: { id: string } }  
  ) {  
    const videoId = params.id;  
    const data = await request.json();  
  
    try {  
      const videoActualizado = await prisma.video.update({  
        where: { id: Number(videoId) },  
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
    { params }: { params: { id: string } }  
  ) {  
    const videoId = params.id;  
  
    try {  
      await prisma.video.deleteMany({  
        where: { id: Number(videoId) }  
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