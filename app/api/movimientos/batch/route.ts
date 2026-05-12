import { NextResponse, NextRequest } from "next/server";
import { prisma } from '@/app/lib/prisma';
import { setDate, addMonths } from 'date-fns';

async function checkIsLocked(fechaTarget: Date) {
  const hoy = new Date();
  const mesTarget = fechaTarget.getMonth() + 1;
  const anioTarget = fechaTarget.getFullYear();

  const deadline = setDate(addMonths(new Date(anioTarget, mesTarget - 1, 1), 1), 6);
  
  if (hoy > deadline) {
    const c = await prisma.controlMes.findUnique({
       where: { mes_anio: { mes: mesTarget, anio: anioTarget } }
    });
    if (!c || !c.desbloqueado) return true;
  }
  return false;
}

export async function POST(req: NextRequest) {
  try {
    const { movimientos } = await req.json();

    if (!movimientos || !Array.isArray(movimientos) || movimientos.length === 0) {
      return NextResponse.json({ error: "No hay movimientos para procesar." }, { status: 400 });
    }

    // Usamos una transacción para guardar todo de una vez
    const resultado = await prisma.$transaction(async (tx) => {
      const creados = [];

      for (const mov of movimientos) {
        const { idInsumo, balanceRetiros, fecha } = mov;
        
        if (!idInsumo || typeof balanceRetiros !== "number") {
          throw new Error(`Datos inválidos en uno de los movimientos.`);
        }

        const fechaMovimiento = fecha ? new Date(fecha) : new Date();
        
        if (await checkIsLocked(fechaMovimiento)) {
           throw new Error("El mes de uno de los retiros ya fue cerrado contablemente.");
        }

        const mesActual = fechaMovimiento.getMonth() + 1;
        const anioActual = fechaMovimiento.getFullYear();

        // 1. Registro el movimiento
        const nuevoMovimiento = await tx.movimiento.create({
          data: {
            idInsumo,
            balanceRetiros,
            fecha: fechaMovimiento,
          }
        });

        // 2. Busco o creo el stock mensual
        let movMes = await tx.movimientosMes.findFirst({
          where: { idInsumo, mes: mesActual, anio: anioActual }
        });

        if (!movMes) {
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
             const sumBalance = insumoRef.movimientos.reduce((a: any, b: any) => a + (b.balanceRetiros || 0), 0);
             const stockAnualRestante = (insumoRef.stockOriginal || 0) + sumBalance; 
             const baseNormal = Math.floor((insumoRef.stockOriginal || 0) / 12);
             
             if (mesActual === 12) {
                 stockBase = Math.max(0, stockAnualRestante);
             } else {
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

        // 3. Actualizo el stock mensual
        await tx.movimientosMes.update({
          where: { id: movMes.id },
          data: {
            stockModificable: { increment: balanceRetiros }
          }
        });

        creados.push(nuevoMovimiento);
      }

      return creados;
    });

    return NextResponse.json(resultado, { status: 201 });
  } catch (error: any) {
    console.error("Error registrando movimientos en lote:", error);
    return NextResponse.json(
      { error: error.message || "Error procesando los cambios." },
      { status: 500 }
    );
  }
}
