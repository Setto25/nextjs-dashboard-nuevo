import { NextResponse, NextRequest } from "next/server";  
import { prisma } from "@/app/lib/prisma";  

type Params = { id: string };  

export async function GET(  
  req: NextRequest,  
  { params }: { params: Params }  
) {  
  const { id } = params;  

  const idNum = Number(id);  

  if (isNaN(idNum)) {  
    return NextResponse.json({ error: "ID inválido" }, { status: 400 });  
  }  

  try {  
    const categoria = await prisma.categoria.findUnique({  
      where: { id: idNum },  
    });  

    if (!categoria) {  
      return NextResponse.json(  
        { message: "Categoría no encontrada" },  
        { status: 404 }  
      );  
    }  

    return NextResponse.json(categoria);  
  } catch (error) {  
    console.error("Error obteniendo categoría:", error);  
    return NextResponse.json(  
      { message: "Error obteniendo categoría" },  
      { status: 500 }  
    );  
  }  
}  

export async function PUT(  
  req: NextRequest,  
  { params }: { params: Params }  
) {  
  const { id } = params;  
  const idNum = Number(id);  

  if (isNaN(idNum)) {  
    return NextResponse.json({ error: "ID inválido" }, { status: 400 });  
  }  

  try {  
    const data = await req.json();  

    const { nombre, categoria } = data;  

    // Validaciones (igual que en POST)  
    if (  
      nombre &&  
      (typeof nombre !== "string" ||  
        nombre.length > 20 ||  
        !/^[a-zA-ZáéíóúÁÉÍÓÚñÑ ]+$/.test(nombre))  
    ) {  
      return NextResponse.json(  
        { error: "Nombre inválido. Sólo letras y espacios, max 20 chars." },  
        { status: 400 }  
      );  
    }  

    if (  
      categoria &&  
      (typeof categoria !== "string" ||  
        categoria.length > 20 ||  
        !/^[a-zA-ZáéíóúÁÉÍÓÚñÑ]+$/.test(categoria))  
    ) {  
      return NextResponse.json(  
        { error: "Categoría inválida. Sólo letras, max 20 chars." },  
        { status: 400 }  
      );  
    }  

    // Opcional: verificar duplicados distintos al que estamos editando  
    // Para simplificar no lo hago aquí, pero se puede agregar  

    const categoriaActualizada = await prisma.categoria.update({  
      where: { id: idNum },  
      data,  
    });  

    return NextResponse.json(categoriaActualizada);  
  } catch (error) {  
    console.error("Error actualizando categoría:", error);  
    return NextResponse.json(  
      { message: "Error actualizando categoría" },  
      { status: 500 }  
    );  
  }  
}  

export async function DELETE(  
  req: NextRequest,  
  { params }: { params: Params }  
) {  
  const { id } = params;  
  const idNum = Number(id);  

  if (isNaN(idNum)) {  
    return NextResponse.json({ error: "ID inválido" }, { status: 400 });  
  }  

  try {  
    await prisma.categoria.delete({ where: { id: idNum } });  
    return NextResponse.json({ message: "Categoría eliminada" }, { status: 200 });  
  } catch (error) {  
    console.error("Error eliminando categoría:", error);  
    return NextResponse.json(  
      { message: "Error eliminando categoría" },  
      { status: 500 }  
    );  
  }  
}  