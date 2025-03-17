
import { NextResponse } from 'next/server';  
import { cookies } from 'next/headers';  

export async function GET() {  
    // Obtener las cookies  
    const sessionCookie = (await cookies()).get('session');  

    // Verificar si la cookie 'session' existe  
    if (!sessionCookie) {  
        return NextResponse.json({ error: 'No hay sesión' }, { status: 401 });  
    }  

    try {  
        // Intentar parsear la cookie para extraer la información de la sesión  
        const sessionData = JSON.parse(sessionCookie.value);  
        return NextResponse.json({ session: sessionData });  
    } catch (error) {  
        console.error('Error al parsear la sesión:', error);  
        return NextResponse.json({ error: 'Error al parsear la sesión' }, { status: 500 });  
    }  
}