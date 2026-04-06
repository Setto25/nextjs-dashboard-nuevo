import { NextResponse, NextRequest } from "next/server";  
import {prisma}  from '@/app/lib/prisma';

export async function GET(req: NextRequest) {  
  try {  
    const { searchParams } = new URL(req.url);  
    const termino = searchParams.get("q") || "";  

    let insumos = await prisma.insumo.findMany({  
      where: {  
        OR: [  
          { nombre: { contains: termino } },  
          { codigo: { contains: termino } },  
        ],  
      },
      orderBy: {
        codigo: 'asc'
      }
    });  

    // Lógica de reseteo automático de mes
    const currentMonth = new Date().getMonth() + 1;

    // Detectar y actualizar los que están desfasados del mes calendario
    for (let i = 0; i < insumos.length; i++) {
      let insumo = insumos[i];
      if (insumo.ultimoMesReset !== currentMonth && insumo.activo) {
        const reseted = await prisma.insumo.update({
          where: { id: insumo.id },
          data: {
            stockActual: insumo.stockReferencia,
            ultimoMesReset: currentMonth
          }
        });
        insumos[i] = reseted;
      }
    }

    return NextResponse.json(insumos);  
  } catch (error) {  
    console.error("Error buscando insumos:", error);  
    return NextResponse.json(  
      { message: "Error al buscar insumos" },  
      { status: 500 }  
    );  
  }  
}  

export async function POST(req: NextRequest) {  
  try {  
    // Extraemos las nuevas propiedades pedidas
    const { codigo, nombre, stockReferencia } = await req.json();  

    // Validaciones
    if (!codigo || typeof codigo !== "string") {
      return NextResponse.json({ error: "Código inválido." }, { status: 400 });
    }
    if (!nombre || typeof nombre !== "string") {
      return NextResponse.json({ error: "Nombre inválido." }, { status: 400 });
    }
    if (stockReferencia === undefined || typeof stockReferencia !== "number") {
      return NextResponse.json({ error: "Stock Referencia inválido." }, { status: 400 });
    }

    const existente = await prisma.insumo.findUnique({  
      where: { codigo },  
    });  

    if (existente) {  
      return NextResponse.json(  
        { error: "Ya existe un insumo con ese código." },  
        { status: 409 }  
      );  
    }  

    const currentMonth = new Date().getMonth() + 1;

    const nuevoInsumo = await prisma.insumo.create({  
      data: { 
        codigo, 
        nombre, 
        stockReferencia,
        stockActual: stockReferencia, // Se establece inicialmente igual que el referencia superior
        ultimoMesReset: currentMonth
      },  
    });  

    return NextResponse.json(nuevoInsumo, { status: 201 });  
  } catch (error) {  
    console.error("Error creando insumo:", error);  
    return NextResponse.json(  
      { message: "Error creando insumo" },  
      { status: 500 }  
    );  
  }  
}  
