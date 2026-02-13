import { NextRequest, NextResponse } from "next/server";
import { S3Client} from "@aws-sdk/client-s3";
import {prisma}  from '@/app/lib/prisma';




// --- MÉTODO GET: Para buscar y listar libros ---
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const termino = searchParams.get('q') || '';
    const tipo = searchParams.get('tipo') || '';

    let parametrosBusqueda = {};

    switch (tipo) {
      case 'titulo':
        parametrosBusqueda = { titulo: { contains: termino, mode: 'insensitive' } };
        break;
      case 'descripcion':
        parametrosBusqueda = { descripcion: { contains: termino, mode: 'insensitive' } };
        break;
      case 'tema':
        parametrosBusqueda = { tema: { contains: termino, mode: 'insensitive' } };
        break;
      case 'categorias':
        parametrosBusqueda = { categorias: { contains: termino, mode: 'insensitive' } };
        break;
      case 'todos':
        parametrosBusqueda = {
          OR: [
            { categorias: { contains: termino, mode: 'insensitive' } },
            { descripcion: { contains: termino, mode: 'insensitive' } },
            { titulo: { contains: termino, mode: 'insensitive' } }
          ]
        };
        break;
      default:
        parametrosBusqueda = {};
    }
    console.log('PARAMETROS BUSQUEDA EN LIBROS ES', parametrosBusqueda);

    const libros = await prisma.libro.findMany({
      where: parametrosBusqueda,
      orderBy: {
        fechaSubida: 'desc'
      }
    });
    
    return NextResponse.json(libros);

  } catch (error) {
    console.error('❌ Error en GET /api/books:', error);
    return NextResponse.json(
      { message: "Error al buscar libros" },
      { status: 500 }
    );
  }
}


