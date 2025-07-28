import { NextResponse, NextRequest } from 'next/server'

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/admin/:path*',
    '/api((?!/autenticacion).*)' // Ejecutar en todas las rutas excepto /login
  ]
}

export async function middleware (request: NextRequest) {
  // Agregar registros para inspeccionar las cabeceras y el objeto request

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

    return NextResponse.next()
  } catch (error) {
    return NextResponse.redirect(new URL('/', request.url)) // Redirigir en caso de error
  }
}