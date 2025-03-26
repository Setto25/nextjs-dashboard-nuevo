import { PrismaClient } from '@prisma/client';
import { NextResponse, NextRequest } from 'next/server';  
import bcrypt from 'bcrypt'; // Importar bcrypt para verificar contraseñas

export const runtime = 'nodejs'; // Forzar Node.js Runtime para evitar Edge Runtime  


const prisma = new PrismaClient();

export async function POST(request: NextRequest) {  
  try {  
    const { email, password } = await request.json();  
    console.log('Email:', email);
    console.log('Password:', password);
    const user = await prisma.user.findUnique({ where: { email } });


    if (!user) {
      // Si el usuario no existe, devolver un error
      return NextResponse.json({ error: 'Usuario o contraseña incorrectos' }, { status: 401 });
    }

        // Verificar la contraseña usando bcrypt
        const passwordMatch = await bcrypt.compare(password, user.password);

        if (!passwordMatch) {
          // Si la contraseña no coincide, devolver un error
          return NextResponse.json({ error: 'Usuario o contraseña incorrectos' }, { status: 401 });
        }

console.log('Datos de USER:', user);

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

