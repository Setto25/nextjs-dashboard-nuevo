// app/api/autenticacion/logout.ts  
import { NextResponse } from 'next/server';  
import { getIronSession } from 'iron-session';  
import { sessionOptions } from '@/app/dashboard/session/session'; // Asegúrate de que la ruta de exportación es correcta  

export async function POST(req: Request) {  
    const response = NextResponse.next();  
    const session = await getIronSession(req, response, sessionOptions);  

    // Elimina la sesión del usuario  
    session.destroy(); // Destruye la sesión  

    return NextResponse.json({ success: true }); // Responde con éxito  
}