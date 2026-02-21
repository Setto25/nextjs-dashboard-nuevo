import {prisma }from '@/app/lib/prisma'; // IMPORTAR  SINGLETON DE PRISMA
import { NextResponse, NextRequest } from 'next/server';  
import bcrypt from 'bcryptjs';

export const runtime = 'nodejs'; // Forzar Node.js Runtime para evitar Edge Runtime  



export async function POST(request: NextRequest) {  
  console.log("DEBUG -> URL de DB:", process.env.DATABASE_URL);
  try {  
    const { email, password } = await request.json();  
    const user = await prisma.user.findUnique({ where: { email } });

    // Verificar credenciales (usando Prisma o cualquier otra lógica de validación)  
    if (!user || !bcrypt.compareSync(password, user.password)) {
      return NextResponse.json({ error: "Credenciales inválidas" }, { status: 401 });
    }

    // Crear sesión como un objeto  
    const session = {
      id: user?.id,
      email: user?.email,
      role: user?.role,
    };

    // Crear la respuesta  
    const response = NextResponse.json({ success: true });  
    
const expires = new Date();  
// Cambiamos setDate/getDate por setHours/getHours
expires.setHours(expires.getHours() + 1); 

// Configurar la cookie  
response.cookies.set('session', JSON.stringify(session), {  
  httpOnly: true,  
  secure: process.env.NODE_ENV === 'production', // true en Vercel, false en tu PC
  expires, // Ahora la sesión caducará en exactamente 1 hora  
  path: '/',  
  sameSite: 'lax',  
});


    return response;
  } catch (error) {  
  
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });  
  }  
}