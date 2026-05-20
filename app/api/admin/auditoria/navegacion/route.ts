import { NextResponse, NextRequest } from 'next/server';
import { registrarLog } from '@/app/lib/audit';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  // Validar sesión activa
  const sessionCookie = req.cookies.get('session');
  if (!sessionCookie) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }

  try {
    const { ruta } = await req.json();

    if (!ruta || typeof ruta !== 'string') {
      return NextResponse.json({ error: 'Ruta inválida' }, { status: 400 });
    }

    // Registrar el acceso de página de forma asíncrona (no bloqueante)
    await registrarLog(req, 'ACCESO_PAGINA', 'NAVEGACION', { ruta });

    return NextResponse.json({ success: true }, { status: 201 });
  } catch (error) {
    console.error('Error al registrar navegación en API:', error);
    return NextResponse.json(
      { error: 'Error interno de auditoría de navegación' },
      { status: 500 }
    );
  }
}
