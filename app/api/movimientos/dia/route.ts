import { NextResponse, NextRequest } from "next/server";
import { prisma } from '@/app/lib/prisma';
import { startOfDay, endOfDay, setDate, addMonths } from 'date-fns';

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

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const fecha = searchParams.get("fecha"); // Ej: "2026-05-15"

    if (!fecha) {
      return NextResponse.json({ error: "Fecha inválida" }, { status: 400 });
    }

    // EL FIX DE ZONA HORARIA: Forzamos el mediodía para evitar saltos de día
    const dateObj = new Date(`${fecha}T12:00:00`); 

    if (await checkIsLocked(dateObj)) {
       return NextResponse.json({ error: "El mes de estos movimientos ya ha sido cerrado contablemente." }, { status: 403 });
    }

    // Ahora el inicio y fin del día serán consistentes
    const start = startOfDay(dateObj);
    const end = endOfDay(dateObj);

    const mesActual = start.getMonth() + 1;
    const anioActual = start.getFullYear();

    const movimientosABorrar = await prisma.movimiento.findMany({
      where: {
        fecha: {
          gte: start,
          lte: end
        }
      }
    });

    if (movimientosABorrar.length === 0) {
      return NextResponse.json({ message: "No hay movimientos" }, { status: 200 });
    }

    // EL FIX DEL TIMEOUT APLICADO AL DELETE
    await prisma.$transaction(async (tx) => {
      for (const mov of movimientosABorrar) {
        if (!mov.idInsumo) continue;

        const movMes = await tx.movimientosMes.findFirst({
           where: { idInsumo: mov.idInsumo, mes: mesActual, anio: anioActual }
        });
        
        if (movMes) {
           await tx.movimientosMes.update({
             where: { id: movMes.id },
             data: {
               stockModificable: { decrement: mov.balanceRetiros || 0 }
             }
           });
        }
      }

      await tx.movimiento.deleteMany({
        where: {
          id: { in: movimientosABorrar.map(m => m.id) }
        }
      });
    }, {
      // Damos 15 segundos de margen para borrar lotes pesados
      maxWait: 5000,
      timeout: 15000 
    });

    return NextResponse.json({ message: "Día limpiado exitosamente." }, { status: 200 });
  } catch (error) {
    console.error("Error en DELETE día:", error);
    return NextResponse.json({ message: "Error al borrar" }, { status: 500 });
  }
}
