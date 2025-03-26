// app/api/preguntas-quiz/route.ts  

import { PrismaClient } from '@prisma/client';  
const prisma = new PrismaClient();

import { NextResponse } from 'next/server';  


export async function POST(request: Request) {  
    const { pregunta, tema, alternativas, respuesta } = await request.json();  

    // Validación de los datos  
    if (!pregunta || !tema || !alternativas || !respuesta) {  
        return NextResponse.json({ message: 'Faltan datos requeridos.' }, { status: 400 });  
    }  

    try {  
        // Guarda la pregunta usando Prisma  
        const nuevaPregunta = await prisma.preguntas.create({  
            data: {  
                pregunta,  
                tema,  
                alternativas,  
                respuesta,  
            },  
        });  

        return NextResponse.json(nuevaPregunta, { status: 201 });  
    } catch (error) {  
        console.error('Error al guardar la pregunta:', error);  
        return NextResponse.json({ message: 'Error al guardar la pregunta.' }, { status: 500 });  
    }  
}  