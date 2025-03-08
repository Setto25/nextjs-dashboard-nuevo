import { PrismaClient } from '@prisma/client';
import { NextResponse, NextRequest } from 'next/server';  

export const runtime = 'nodejs'; // Forzar Node.js Runtime para evitar Edge Runtime  


const prisma = new PrismaClient();

export async function POST(request: NextRequest) {  
  try {  
    const { email, password } = await request.json();  
    const user = await prisma.user.findUnique({ where: { email } });

    // Verificar credenciales (usando Prisma o cualquier otra lógica de validación)  

console.log('Datos de USER:', user);

    //const { id: user.id, role } = user; // Extraer datos del usuario
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
      secure: process.env.NODE_ENV === 'production', // HTTPS solo en producción  
      expires, // 1 semana (en segundos)  
      path: '/', // Disponible en todas las rutas  
      sameSite: 'lax', // Permitir navegación segura en el cliente  
    });  

    // La cookie debe incluya en los headers  
    console.log('Set-Cookie Header:', response.cookies.set);  

    return response;
  } catch (error) {  
    console.error('Error en el login:', error); // Importante: log para depurar errores  
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });  
  }  
}

