// middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getIronSession } from "iron-session";
import { sessionOptions } from "./dashboard/session/session";


// Middleware para proteger rutas y APIs
export async function middleware(request: NextRequest) {
  const response = NextResponse.next(); // Crear una respuesta
  const session = await getIronSession(request, response, sessionOptions); // Obtener la sesión del usuario
console.log('Datos de la sesión middle:', response); // Agregar log para inspeccionar los datos de la sesión

  // Proteger todas las rutas /admin
  if (request.nextUrl.pathname.startsWith("/admin") && !session.user) { // Si la ruta comienza con /admin y no hay usuario en sesión
    return NextResponse.redirect(new URL("/dashboard", request.url)); // Redirigir a /login
  }
console.log('Datos de la sesión ruta admin.:', session); // Agregar log para inspeccionar los datos de la sesión
  // Proteger todas las APIs
  if (request.nextUrl.pathname.startsWith("/api") && !session.user) { // Si la ruta comienza con /api y no hay usuario en sesión
    return NextResponse.json( // Devolver un error de autenticación
      { error: "Autenticación requerida" },
      { status: 401 }
    );
  }
  await session.save(); 

  return response;// Devolver la respuesta
}