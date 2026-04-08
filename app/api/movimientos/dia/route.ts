import { NextResponse, NextRequest } from "next/server";
import { prisma } from '@/app/lib/prisma';
import { startOfDay, endOfDay, parseISO, setDate, addMonths } from 'date-fns';

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
    const fecha = searchParams.get("fecha"); 

    if (!fecha) {
      return NextResponse.json({ error: "Fecha inválida" }, { status: 400 });
    }

    const dateObj = parseISO(fecha);

    if (await checkIsLocked(dateObj)) {
       return NextResponse.json({ error: "El mes de estos movimientos ya ha sido cerrado contablemente." }, { status: 403 });
    }

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

    await prisma.$transaction(async (tx) => {
      // 1. Revertir stocks
      for (const mov of movimientosABorrar) {
        const movMes = await tx.movimientosMes.findFirst({
           where: { idInsumo: mov.idInsumo, mes: mesActual, anio: anioActual }
        });
        if (movMes) {
           await tx.movimientosMes.update({
             where: { id: movMes.id },
             data: {
               stockModificable: { decrement: mov.balanceRetiros }
             }
           });
        }
      }
      
      // 2. Eliminar de lote
      await tx.movimiento.deleteMany({
        where: {
          id: { in: movimientosABorrar.map(m => m.id) }
        }
      });
    });

    return NextResponse.json({ message: "Día limpiado exitosamente." }, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Error al borrar" }, { status: 500 });
  }
}
