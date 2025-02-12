import { NextResponse, NextRequest } from 'next/server';

export const config = {
  matcher: [

    '/dashboard/:path*',
    '/admin/:path*',
    '/api((?!/autenticacion).*)', // Ejecutar en todas las rutas excepto /login

    //'/((?!api|_next/static|_next/image|favicon.ico).*)', // Ejecutar en todas las rutas excepto las especificadas  
  ],
};


export async function middleware(request: NextRequest) {
  // Obtener la cookie de sesión  
  const sessionCookie = request.cookies.get('session');

  console.log("MiddleWARE: SESSIONKOOE:", sessionCookie);

  if (!sessionCookie || sessionCookie === null) {
    console.log('Cookie de sesión no encontrada. Redirigiendo a /login...');

    // Construir una redirección segura  
    const baseUrl = request.nextUrl.origin;
    return NextResponse.redirect(`${baseUrl}/`);

  }

  // Verificar la sesión  
  const session = JSON.parse(sessionCookie.value);


  if (!session.email) {
    return NextResponse.redirect(new URL('/', request.url));


  }
  console.log("MiddleWARE: LA SESSION:", session.email);
  // Proteger rutas de admin  
  if (request.nextUrl.pathname.startsWith('/admin') && session.user.role !== 'admin') {
    return NextResponse.redirect(new URL('/', request.url));
  }

  return NextResponse.next();
}


//Este middleware protege las rutas /dashboard y /admin, así como las rutas de la API, excepto /login. Se utiliza para verificar la autenticación del usuario y redirigirlo a la página de inicio de sesión si no está autenticado. También se asegura de que solo los administradores puedan acceder a las rutas /admin. Funciona en base a la cookie que se genera en el route del login. Si la cookie no se encuentra o no contiene la información necesaria, redirige al usuario a la página de inicio de sesión. Si el usuario no es un administrador y trata de acceder a una ruta protegida de admin, también lo redirige a la página de inicio de sesión. En caso contrario, permite el acceso a la ruta solicitada.


/*
// middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getIronSession } from "iron-session";
import { sessionOptions } from "./app/dashboard/session/session";

// 1. Define qué rutas deben pasar por el middleware
export const config = {
  runtime: 'nodejs', // Fuerza el uso del runtime de Node.js
  matcher: ["/dashboard", "/admin/:path*", /*"/api/:path*"*/ //], // Rutas protegidas
//};
/*
export async function middleware(request: NextRequest) {
  const response = NextResponse.next();
  const session = await getIronSession(request, response, sessionOptions);

  console.log("MIDDLEWARE Ruta solicitada:", request.nextUrl.pathname);
  console.log("MIDDLEWARE Usuario en sesión:", session.user);

  // 2. Proteger rutas /dashboard
  if (request.nextUrl.pathname.startsWith("/dashboard")) {
    if (!session.user) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
  }

  // 3. Proteger rutas /admin
  if (request.nextUrl.pathname.startsWith("/admin")) {
    if (!session.user) {
      return NextResponse.redirect(new URL("/login", request.url));
    } else if (session.user.role !== "admin") {
      return NextResponse.redirect(new URL("/acceso-denegado", request.url));
    }
  }

  // 4. Proteger APIs
  if (request.nextUrl.pathname.startsWith("/api") && !session.user) {
    return NextResponse.json(
      { error: "Autenticación requerida" },
      { status: 401 }
    );
  }

  // 5. Guardar cambios en la sesión
  await session.save();

  // 6. Clonar headers de cookies
  const cookieHeader = response.headers.get("Set-Cookie");
  if (cookieHeader) {
    response.headers.set("Set-Cookie", cookieHeader);
  }

  return response;
}*/

/*// middleware.ts  
import { NextResponse } from "next/server";  
import type { NextRequest } from "next/server";  
import { getIronSession } from "iron-session";  
import { sessionOptions } from "./dashboard/session/session";  

export const config = {  
  matcher: '/:path*', // Ejecutar en todas las rutas  
};  

export async function middleware(request: NextRequest) {  
  // Obtener la sesión  
  const response = NextResponse.next();  
  const session = await getIronSession(request, response, sessionOptions);  

  console.log('Sesión en middleware:', session.user); // Debug (en consola del servidor)  

  // Rutas públicas (no requieren autenticación)  
  const publicRoutes = ["/", "/login", "/registro"];  
  if (publicRoutes.includes(request.nextUrl.pathname)) {  
    return response; // Permitir acceso sin autenticación  
  }  

  // Proteger rutas que no son públicas  
  if (!session.user) {  
    return NextResponse.redirect(new URL("/login", request.url)); // Redirigir a /login si no está autenticado  
  }  

  // Proteger rutas de admin  
  if (request.nextUrl.pathname.startsWith("/admin")) {  
    if (session.user.role !== "admin") {  
      return NextResponse.redirect(new URL("/capacitacion", request.url)); // Redirigir si no es admin  
    }  
  }  

  // Proteger APIs  
  if (request.nextUrl.pathname.startsWith("/api")) {  
    if (!session.user) {  
      return NextResponse.json(  
        { error: "Autenticación requerida", details: "Por favor, inicie sesión para acceder a este recurso." },  
        { status: 401 }  
      );  
    }  
  }  

  // Guardar la sesión
  await session.save();

  return response;  
}*/