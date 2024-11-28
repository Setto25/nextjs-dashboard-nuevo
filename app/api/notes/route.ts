import { NextResponse } from "next/server";
import { prisma } from '@/app/lib/prisma';
//import { request } from "http";

export async function GET() {
    try {
        throw new Error("Error provocado");
        
     const notes = await prisma.note.findMany();   
     return NextResponse.json(notes); 
    } catch (error) {
       return NextResponse.json({message: error.message })
    }
    

    
}

export async function POST(request: Request) {
    const {title, content} = await request.json();
    console.log({title, content} )


   const newNote= await prisma.note.create(
    
    {
            data:{
                title,
                content,
            },
        },
    );
console.log(newNote)
    return NextResponse.json(newNote);
}