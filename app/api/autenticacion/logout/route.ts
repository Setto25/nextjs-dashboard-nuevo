// app/api/autenticacion/logout.ts  
import { NextRequest, NextResponse } from 'next/server';  

export async function POST(request: NextRequest) {  
    const response = NextResponse.json({ success: true });  



  // Establecer una cookie "vacía" con una fecha de expiración en el pasado para borrarla  
  response.cookies.set('session', '', {  
    httpOnly: true,  
    secure: process.env.NODE_ENV === 'production', // HTTPS solo en producción  
    path: '/', // Asegúrate de mantener el path consistente  
    sameSite: 'lax', // Mantente consistente con el valor del login  
    maxAge: 0.5, // Opcionalmente expira rápido, por ejemplo, en 0.5 seg, se elimina rapido. 
  });  
    

    return response; // Responde con éxito  
}