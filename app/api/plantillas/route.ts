import { NextRequest, NextResponse } from "next/server";
import { prisma } from '@/app/lib/prisma';

// -------------------------------------------------------------------------
// API BUSCADOR DE PLANTILLAS (GET)
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
    // Si existe un termino de busqueda, se configura el filtro segun el tipo seleccionado.
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
            case 'categoria':
                parametrosBusqueda = { categoria: { contains: termino, mode: 'insensitive' } };
                break;
            case 'palabrasClave':
                parametrosBusqueda = { palabrasClave: { contains: termino, mode: 'insensitive' } };
                break;
            case 'todos': 
                   // Busqueda general: busca coincidencias en titulo, descripcion o categoria.
                parametrosBusqueda = {
                         OR: [
                        { categoria: { contains: termino, mode: 'insensitive' } },
                        { descripcion: { contains: termino, mode: 'insensitive' } },
                        { titulo: { contains: termino, mode: 'insensitive' } },
                        { tema: { contains: termino, mode: 'insensitive' } }
                    ]
                };
                break;

            case 'mostrarTodo':
               
                parametrosBusqueda = {
              
                };
                break;
                
            default:
                // Busqueda general: busca coincidencias en titulo, descripcion o categoria.
                parametrosBusqueda = {
                    OR: [
                        { categoria: { contains: termino, mode: 'insensitive' } },
                        { descripcion: { contains: termino, mode: 'insensitive' } },
                        { titulo: { contains: termino, mode: 'insensitive' } },
                        { tema: { contains: termino, mode: 'insensitive' } }
                    ]
                };
                break;
        }
    }

    // 3. CONSULTA A PRISMA
    // Se ejecuta la busqueda ordenando por fecha de subida (mas recientes primero).
    const resultados = await prisma.plantilla.findMany({
        where: parametrosBusqueda,
        orderBy: {
            fechaSubida: 'asc',
        },
    });

    // 4. RESPUESTA
    // Se devuelve la lista de plantillas al Frontend.
    return NextResponse.json(resultados);

  } catch (error) {
    console.error('Error buscando plantillas:', error);
    return NextResponse.json({ message: 'Error interno del servidor' }, { status: 500 });
  }
}