import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();


  export async function DELETE(  
    request: Request,  
    { params }: { params: { id: string } }  
  ) {  
    const userId = params.id;  
  
    try {  
      await prisma.video.delete({  
        where: { id: Number(userId) }  
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