import { NextResponse, NextRequest } from "next/server";  
import {prisma}  from '@/app/lib/prisma';

export async function GET(req: NextRequest) {  
  try {  
    const { searchParams } = new URL(req.url);  
    const termino = searchParams.get("q") || "";  

    // Busqueda sencilla que filtre coincidencias en nombre o categoria  
    const categorias = await prisma.categoria.findMany({  
      where: {  
        OR: [  
          { nombre: { contains: termino} },  
          { categoria: { contains: termino} },  
        ],  
      },  
      include: {
        menuCategorias: true, // Incluye las subcategorías relacionadas
    },  
     
    });  

    return NextResponse.json(categorias);  
  } catch (error) {  
    console.error("Error buscando categorías:", error);  
    return NextResponse.json(  
      { message: "Error al buscar categorías" },  
      { status: 500 }  
    );  
  }  
}  

export async function POST(req: NextRequest) {  
  try {  
    const { nombre, categoria } = await req.json();  

    // Validaciones backend  
    if (  
      !nombre ||  
      typeof nombre !== "string" ||  
      nombre.length > 20 ||  
      !/^[a-zA-ZáéíóúÁÉÍÓÚñÑ ]+$/.test(nombre)  
    ) {  
      return NextResponse.json(  
        { error: "Nombre inválido. Solo letras y espacios, max 20 chars." },  
        { status: 400 }  
      );  
    }  

    if (  
      !categoria ||  
      typeof categoria !== "string" ||  
      categoria.length > 20 ||  
      !/^[a-zA-ZáéíóúÁÉÍÓÚñÑ]+$/.test(categoria) // Sólo letras sin espacios ni especiales  
    ) {  
      return NextResponse.json(  
        { error: "Categoría inválida. Solo letras, max 20 chars." },  
        { status: 400 }  
      );  
    }  

    // Verificar duplicado (en name o categoria)  
    const existente = await prisma.categoria.findFirst({  
      where: {  
        OR: [{ nombre }, { categoria }],  
      },  
    });  

    if (existente) {  
      return NextResponse.json(  
        { error: "Ya existe una categoría con ese nombre o identificador." },  
        { status: 409 }  
      );  
    }  

    const nuevaCategoria = await prisma.categoria.create({  
      data: { nombre, categoria },  
    });  

    return NextResponse.json(nuevaCategoria, { status: 201 });  
  } catch (error) {  
    console.error("Error creando categoría:", error);  
    return NextResponse.json(  
      { message: "Error creando categoría" },  
      { status: 500 }  
    );  
  }  
}  