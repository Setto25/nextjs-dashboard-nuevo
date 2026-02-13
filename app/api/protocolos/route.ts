import { NextRequest, NextResponse } from "next/server";  
import {prisma}  from '@/app/lib/prisma';
import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";

// --- Configuración del Cliente S3 para Backblaze B2 ---
// Ahora lee la región directamente desde la nueva variable de entorno B2_REGION.
const s3Client = new S3Client({
    endpoint: `https://${process.env.B2_ENDPOINT}`,
    region: process.env.B2_REGION!, // Cambio clave: Usa la variable explícita.
    credentials: {
        accessKeyId: process.env.B2_KEY_ID!,
        secretAccessKey: process.env.B2_APPLICATION_KEY!,
    },
});


// Obtener todos los protocolos  
export async function GET(request: NextRequest) {  
    try {  
        const { searchParams } = new URL(request.url);  
        const termino = searchParams.get('q') || '';  
        const tipo = searchParams.get('tipo') || '';  
        let parametrosBusqueda = {};  

        console.log("Termino de busqueda:", termino);
        console.log("Tipo de busqueda:", tipo);

        switch (tipo) {  
            case 'titulo':  
                parametrosBusqueda = { titulo: { contains: termino } };  
                break;  
            case 'descripcion':  
                parametrosBusqueda = { descripcion: { contains: termino } };  
                break;  
            case 'categoria':  
                parametrosBusqueda = { categoria: { contains: termino } };  
                break;  
            case 'todos':  
                parametrosBusqueda = {  
                    OR: [  
                        { titulo: { contains: termino } },  
                        { descripcion: { contains: termino } },  
                        { categoria: { contains: termino } }  
                    ]  
                };  
                break;  
            default:  
                parametrosBusqueda = {};  
        }  

        const protocolos = await prisma.protocolo.findMany({  
            where: parametrosBusqueda,  
            orderBy: {  
                fechaSubida: 'desc'  
            }  
        });  

        return NextResponse.json(protocolos);  
    } catch (error) {  
        console.error('❌ Error:', error);  
        return NextResponse.json(  
            { message: "Error al buscar protocolos" },  
            { status: 500 }  
        );  
    }  
}  
