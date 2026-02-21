import { NextResponse, NextRequest } from 'next/server'

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/admin/:path*',
    '/api((?!/autenticacion).*)' // Ejecutar en todas las rutas excepto /login
  ]
}

export async function middleware (request: NextRequest) {
  // Obtener la cookie de sesión
  const sessionCookie = request.cookies.get('session')

  if (!sessionCookie || sessionCookie === null) {
    // Construir una redirección segura
    const baseUrl = request.nextUrl.origin
    return NextResponse.redirect(`${baseUrl}/`)
  }

  // Verificar la sesión
  try {
    const session = JSON.parse(sessionCookie.value)

    if (!session.email) {
      return NextResponse.redirect(new URL('/', request.url))
    }

    // Proteger rutas de admin
    if (
      request.nextUrl.pathname.endsWith('/admin') &&
      session.role !== 'admin'
    ) {
      return new NextResponse(
        'Acceso denegado: No tienes permisos para ver esta página.',
        {
          status: 403
        }
      )
    }

    // --- AQUÍ ESTÁ LA MAGIA DE LA RENOVACIÓN ---
    // 1. En lugar de retornar directo, guardamos la respuesta
    const response = NextResponse.next()

    // 2. Calculamos la nueva fecha de vencimiento (1 hora desde ESTE momento)
    const expires = new Date()
    expires.setHours(expires.getHours() + 1)

    // 3. Sobreescribimos la cookie actual con el nuevo tiempo
    response.cookies.set('session', sessionCookie.value, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      expires: expires,
      path: '/',
      sameSite: 'lax',
    })

    // 4. Devolvemos la respuesta ya actualizada
    return response

  } catch (error) {
    return NextResponse.redirect(new URL('/', request.url)) // Redirigir en caso de error
  }
}