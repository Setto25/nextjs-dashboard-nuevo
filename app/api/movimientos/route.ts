import { NextResponse, NextRequest } from "next/server";
import { prisma } from '@/app/lib/prisma';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const insumoId = searchParams.get("insumoId");

    const movimientos = await prisma.movimiento.findMany({
      where: {
        ...(insumoId ? { insumoId } : {}),
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
    const { insumoId, cantidad, tipo, fecha } = await req.json();

    // Validaciones
    if (!insumoId || typeof insumoId !== "string") {
      return NextResponse.json({ error: "Insumo ID inválido." }, { status: 400 });
    }
    if (!cantidad || typeof cantidad !== "number" || cantidad <= 0) {
      return NextResponse.json({ error: "Cantidad inválida. Debe ser un número mayor a 0." }, { status: 400 });
    }
    if (tipo !== "INGRESO" && tipo !== "RETIRO") {
      return NextResponse.json({ error: "Tipo de movimiento inválido (Debe ser INGRESO o RETIRO)." }, { status: 400 });
    }

    const fechaMovimiento = fecha ? new Date(fecha) : new Date();

    // Transacción para asegurar la consistencia del stock del insumo
    const resultado = await prisma.$transaction(async (tx) => {
      // 1. Crear el movimiento
      const nuevoMovimiento = await tx.movimiento.create({
        data: {
          insumoId,
          cantidad,
          tipo,
          fecha: fechaMovimiento,
        }
      });

      const factor = tipo === "INGRESO" ? cantidad : -cantidad;

      // 2. Modificar el stock actual del Insumo
      await tx.insumo.update({
        where: { id: insumoId },
        data: {
          stockActual: { increment: factor } // Usa el operador atómico
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
