import { request } from "http";
import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";
import { Content } from "next/font/google";

interface Params { params: { id: string } };

export async function GET(request: Request, { params }: Params) {
    try {

        const note = await prisma.note.findFirst(
            {
                where: {
                    id: Number(params.id)
                }
            },

        );
        if (!note) {
            return NextResponse.json({ message: "Datos no encontrados" }, { status: 404 })

        }

        return NextResponse.json(note);

    } catch (error) {

        if (error instanceof Error) {
            return NextResponse.json(
                { message: "Error del GET en servidor" + error.message },
                { status: 500 }
            );
        };
    };
}


export async function DELETE(request: Request, { params }: Params) {
    try {
        const deleteNote = await prisma.note.delete(
            {
                where: {
                    id: Number(params.id),
                },
            },
        )
        if (!deleteNote) {
            NextResponse.json(
                { message: "No se pudo borrar la informacion" },
                { status: 404 }
            )

        }

        return NextResponse.json({ messaje: 'Informacion eliminada exitosamente' })

    } catch (error) {

        if (error instanceof Error) {
            return NextResponse.json(
                { message: "Error del DELETE en el servidor" + error.message },
                { status: 500 }
            )

        }

    }


}





export async function PUT(request: Request, { params }: Params) {

    try {

        const { title, content } = await request.json();

        const updatedNote = await prisma.note.update({
            where: {
                id: Number(params.id)
            },
            data: {
                title,
                content
            }
        })


        return NextResponse.json(updatedNote)

    } catch (error) {

        if (error instanceof Error) {
            return NextResponse.json(
                { message: "Error del PUT en servidor" + error.message },
                { status: 500 }
            );

        }
    }
}