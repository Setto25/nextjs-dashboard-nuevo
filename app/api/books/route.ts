import { NextRequest, NextResponse } from "next/server";
import { prisma } from '@/app/lib/prisma';

// -------------------------------------------------------------------------
// API BUSCADOR DE LIBROS (GET)
// -------------------------------------------------------------------------
// Este archivo NO necesita S3 (Backblaze) porque solo lee texto de la base de datos.
// Se elimino la importacion de @aws-sdk para mantener el codigo limpio.

export async function GET(request: NextRequest) {
  try {
    // 1. OBTENCION DE PARAMETROS
    // El sistema captura lo que el usuario escribio en la barra de busqueda.
    const { searchParams } = new URL(request.url);
    const termino = searchParams.get('q') || '';
    const tipo = searchParams.get('tipo') || '';

    let parametrosBusqueda: any = {};

    // 2. LOGICA DE FILTRADO
    // Se decide en que columna de la base de datos buscar segun lo que eligio el usuario.
    switch (tipo) {
      case 'titulo':
        // 'mode: insensitive' permite encontrar "Titulo" aunque se busque "titulo"
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
      default:
        // Si busca en 'todos', el sistema busca coincidencias en cualquiera de estas 3 columnas.
        parametrosBusqueda = {
          OR: [
            { categorias: { contains: termino, mode: 'insensitive' } },
            { descripcion: { contains: termino, mode: 'insensitive' } },
            { titulo: { contains: termino, mode: 'insensitive' } }
          ]
        };
        break;
    }

    // Solo para depuracion en consola del servidor (se puede borrar despues)
    console.log('PARAMETROS BUSQUEDA EN LIBROS ES', parametrosBusqueda);

    // 3. CONSULTA A LA BASE DE DATOS
    // Prisma ejecuta la busqueda y ordena los resultados por fecha (mas nuevos primero).
    const libros = await prisma.libro.findMany({
      where: parametrosBusqueda,
      orderBy: {
        fechaSubida: 'desc'
      }
    });
    
    // 4. RESPUESTA
    // Se devuelven los libros encontrados al Frontend.
    return NextResponse.json(libros);

  } catch (error) {
    // Manejo de errores para evitar caidas del servidor.
    console.error('❌ Error en GET /api/books:', error);
    return NextResponse.json(
      { message: "Error al buscar libros" },
      { status: 500 }
    );
  }
}