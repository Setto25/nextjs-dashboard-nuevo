import { NextRequest, NextResponse } from "next/server";
import { prisma } from '@/app/lib/prisma';

// -------------------------------------------------------------------------
// API BUSCADOR DE DOCUMENTOS (GET)
// -------------------------------------------------------------------------
// Este archivo solo se encarga de leer texto de la base de datos.
// No requiere configuracion de S3 ni credenciales de Backblaze.

export async function GET(request: NextRequest) {
  try {
    // 1. OBTENCION DE PARAMETROS
    // El sistema lee la URL para saber que esta buscando el usuario.
    const { searchParams } = new URL(request.url);
    const termino = searchParams.get('q') || '';
    const tipo = searchParams.get('tipo') || '';

    let parametrosBusqueda: any = {};

    // 2. CONFIGURACION DEL FILTRO
    // Se define en que columnas buscar dependiendo de la seleccion del usuario.
    if (termino) {
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
            default:
                // Busqueda general: el sistema busca coincidencias en cualquiera de estos campos.
                parametrosBusqueda = {
                    OR: [
                        { categorias: { contains: termino, mode: 'insensitive' } },
                        { descripcion: { contains: termino, mode: 'insensitive' } },
                        { titulo: { contains: termino, mode: 'insensitive' } }
                    ]
                };
                break;
        }
    }

    // 3. CONSULTA A PRISMA
    // Se ejecuta la busqueda ordenando por fecha de subida (mas recientes primero).
    const documentos = await prisma.documento.findMany({
        where: parametrosBusqueda,
        orderBy: {
            fechaSubida: 'desc'
        },
        // Se incluye la relacion con MenuCategoria para mostrar datos extra si es necesario.
        include: { menuCategoria: true }
    });

    // 4. RESPUESTA
    // Se devuelve la lista de documentos al Frontend.
    return NextResponse.json(documentos);

  } catch (error) {
    console.error('Error al buscar documentos:', error);
    return NextResponse.json(
      { message: "Error al buscar documentos" },
      { status: 500 }
    );
  }
}