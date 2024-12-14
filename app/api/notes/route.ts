import { NextResponse } from "next/server";
import { prisma } from '@/app/lib/prisma';
//import { request } from "http";

export async function GET() {
    try {

        // throw new Error("Error provocado");

        const notes = await prisma.note.findMany();
        return NextResponse.json(notes);
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
        const { title, content } = await request.json();
        const newNote = await prisma.note.create(

            {
                data: {
                    title,
                    content,
                },
            },
        );
        console.log(newNote)
        return NextResponse.json(newNote);

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