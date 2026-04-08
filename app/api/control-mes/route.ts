import { NextResponse, NextRequest } from "next/server";
import { prisma } from '@/app/lib/prisma';

export async function POST(req: NextRequest) {
  try {
    const { mes, anio, desbloqueado } = await req.json();

    if (mes === undefined || anio === undefined || typeof desbloqueado !== "boolean") {
      return NextResponse.json({ error: "Datos inválidos" }, { status: 400 });
    }

    const res = await prisma.controlMes.upsert({
      where: {
        mes_anio: {
          mes: Number(mes),
          anio: Number(anio)
        }
      },
      update: {
        desbloqueado
      },
      create: {
        mes: Number(mes),
        anio: Number(anio),
        desbloqueado
      }
    });

    return NextResponse.json(res, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Error de servidor en control de mes" }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const mes = searchParams.get('mes');
    const anio = searchParams.get('anio');
    if (!mes || !anio) return NextResponse.json({ error: "Faltan params" }, { status: 400 });

    const c = await prisma.controlMes.findUnique({
      where: {
        mes_anio: {
          mes: Number(mes),
          anio: Number(anio)
        }
      }
    });

    // Si no existe el registro de desbloqueado explícitamente, por defecto está false
    return NextResponse.json(c || { mes: Number(mes), anio: Number(anio), desbloqueado: false }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: "Error buscando el control de mes" }, { status: 500 });
  }
}
