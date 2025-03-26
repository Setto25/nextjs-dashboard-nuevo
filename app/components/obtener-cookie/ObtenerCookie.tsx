import { NextResponse, NextRequest } from 'next/server';
import { useValueCookies} from "@/app/store/store";



export async function ObtenerCookie(request: NextRequest) {
  // Obtener la cookie de sesión  
  const sessionCookie = request.cookies.get('session');
  const {setIdCookie}= useValueCookies();


  console.log("MiddleWARE: SESSIONKOOE:", sessionCookie);

  if (!sessionCookie || sessionCookie === null) {
    console.log('Cookie de sesión no encontrada. Redirigiendo a /login...');

    // Construir una redirección segura  
    const baseUrl = request.nextUrl.origin;
    return NextResponse.redirect(`${baseUrl}/`);

  }

  // Verificar la sesión  
  const session = JSON.parse(sessionCookie.value);
  const idCookie=session.id;
  setIdCookie(idCookie);


  if (!session.email) {
    return NextResponse.redirect(new URL('/', request.url));


  }
  console.log("MiddleWARE: LA SESSION:", session.email);

      // Proteger rutas de admin  
      if (request.nextUrl.pathname.endsWith('/admin') && session.role !== 'admin') {
      
    return new NextResponse('Acceso denegado: No tienes permisos para ver esta página.', {
      status: 403,  
    });
    }
  console.log('LA RUTA ES', request.nextUrl.pathname);
  console.log('EL ROL ES', session.role);

  return NextResponse.next();
}


