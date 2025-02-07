// app/api/autenticacion/me/route.ts  

import { sessionOptions } from '@/app/dashboard/session/session';
import { getIronSession } from 'iron-session';  
  

export async function GET(req: Request) {  

  console.log('GET requerimiento recibido!!'); // Log para verificar que la función GET se está ejecutando

  const res = new Response();  
  const session = await getIronSession(req, res, sessionOptions);  


    // Agregar log para inspeccionar los datos de la sesión
    console.log('Datos de la sesión en me:', session);

  // Devuelve los datos del usuario almacenados en la sesión  
  return new Response(  
    JSON.stringify({ user: session.user || null }),   
    { status: 200, headers: { 'Content-Type': 'application/json' } }  
    
  );  
  
}
//Función: Permite al cliente saber si el usuario está autenticado y su rol.    