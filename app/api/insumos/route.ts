import { NextResponse, NextRequest } from "next/server";  
import {prisma}  from '@/app/lib/prisma';

export async function GET(req: NextRequest) {  
  try {  
    const { searchParams } = new URL(req.url);  
    const termino = searchParams.get("q") || "";  
    const strMes = searchParams.get("mes");
    const strAnio = searchParams.get("anio");
    const verInactivos = searchParams.get("inactivos") === "true";
    const currentMonth = strMes ? parseInt(strMes) : new Date().getMonth() + 1;
    const currentYear = strAnio ? parseInt(strAnio) : new Date().getFullYear();

    let insumos = await prisma.insumo.findMany({  
      where: {  
        activo: verInactivos ? undefined : true,
        OR: [  
          { nombre: { contains: termino } },  
          { codigo: { contains: termino } },  
        ],  
      },
      orderBy: {
        codigo: 'asc'
      },
      include: {
        movimientosMes: {
          where: {
            mes: currentMonth,
            anio: currentYear
          }
        },
        movimientos: {
          where: {
            fecha: {
              gte: new Date(currentYear, 0, 1),
              lt: new Date(currentYear + 1, 0, 1)
            }
          }
        }
      }
    });

    const procesados = insumos.map(ins => {
// CÓDIGO NUEVO (A prueba de balas....coaecencia nula)
const sumBalance = ins.movimientos.reduce((a, b) => a + (b.balanceRetiros || 0), 0);
const stockAnualRestante = (ins.stockOriginal || 0) + sumBalance;
      
      let limiteProyectadoMes = currentMonth === 12 
            ? Math.max(0, stockAnualRestante) // Diciembre se lleva fisicamente el saldo real restante
            : Math.min(Math.floor(ins.stockOriginal / 12), Math.max(0, stockAnualRestante));

      return {
         ...ins,
         stockAnualRestante,
         limiteProyectadoMes,
         movimientos: undefined
      };
    });

    return NextResponse.json(procesados);  
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
    const { codigo, nombre, stockOriginal } = await req.json();  

    // Validaciones
    if (!codigo || typeof codigo !== "string") {
      return NextResponse.json({ error: "Código inválido." }, { status: 400 });
    }
    if (!nombre || typeof nombre !== "string") {
      return NextResponse.json({ error: "Nombre inválido." }, { status: 400 });
    }
    if (stockOriginal === undefined || typeof stockOriginal !== "number") {
      return NextResponse.json({ error: "Stock Original inválido." }, { status: 400 });
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

    const nuevoInsumo = await prisma.insumo.create({  
      data: { 
        codigo, 
        nombre, 
        stockOriginal,
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
