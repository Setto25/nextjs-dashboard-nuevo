import { NextResponse } from "next/server";
//import { prisma } from '@/app/lib/prisma';
//import { request } from "http";

import prisma  from '@/app/lib/prisma';

export async function GET() {
    try {

        // throw new Error("Error provocado");

        const temas = await prisma.tema.findMany({

        });

  console.log(temas); // Para ver cómo queda en la consola

        console.log(temas)
        return NextResponse.json(temas);

    } catch (error) { //en TS se debe comprobar si un error existe o no? por eso se hace un if
        if (error instanceof Error) {
            return NextResponse.json(
                {
                    message: error.message
                },
                {
                    status: 500,
                }
            )
        }
    }
}

export async function POST(request: Request) {
    try {
         // throw new Error();


         const tema = await request.json();
console.log("el tema en back es",tema)
     
        const nuevoTema = await prisma.tema.create(

            {
                data: {tema} ,
            },
        );
        console.log("el nuevo tema en back es",nuevoTema)
        return NextResponse.json(nuevoTema);

    } catch (error) { //en TS se debe comprobar si un error existe o no? por eso se hace un if
        if (error instanceof Error) {
            return NextResponse.json(
                {
                    message: "Error en POST en el servidor" + error.message
                },
                {
                    status: 500,
                }
            )
        }
    }
}