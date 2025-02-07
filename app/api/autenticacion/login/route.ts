// app/api/autenticacion/login/route.ts

import { sessionOptions } from "@/app/dashboard/session/session";
import { PrismaClient } from "@prisma/client";
import { getIronSession } from "iron-session";
import { NextRequest, NextResponse } from "next/server";
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

export async function POST(req: NextRequest) {




  try {
    const response = new NextResponse();
    const session = await getIronSession(req, response, sessionOptions);

    console.log('Datos de la sesión en REQ:', req); // Agregar log para inspeccionar los datos de la sesión
    console.log('Datos de la sesión en RESPONSE:', response); // Agregar log para inspeccionar los datos de la sesión
    console.log('Datos de la sesión en login:', session); // Agregar log para inspeccionar los datos de la sesión

    const { email, password } = await req.json();

    const user = await prisma.user.findUnique({ where: { email } });   // 1. Busca al usuario en la base de datos 

    console.log('Datos de USER:', user);

    if (!user || !bcrypt.compareSync(password, user.password)) {  // 2. Verifica la contraseña  
      return NextResponse.json({ error: "Credenciales inválidas" }, { status: 401 });
    }

   
    session.user = { id: user.id, email: user.email, role: user.role }; //3. Se asigna informacion necesaria a la sesion
    await session.save(); //4. Guardar sesión

    // 5. Devoler cookie manualmente (solución a bug de headers en iron session con next 13+) 
    const cookieHeader = response.headers.get("Set-Cookie"); // Obtener la cookie de la respuesta
    return NextResponse.json( // Responder con éxito, se envia la cooki corregida al cliente.
      { success: true }, 
      {
        status: 200,
        headers: { "Set-Cookie": cookieHeader || "" },
      }
    );

  } catch (error) {
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}





/*'use server'

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
    role: user.role ,  //##
  };  
  console.log('Sesión del usuario route login:', session); // Agregar log para inspeccionar los datos de la sesión
  await session.save(); // Guardar la sesión , SE CREA LA COOKIE
  console.log("lalalala", process.env.NODE_ENV); 
  console.log("session save==>", session);
  const cookieHeader = response.headers.get('Set-Cookie');  
  console.log('Set-Cookie:', cookieHeader); // Para verificar la cookie en la respuesta
  return NextResponse.json({ success: true }); // Responder con éxito  

}*/