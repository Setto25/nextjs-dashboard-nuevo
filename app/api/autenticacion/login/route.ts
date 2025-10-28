import { PrismaClient } from '@prisma/client';
import { NextResponse, NextRequest } from 'next/server';  
import bcrypt from 'bcrypt';

export const runtime = 'nodejs'; // Forzar Node.js Runtime para evitar Edge Runtime  


const prisma = new PrismaClient();

export async function POST(request: NextRequest) {  
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
    expires.setDate(expires.getDate() + 1);
    // Configurar la cookie  
    response.cookies.set('session', JSON.stringify(session), {  
      httpOnly: true, // Para que sea inaccesible a JavaScript del lado cliente  
      secure: false, // HTTPS solo en producción  
      expires, // 1 semana (en segundos)  
      path: '/', // Disponible en todas las rutas  
      sameSite: 'lax', // Permitir navegación segura en el cliente  
    });  


    return response;
  } catch (error) {  
  
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });  
  }  
}