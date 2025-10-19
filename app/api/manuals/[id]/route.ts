import { NextResponse } from 'next/server'
import { prisma } from '@/app/lib/prisma'
import path from 'node:path'
import fs from 'node:fs/promises'

type Params = Promise<{ id: string }>

// Obtener manual específico
export async function GET (request: Request, { params }: { params: Params }) {
  const { id } = await params

  try {
    const decodedId = decodeURIComponent(id) // Decodifica caracteres especiales
    const filePath = path.join(
      process.cwd(),
      'public',
      'uploads',
      'manuales',
      decodedId
    )
    const file = await fs.readFile(filePath)

    return new NextResponse(file, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `inline; filename="${id}"`
      }
    })
  } catch (error) {
    return NextResponse.json(
      { message: 'Error obteniendo manual' },
      { status: 500 }
    )
  }
}

// Actualizar manual
export async function PUT (request: Request, { params }: { params: Params }) {
  const { id } = await params
  try {
    const data = await request.json()
    const manualActualizado = await prisma.manualEquipo.update({
      where: { id: Number(id) },
      data
    })

    return NextResponse.json(manualActualizado)
  } catch (error) {
    return NextResponse.json(
      { message: 'Error actualizando manual' },
      { status: 500 }
    )
  }
}

// Eliminar manual
export async function DELETE (request: Request, { params }: { params: Params }) {
  const { id } = await params
  try {
    await prisma.manualEquipo.delete({
      where: { id: Number(id) }
    })

    return NextResponse.json({ message: 'manual eliminado' }, { status: 200 })
  } catch (error) {
    return NextResponse.json(
      { message: 'Error eliminando manual' },
      { status: 500 }
    )
  }
}
