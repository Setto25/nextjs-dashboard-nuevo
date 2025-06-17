import { NextResponse } from 'next/server';
import { prisma } from '@/app/lib/prisma';
import bcrypt from 'bcrypt';


  type Params= Promise<{id:string}>;
  
  // Obtener usuario específico  
  export async function GET(  
      request: Request,  
      { params }: { params: Params }  
  ) {  
      const{ id} = await params
      console.log("IDDDD:",id)
      try {  
          const user = await prisma.user.findUnique({  
              where: { id: Number(id) }  
          });  
  
          if (!user) {  
              return NextResponse.json(  
                  { message: "Usuario no encontrado" },  
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
  
  export async function PUT(
    request: Request,
    { params }: { params: Params }
  ) {
    const { id } = await params;
  
    try {
      const data = await request.json();
  
      // Si se incluye una nueva contraseña en los datos, hashearla antes de actualizar
      if (data.password) {
        data.password = await bcrypt.hash(data.password, 10); // Hashear la nueva contraseña
      }
  
      const userActualizado = await prisma.user.update({
        where: { id: Number(id) },
        data, // Actualizar los datos del usuario, incluyendo la contraseña hasheada
      });
  
      return NextResponse.json(userActualizado);
    } catch (error) {
      console.error('Error actualizando usuario:', error);
      return NextResponse.json(
        { message: 'Error actualizando user' },
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