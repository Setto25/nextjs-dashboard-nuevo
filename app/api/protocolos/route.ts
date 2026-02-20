import { NextRequest, NextResponse } from "next/server";
import { prisma } from '@/app/lib/prisma';

// NOTA IMPORTANTE:
// Se eliminaron las importaciones de S3 (aws-sdk) porque este archivo solo consulta texto.
// No manipula archivos fisicos, por lo tanto, no necesita credenciales de Backblaze.

export async function GET(request: NextRequest) {
    try {
        // 1. OBTENCION DE PARAMETROS
        // El sistema lee lo que el usuario escribio en la barra de busqueda.
        const { searchParams } = new URL(request.url);
        const termino = searchParams.get('q') || '';      // Lo que se busca (ej: "reanimacion")
        const tipo = searchParams.get('tipo') || 'todos'; // Donde se busca (ej: "titulo" o "todos")

        // Objeto vacio donde se construira el filtro de Prisma
        let parametrosBusqueda: any = {};

        // 2. CONSTRUCCION DEL FILTRO (Logica de Busqueda)
        // Solo si el usuario escribio algo, se configura el filtro.
        if (termino) {
            // Se usa 'mode: insensitive' para que la busqueda ignore mayusculas y minusculas.
            // Asi encuentra "Manual" aunque se busque "manual".
            switch (tipo) {
                case 'titulo':
                    parametrosBusqueda = { titulo: { contains: termino, mode: 'insensitive' } };
                    break;
                case 'descripcion':
                    parametrosBusqueda = { descripcion: { contains: termino, mode: 'insensitive' } };
                    break;
                case 'categoria':
                    parametrosBusqueda = { categoria: { contains: termino, mode: 'insensitive' } }; 
                    break;
                case 'todos':
                default:
                    // Si es 'todos', busca coincidencias en cualquiera de las 3 columnas.
                    parametrosBusqueda = {
                        OR: [
                            { titulo: { contains: termino, mode: 'insensitive' } },
                            { descripcion: { contains: termino, mode: 'insensitive' } },
                            { categoria: { contains: termino, mode: 'insensitive' } }
                        ]
                    };
                    break;
            }
        }

        // 3. CONSULTA A LA BASE DE DATOS (Neon)
        // Prisma busca en la tabla 'Protocolo' usando los filtros definidos arriba.
        // Ordena los resultados para mostrar los mas recientes primero.
        const protocolos = await prisma.protocolo.findMany({
            where: parametrosBusqueda,
            orderBy: {
                fechaSubida: 'desc' 
            }
        });

        // 4. RESPUESTA AL CLIENTE
        // Se devuelve la lista encontrada en formato JSON.
        return NextResponse.json(protocolos);

    } catch (error) {
        console.error('Error al buscar protocolos:', error);
        return NextResponse.json(
            { message: "Error interno al buscar protocolos" },
            { status: 500 }
        );
    }
}