// app/api/videos/[id]/route.ts  
import { NextResponse } from "next/server";  
import { prisma } from '@/app/lib/prisma';  

// Obtener docuemnto específico  
export async function GET(  
    request: Request,  
    { params }: { params: { id: string } }  
) {  
    try {  
        const libro = await prisma.libro.findUnique({  
            where: { id: Number(params.id) }  
        });  

        if (!libro) {  
            return NextResponse.json(  
                { message: "Libro no encontrado" },  
                { status: 404 }  
            );  
        }  

        return NextResponse.json(libro);  
    } catch (error) {  
        return NextResponse.json(  
            { message: "Error obteniendo libro" },  
            { status: 500 }  
        );  
    }  
}  

// Actualizar libro 
export async function PUT(  
    request: Request,  
    { params }: { params: { id: string } }  
) {  
    try {  
        const data = await request.json();  
        const libroActualizado = await prisma.libro.update({  
            where: { id: Number(params.id) },  
            data  
        });  

        return NextResponse.json(libroActualizado);  
    } catch (error) {  
        return NextResponse.json(  
            { message: "Error actualizando libro" },  
            { status: 500 }  
        );  
    }  
}  

// Eliminar libro
export async function DELETE(  
    request: Request,  
    { params }: { params: { id: string } }  
) {  
    try {  
        await prisma.libro.delete({  
            where: { id: Number(params.id) }  
        });  

        return NextResponse.json(  
            { message: "libro eliminado" },  
            { status: 200 }  
        );  
    } catch (error) {  
        return NextResponse.json(  
            { message: "Error eliminando libro" },  
            { status: 500 }  
        );  
    }  
}