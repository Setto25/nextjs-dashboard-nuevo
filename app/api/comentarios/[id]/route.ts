import { NextResponse, NextRequest } from "next/server";
import { prisma } from '@/app/lib/prisma';

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    
    await prisma.comentarioInsumo.delete({
      where: { id }
    });
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error eliminando comentario:", error);
    return NextResponse.json(
      { message: "Error al eliminar comentario" },
      { status: 500 }
    );
  }
}
