import { NextResponse, NextRequest } from "next/server";
import {prisma}  from '@/app/lib/prisma';

type Params = Promise<{id: string}>;

function validarId(id: string) {
  if (!id || typeof id !== "string") {
    return { valido: false, idStr: undefined };
  }
  return { valido: true, idStr: id };
}

export async function GET(
  req: NextRequest,
  { params }: { params: Params }
) {
  const { id } = await params;
  const { valido, idStr } = validarId(id);

  if (!valido) {
    return NextResponse.json({ error: "ID inválido" }, { status: 400 });
  }

  try {
    const insumo = await prisma.insumo.findUnique({
      where: { id: idStr },
      include: {
        movimientos: true, // Inventarios mensuales eliminados
      }
    });

    if (!insumo) {
      return NextResponse.json(
        { message: "Insumo no encontrado" },
        { status: 404 }
      );
    }

    return NextResponse.json(insumo);
  } catch (error) {
    console.error("Error obteniendo insumo:", error);
    return NextResponse.json(
      { message: "Error obteniendo insumo" },
      { status: 500 }
    );
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Params }
) {
  const { id } = await params;
  const { valido, idStr } = validarId(id);

  if (!valido) {
    return NextResponse.json({ error: "ID inválido" }, { status: 400 });
  }

  try {
    const data = await req.json();
    const { codigo, nombre, activo, stockReferencia, stockActual, ultimoMesReset } = data;

    // Validación básica para evitar guardar data basura
    if (nombre !== undefined && (typeof nombre !== "string" || nombre.trim().length === 0)) {
        return NextResponse.json({ error: "Nombre inválido." }, { status: 400 });
    }

    if (codigo !== undefined && (typeof codigo !== "string" || codigo.trim().length === 0)) {
        return NextResponse.json({ error: "Código inválido." }, { status: 400 });
    }

    const insumoActualizado = await prisma.insumo.update({
      where: { id: idStr },
      data: {
        ...(codigo !== undefined && { codigo }),
        ...(nombre !== undefined && { nombre }),
        ...(activo !== undefined && { activo }),
        ...(stockReferencia !== undefined && { stockReferencia }),
        ...(stockActual !== undefined && { stockActual }),
        ...(ultimoMesReset !== undefined && { ultimoMesReset }),
      },
    });

    return NextResponse.json(insumoActualizado);
  } catch (error) {
    console.error("Error actualizando insumo:", error);
    return NextResponse.json(
      { message: "Error actualizando insumo" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Params }
) {
  const { id } = await params;
  const { valido, idStr } = validarId(id);

  if (!valido) {
    return NextResponse.json({ error: "ID inválido" }, { status: 400 });
  }

  try {
    await prisma.insumo.delete({ where: { id: idStr } });
    return NextResponse.json({ message: "Insumo eliminado" }, { status: 200 });
  } catch (error) {
    console.error("Error eliminando insumo:", error);
    return NextResponse.json(
      { message: "Error eliminando insumo" },
      { status: 500 }
    );
  }
}
