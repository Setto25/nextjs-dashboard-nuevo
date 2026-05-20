import { NextResponse, NextRequest } from 'next/server';
import { prisma } from '@/app/lib/prisma';

export const runtime = 'nodejs';

export async function GET(req: NextRequest) {
  // 1. Validar sesión y rol del usuario
  const sessionCookie = req.cookies.get('session');
  if (!sessionCookie) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }

  try {
    const session = JSON.parse(sessionCookie.value);
    if (session.role !== 'super_admin') {
      return NextResponse.json(
        { error: 'Acceso denegado: Se requieren permisos de super administrador.' },
        { status: 403 }
      );
    }

    // 2. Extraer parámetros de búsqueda
    const { searchParams } = new URL(req.url);
    const query = searchParams.get('q') || '';
    const modulo = searchParams.get('modulo') || '';
    const accion = searchParams.get('accion') || '';
    const limite = parseInt(searchParams.get('limite') || '100', 10);

    // 3. Consultar los logs
    const logs = await prisma.auditLog.findMany({
      where: {
        AND: [
          modulo ? { modulo } : {},
          accion ? { accion } : {},
          query
            ? {
                OR: [
                  { rut: { contains: query, mode: 'insensitive' } },
                  { nombre: { contains: query, mode: 'insensitive' } },
                  { email: { contains: query, mode: 'insensitive' } },
                  { detalles: { contains: query, mode: 'insensitive' } }
                ]
              }
            : {}
        ]
      },
      orderBy: {
        fecha: 'desc'
      },
      take: Math.min(limite, 500) // Evitar cargas masivas de memoria
    });

    return NextResponse.json(logs);
  } catch (error) {
    console.error('Error al consultar logs de auditoría:', error);
    return NextResponse.json(
      { error: 'Error interno al consultar la bitácora.' },
      { status: 500 }
    );
  }
}
