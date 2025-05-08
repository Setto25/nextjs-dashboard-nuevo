import { NextRequest, NextResponse } from "next/server";  
import { prisma } from "@/app/lib/prisma";  

export async function GET(req: NextRequest) {  
  try {  
    const { searchParams } = new URL(req.url);  
    const termino = searchParams.get("q") || "";  
    const categoriaId = searchParams.get("categoriaId");  

    // Si categoriaId viene buscamos solo temas de esa categoría  
    const filtro: any = {};  
    if (categoriaId) {  
      filtro.categoriaId = Number(categoriaId);  
    }  

    if (termino) {  
      filtro.OR = [  
        { nombre: { contains: termino} },  
        { subCategoria: { contains: termino} },  
      ];  
    }  

    const temas = await prisma.menuCategoria.findMany({  
      where: filtro,  
    });  

    return NextResponse.json(temas);  
  } catch (error) {  
    console.error("Error al cargar temas:", error);  
    return NextResponse.json(  
      { message: "Error al cargar temas" },  
      { status: 500 }  
    );  
  }  
}  

export async function POST(req: NextRequest) {  
  try {  
    const { nombre, subCategoria, categoriaId } = await req.json();  

    // Validaciones básicas  
    if (  
      !nombre ||  
      typeof nombre !== "string" ||  
      nombre.length > 20 ||  
      !/^[a-zA-ZáéíóúÁÉÍÓÚñÑ ]+$/.test(nombre)  
    ) {  
      return NextResponse.json(  
        { error: "Nombre inválido. Sólo letras y espacios, max 20 chars." },  
        { status: 400 }  
      );  
    }  

    if (  
      !subCategoria ||  
      typeof subCategoria !== "string" ||  
      subCategoria.length > 20 ||  
      !/^[a-zA-ZáéíóúÁÉÍÓÚñÑ]+$/.test(subCategoria)  
    ) {  
      return NextResponse.json(  
        { error: "Subcategoría inválida. Sólo letras, max 20 chars." },  
        { status: 400 }  
      );  
    }  

    if (!categoriaId || isNaN(Number(categoriaId))) {  
      return NextResponse.json(  
        { error: "CategoríaId inválido o no proporcionado." },  
        { status: 400 }  
      );  
    }  

    // Verificar duplicados  
    const existente = await prisma.menuCategoria.findFirst({  
      where: {  
        OR: [{ nombre }, { subCategoria }],  
      },  
    });  
    if (existente) {  
      return NextResponse.json(  
        { error: "Ya existe un tema con ese nombre o subcategoría." },  
        { status: 409 }  
      );  
    }  

    // Verificar que categoria exista  
    const categoria = await prisma.categoria.findUnique({  
      where: { id: Number(categoriaId) },  
    });  
    if (!categoria) {  
      return NextResponse.json(  
        { error: "La categoría indicada no existe." },  
        { status: 404 }  
      );  
    }  

    const nuevoTema = await prisma.menuCategoria.create({  
      data: {  
        nombre,  
        subCategoria,  
        categoriaId: Number(categoriaId),  
      },  
    });  

    return NextResponse.json(nuevoTema, { status: 201 });  
  } catch (error) {  
    console.error("Error creando tema:", error);  
    return NextResponse.json(  
      { message: "Error creando tema" },  
      { status: 500 }  
    );  
  }  
}  