import { NextResponse, NextRequest } from "next/server";
import { prisma } from '@/app/lib/prisma';
import { setDate, addMonths } from 'date-fns';

// Esto es para saber si el mes ya se pasó de la fecha límite (día 5 del mes siguiente)
// Si está bloqueado, nadie puede crear movimientos a menos que esté "desbloqueado" en la tabla controlMes
async function checkIsLocked(fechaTarget: Date) {
  const hoy = new Date();
  const mesTarget = fechaTarget.getMonth() + 1;
  const anioTarget = fechaTarget.getFullYear();

  // El limite es el final del día 5 del próximo mes
  const deadline = setDate(addMonths(new Date(anioTarget, mesTarget - 1, 1), 1), 6);
  
  if (hoy > deadline) {
    const c = await prisma.controlMes.findUnique({
       where: { mes_anio: { mes: mesTarget, anio: anioTarget } }
    });
    // Si no hay registro o no está desbloqueado explícitamente, bloqueamos.
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

    // Validaciones básicas de seguridad
    if (!idInsumo || typeof idInsumo !== "string") {
      return NextResponse.json({ error: "Insumo ID inválido." }, { status: 400 });
    }
    if (balanceRetiros === undefined || typeof balanceRetiros !== "number") {
      return NextResponse.json({ error: "Balance inválido. Debe ser un número." }, { status: 400 });
    }

    const fechaMovimiento = fecha ? new Date(fecha) : new Date();
    
    // Primero veo si puedo o no escribir en esta fecha
    if (await checkIsLocked(fechaMovimiento)) {
       return NextResponse.json({ error: "El mes de este retiro ya fue cerrado contablemente." }, { status: 403 });
    }

    const mesActual = fechaMovimiento.getMonth() + 1;
    const anioActual = fechaMovimiento.getFullYear();

    // Uso una transacción para que, si falla al actualizar el stock, no se cree el movimiento (todo o nada)
    const resultado = await prisma.$transaction(async (tx) => {
      // 1. Registro el movimiento (retiro o devolución)
      const nuevoMovimiento = await tx.movimiento.create({
        data: {
          idInsumo,
          balanceRetiros,
          fecha: fechaMovimiento,
        }
      });

      // 2. Busco el stock de este mes en específico
      let movMes = await tx.movimientosMes.findFirst({
        where: { idInsumo, mes: mesActual, anio: anioActual }
      });

      // Si es la primera vez que se toca este insumo en este mes, inicializo su stock mensual
      if (!movMes) {
        const insumoRef = await tx.insumo.findUnique({ 
            where: { id: idInsumo },
            include: {
              movimientos: {
                // Filtro movimientos solo de este año para calcular el saldo anual
                where: { fecha: { gte: new Date(anioActual, 0, 1), lt: new Date(anioActual + 1, 0, 1) } }
              }
            }
        });
        
        let stockBase = 0;
        if (insumoRef) {
           const sumBalance = insumoRef.movimientos.reduce((a, b) => a + (b.balanceRetiros || 0), 0);
           const stockAnualRestante = (insumoRef.stockOriginal || 0) + sumBalance; 
           const baseNormal = Math.floor((insumoRef.stockOriginal || 0) / 12);
           
           if (mesActual === 12) {
               // En diciembre, permito sacar todo lo que quede del año para no dejar sobras
               stockBase = Math.max(0, stockAnualRestante);
           } else {
               // Normalmente la cuota es fija (1/12), pero no puede pasarse de lo que queda real
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

      // 3. Finalmente actualizo el stock disponible para este mes (+ o -)
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
