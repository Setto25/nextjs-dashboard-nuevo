import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

  type Params= Promise<{id:String}>;
  
  // Obtener usuario específico  
  export async function GET(  
      request: Request,  
      { params }: { params: Params }  
  ) {  
      const{ id} = await params
      try {  
          const user = await prisma.user.findUnique({  
              where: { id: Number(id) }  
          });  
  
          if (!user) {  
              return NextResponse.json(  
                  { message: "Protocolo no encontrado" },  
                  { status: 404 }  
              );  
          }  
  
          return NextResponse.json(user);  
      } catch (error) {  
          return NextResponse.json(  
              { message: "Error obteniendo user" },  
              { status: 500 }  
          );  
      }  
  }  
  
  // Actualizar usuario   
  export async function PUT(  
      request: Request,  
      { params }: { params: Params }  
  ) {  
      const{ id} = await params
      try {  
          const data = await request.json();  
          const userActualizado = await prisma.user.update({  
              where: { id: Number(id) },  
              data  
          });  
  
          return NextResponse.json(userActualizado);  
      } catch (error) {  
          return NextResponse.json(  
              { message: "Error actualizando user" },  
              { status: 500 }  
          );  
      }  
  }  
  
  // Eliminar usuario  
  export async function DELETE(  
      request: Request,  
      { params }: { params: Params }  
  ) {  
      const{ id} = await params
      try {  
          await prisma.user.delete({  
              where: { id: Number(id) }  
          });  
  
          return NextResponse.json(  
              { message: "User eliminado" },  
              { status: 200 }  
          );  
      } catch (error) {  
          return NextResponse.json(  
              { message: "Error eliminando user" },  
              { status: 500 }  
          );  
      }  
  }