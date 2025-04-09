import { NextResponse, NextRequest } from 'next/server';

export const config = {
    matcher: [
        '/dashboard/:path*',
        '/admin/:path*',
        '/api((?!/autenticacion).*)', // Ejecutar en todas las rutas excepto /login
    ],
};

export async function middleware(request: NextRequest) {
    // Agregar registros para inspeccionar las cabeceras y el objeto request
    console.log('Cabeceras de la solicitud:', request.headers);
    console.log('Objeto request completo:', request);
    console.log('Cabecera Cookie:', request.headers.get('cookie'));

    // Obtener la cookie de sesión
    const sessionCookie = request.cookies.get('session');

    console.log('MiddleWARE: SESSIONKOOE:', sessionCookie);

    if (!sessionCookie || sessionCookie === null) {
        console.log('Cookie de sesión no encontrada. Redirigiendo a /login...');

        // Construir una redirección segura
        const baseUrl = request.nextUrl.origin;
        return NextResponse.redirect(`${baseUrl}/`);
    }

    // Verificar la sesión
    try {
        const session = JSON.parse(sessionCookie.value);

        if (!session.email) {
            return NextResponse.redirect(new URL('/', request.url));
        }

        console.log('MiddleWARE: LA SESSION:', session.email);
        console.log('MLA SERIALZIACION:', session);

        // Proteger rutas de admin
        if (request.nextUrl.pathname.endsWith('/admin') && session.role !== 'admin') {
            return new NextResponse('Acceso denegado: No tienes permisos para ver esta página.', {
                status: 403,
            });
        }

        console.log('LA RUTA ES', request.nextUrl.pathname);
        console.log('EL ROL ES', session.role);

        return NextResponse.next();
    } catch (error) {
        console.error('Error al analizar la sesión:', error);
        return NextResponse.redirect(new URL('/', request.url)); // Redirigir en caso de error
    }
}