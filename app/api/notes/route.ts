import { NextResponse } from "next/server";
import { prisma } from '@/app/lib/prisma';
import { format } from 'date-fns';
//import { request } from "http";

export async function GET() {
    try {

        // throw new Error("Error provocado");

        const notes = await prisma.note.findMany({

            orderBy: {  //le agergo un orden a la busqueda para que aparezca en orden descendente, es decir la ultima publicacion primero
                createdAt : 'desc'  
            } 
        });


   // Formatear las fechas al formato 'dd-MM-yyyy HH:mm'
   const formattedNotes = notes.map(note => ({
    ...note,
    createdAt: format(note.createdAt, 'dd-MM-yyyy HH:mm'), // Formatear createdAt
  }));

  console.log(formattedNotes); // Para ver cómo queda en la consola



        console.log(notes)
        return NextResponse.json(formattedNotes);


        
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


         const dato = await request.json(); //El request recibe la informacion cuando se usa el metofo POST // alterna: const { note } = await request.json(); const { title, content } = note; funciona igual, pero es menos flexible, ya que en dato s epuede acceder a alguna de sus propiedades.
         const { title, content } = dato.note;// aqui se desestructura el objeto que se recibe en el request (dato)
     
        const newNote = await prisma.note.create(

            {
                data: {title, content } ,
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