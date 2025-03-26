import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function GET() {
  const sessionCookie = (await cookies()).get('session');

  if (!sessionCookie) {
    return NextResponse.json(
      { error: 'Cookie de sesión no encontrada' },
      { status: 401 }
    );
  }

  try {
    const session = JSON.parse(sessionCookie.value);

    if (!session.email) {
      return NextResponse.json(
        { error: 'Sesión inválida' },
        { status: 401 }
      );
    }

    return NextResponse.json({
      id: session.id,
      email: session.email,
      role: session.role,
    });
  } catch (error) {
    console.error('Error al procesar la cookie:', error);
    return NextResponse.json(
      { error: 'Error al procesar la cookie' },
      { status: 500 }
    );
  }
}