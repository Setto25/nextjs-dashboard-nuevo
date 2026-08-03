// app/api/autenticacion/logout.ts  
import { NextRequest, NextResponse } from 'next/server';  

export async function POST(request: NextRequest) {  
    const response = NextResponse.json({ success: true });  

  // Establecer una cookie "vacía" con una fecha de expiración en el pasado para borrarla  
  response.cookies.set('session', '', {  
    httpOnly: true,  
    secure: process.env.NODE_ENV === 'production', 
    path: '/',  
    sameSite: 'lax',  
    maxAge: 0.5, // Tiempo para eliminacion de la cookie
  });  
    

    return response; 
}