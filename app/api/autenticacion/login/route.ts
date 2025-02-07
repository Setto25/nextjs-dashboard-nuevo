'use server'

// app/api/autenticacion/route.ts  
import { getIronSession } from 'iron-session';  
import { NextResponse } from 'next/server';  

import { PrismaClient } from '@prisma/client';  
import bcrypt from 'bcryptjs';  
import { sessionOptions } from '@/app/dashboard/session/session';

const prisma = new PrismaClient();  

export async function POST(req: Request) {  
  const body = await req.json(); // Obtener los datos de la solicitud  
  const { email, password } = body;  

  // 1. Busca al usuario en la base de datos  
  const user = await prisma.user.findUnique({ where: { email } });  

  // 2. Verifica la contraseña  
  if (!user || !bcrypt.compareSync(password, user.password)) {  
    return NextResponse.json({ error: "Credenciales inválidas" }, { status: 401 });  
  }  

  // 3. Manejo de la sesión  
  const response =  NextResponse.next(); // Crear una respuesta  
  const session = await getIronSession(req, response, sessionOptions);  
  
  session.user = {  
    id: user.id,  
    email: user.email,  
    role: user.role as "user" | "admin",  
  };  
  console.log('Sesión del usuario route login:', session); // Agregar log para inspeccionar los datos de la sesión
  await session.save(); // Guardar la sesión , SE CREA LA COOKIE
  console.log("lalalala", process.env.NODE_ENV); 
  console.log("session save==>", session);
  const cookieHeader = response.headers.get('Set-Cookie');  
  console.log('Set-Cookie:', cookieHeader); // Para verificar la cookie en la respuesta
  return NextResponse.json({ success: true }); // Responder con éxito  

}