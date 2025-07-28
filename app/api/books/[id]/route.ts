import { NextResponse } from 'next/server'
import { prisma } from '@/app/lib/prisma'
import path from 'node:path'
import fs from 'node:fs/promises'

type Params = Promise<{ id: string }>

// Obtener docuemnto específico
export async function GET (request: Request, { params }: { params: Params }) {
  const { id } = await params

  try {
    const filePath = path.join(process.cwd(), 'public', 'uploads', 'libros', id)

    // Lee el archivo PDF
    const file = await fs.readFile(filePath)

    // Devuelve el PDF como respuesta binaria
    return new NextResponse(file, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `inline; filename="${id}"`
      }
    })
  } catch (error) {
    return NextResponse.json(
      { message: 'Error obteniendo libro' },
      { status: 500 }
    )
  }
}

// Actualizar libro
export async function PUT (request: Request, { params }: { params: Params }) {
  const { id } = await params
  try {
    const data = await request.json()
    const libroActualizado = await prisma.libro.update({
      where: { id: Number(id) },
      data
    })

    return NextResponse.json(libroActualizado)
  } catch (error) {
    return NextResponse.json(
      { message: 'Error actualizando libro' },
      { status: 500 }
    )
  }
}

// Eliminar libro
export async function DELETE (request: Request, { params }: { params: Params }) {
  const { id } = await params
  try {
    await prisma.libro.delete({
      where: { id: Number(id) }
    })

    return NextResponse.json({ message: 'libro eliminado' }, { status: 200 })
  } catch (error) {
    return NextResponse.json(
      { message: 'Error eliminando libro' },
      { status: 500 }
    )
  }
}
