import { NextResponse, NextRequest } from "next/server";
import { prisma } from '@/app/lib/prisma';
import { setDate, addMonths } from 'date-fns';

async function checkIsLocked(fechaTarget: Date) {
  const hoy = new Date();
  const mesTarget = fechaTarget.getMonth() + 1;
  const anioTarget = fechaTarget.getFullYear();

  // El limite es el final del día 5 del próximo mes (indicado aquí como saltar al día 6 a las 00:00 local)
  const deadline = setDate(addMonths(new Date(anioTarget, mesTarget - 1, 1), 1), 6);
  
  if (hoy > deadline) {
    const c = await prisma.controlMes.findUnique({
       where: { mes_anio: { mes: mesTarget, anio: anioTarget } }
    });
    if (!c || !c.desbloqueado) return true;
  }
  return false;
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const idInsumo = searchParams.get("idInsumo");

    const movimientos = await prisma.movimiento.findMany({
      where: {
        ...(idInsumo ? { idInsumo } : {}),
      },
      include: {
        insumo: true
      },
      orderBy: {
        fecha: 'desc'
      }
    });

    return NextResponse.json(movimientos);
  } catch (error) {
    console.error("Error obteniendo movimientos:", error);
    return NextResponse.json(
      { message: "Error al buscar movimientos" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const { idInsumo, balanceRetiros, fecha } = await req.json();

    // Validaciones
    if (!idInsumo || typeof idInsumo !== "string") {
      return NextResponse.json({ error: "Insumo ID inválido." }, { status: 400 });
    }
    if (balanceRetiros === undefined || typeof balanceRetiros !== "number") {
      return NextResponse.json({ error: "Balance inválido. Debe ser un número." }, { status: 400 });
    }

    const fechaMovimiento = fecha ? new Date(fecha) : new Date();
    
    // Check de bloqueo
    if (await checkIsLocked(fechaMovimiento)) {
       return NextResponse.json({ error: "El mes de este retiro ya fue cerrado contablemente." }, { status: 403 });
    }

    const mesActual = fechaMovimiento.getMonth() + 1;
    const anioActual = fechaMovimiento.getFullYear();

    // Transacción para asegurar la consistencia del stock del insumo
    const resultado = await prisma.$transaction(async (tx) => {
      // 1. Crear el movimiento
      const nuevoMovimiento = await tx.movimiento.create({
        data: {
          idInsumo,
          balanceRetiros,
          fecha: fechaMovimiento,
        }
      });

      // 2. Modificar el stock en MovimientosMes
      let movMes = await tx.movimientosMes.findFirst({
        where: { idInsumo, mes: mesActual, anio: anioActual }
      });

      if (!movMes) {
        // Encontrar stockOriginal del Insumo base e historial para amortiguar sobregiros de meses previos
        const insumoRef = await tx.insumo.findUnique({ 
            where: { id: idInsumo },
            include: {
              movimientos: {
                where: { fecha: { gte: new Date(anioActual, 0, 1), lt: new Date(anioActual + 1, 0, 1) } }
              }
            }
        });
        
        let stockBase = 0;
        if (insumoRef) {
// Suma de retiros
const sumBalance = insumoRef.movimientos.reduce((a, b) => a + (b.balanceRetiros || 0), 0);

// Stock anual (Protegemos stockOriginal también)
const stockAnualRestante = (insumoRef.stockOriginal || 0) + sumBalance; 

// Base normal (Protegemos stockOriginal para la división)
const baseNormal = Math.floor((insumoRef.stockOriginal || 0) / 12);
           
           if (mesActual === 12) {
               // Diciembre absorbe TODO el saldo anual restante físico para forzar el conteo a 0
               stockBase = Math.max(0, stockAnualRestante);
           } else {
               // Ruta A: Siempre la división rígida lineal, pero topado al total físico
               stockBase = Math.min(baseNormal, Math.max(0, stockAnualRestante));
           }
        }
        
        movMes = await tx.movimientosMes.create({
          data: {
            idInsumo,
            mes: mesActual,
            anio: anioActual,
            stockAjustado: stockBase,
            stockModificable: stockBase
          }
        });
      }

      await tx.movimientosMes.update({
        where: { id: movMes.id },
        data: {
          stockModificable: { increment: balanceRetiros }
        }
      });

      return nuevoMovimiento;
    });

    return NextResponse.json(resultado, { status: 201 });
  } catch (error) {
    console.error("Error registrando movimiento:", error);
    return NextResponse.json(
      { message: "Error registrando movimiento" },
      { status: 500 }
    );
  }
}
