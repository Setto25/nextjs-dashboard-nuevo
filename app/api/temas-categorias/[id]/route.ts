import { NextRequest, NextResponse } from "next/server";  
import {prisma}  from '@/app/lib/prisma';

type Params = Promise<{ id: string }>; //Promise para asegurar que params se resuelva antes de usarlo. Desde next 15+

export async function GET(  
  req: NextRequest,  
  { params }: { params: Params }  
) {  
  //const id = Number(params.id); 
  const {id} = await params;  
const idNum = Number(id);
    

  if (isNaN(idNum)) {  
    return NextResponse.json({ error: "ID inválido" }, { status: 400 });  
  }  

  try {  
    const tema = await prisma.menuCategoria.findUnique({  
      where: { id : idNum },  
    });  

    if (!tema) {  
      return NextResponse.json({ message: "Tema no encontrado" }, { status: 404 });  
    }  

    return NextResponse.json(tema);  
  } catch (error) {  
    console.error("Error obteniendo tema:", error);  
    return NextResponse.json(  
      { message: "Error obteniendo tema" },  
      { status: 500 }  
    );  
  }  
}  

export async function PUT(  
  req: NextRequest,  
  { params }: { params: Params }  
) {  
  const {id} = await params;  
const idNum = Number(id);

  if (isNaN(idNum)) {  
    return NextResponse.json({ error: "ID inválido" }, { status: 400 });  
  }  

  try {  
    const data = await req.json();  
    const { nombre, subCategoria, categoriaId } = data;  

    if (  
      nombre &&   
      (typeof nombre !== "string" ||  
      nombre.length > 20 ||  
      !/^[a-zA-ZáéíóúÁÉÍÓÚñÑ ]+$/.test(nombre))  
    ) {  
      return NextResponse.json(  
        { error: "Nombre inválido. Solo letras y espacios, max 20 caracteres." },  
        { status: 400 }  
      );  
    }  

    if (  
      subCategoria &&   
      (typeof subCategoria !== "string" ||  
       subCategoria.length > 20 ||  
       !/^[a-zA-ZáéíóúÁÉÍÓÚñÑ]+$/.test(subCategoria))  
    ) {  
      return NextResponse.json(  
        { error: "Subcategoría inválida. Sólo letras, max 20 caracteres."},  
        { status: 400 }  
      );  
    }  

    if (  
      categoriaId &&   
      (isNaN(Number(categoriaId)) || categoriaId === null)  
    ) {  
      return NextResponse.json(  
        { error: "CategoríaId inválido." },  
        { status: 400 }  
      );  
    }  

    // Opcional: verificar si la categoria existe si categoriaId cambia  
    if (categoriaId) {  
      const categoria = await prisma.categoria.findUnique({  
        where: { id: Number(categoriaId) },  
      });  
      if (!categoria) {  
        return NextResponse.json(  
          { error: "La categoría indicada no existe" },  
          { status: 404 }  
        );  
      }  
    }  

    const temaActualizado = await prisma.menuCategoria.update({  
      where: { id: idNum },  
      data,  
    });  

    return NextResponse.json(temaActualizado);  
  } catch (error) {  
    console.error("Error actualizando tema:", error);  
    return NextResponse.json(  
      { message: "Error actualizando tema" },  
      { status: 500 }  
    );  
  }  
}  

export async function DELETE(  
  req: NextRequest,  
  { params }: { params: Params }  
) {  
  const {id} = await params;  
const idNum = Number(id);

  if (isNaN(idNum)) {  
    return NextResponse.json({ error: "ID inválido" }, { status: 400 });  
  }  

  try {  
    // Inicia una transacción para eliminar los documentos, videos y el tema
    await prisma.$transaction([
      // Eliminar documentos asociados al tema
      prisma.documento.deleteMany({
        where: { temaId: idNum },
      }),

      // Eliminar videos asociados al tema
      prisma.video.deleteMany({
        where: { temaId: idNum },
      }),

      // Eliminar el tema
      prisma.menuCategoria.delete({
        where: { id: idNum },
      }),
    ]);



    return NextResponse.json({ message: "Tema eliminado" }, { status: 200 });  
  } catch (error) {  
    console.error("Error eliminando tema:", error);  
    return NextResponse.json(  
      { message: "Error eliminando tema" },  
      { status: 500 }  
    );  
  }  
}  