import { NextResponse, NextRequest } from "next/server";
import { prisma } from '@/app/lib/prisma';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const comentarios = await prisma.comentarioInsumo.findMany({
      where: {
        idInsumo: id
      },
      orderBy: {
        fecha: 'desc'
      }
    });

    return NextResponse.json(comentarios);
  } catch (error) {
    console.error("Error obteniendo comentarios:", error);
    return NextResponse.json(
      { message: "Error al buscar comentarios" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const { texto } = await req.json();

    if (!texto || typeof texto !== "string" || texto.trim() === "") {
      return NextResponse.json({ error: "El comentario no puede estar vacío." }, { status: 400 });
    }

    const nuevoComentario = await prisma.comentarioInsumo.create({
      data: {
        texto: texto.trim(),
        idInsumo: id
      }
    });

    return NextResponse.json(nuevoComentario, { status: 201 });
  } catch (error) {
    console.error("Error creando comentario:", error);
    return NextResponse.json(
      { message: "Error creando comentario" },
      { status: 500 }
    );
  }
}
