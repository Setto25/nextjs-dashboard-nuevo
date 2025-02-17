// app/api/videos/[id]/route.ts  
import { NextResponse } from "next/server";  
import { prisma } from '@/app/lib/prisma';  

// Obtener docuemnto específico  
export async function GET(  
    request: Request,  
    { params }: { params: { id: string } }  
) {  
    try {  
        const manual = await prisma.manualEquipo.findUnique({  
            where: { id: Number(params.id) }  
        });  

        if (!manual) {  
            return NextResponse.json(  
                { message: "Manual no encontrado" },  
                { status: 404 }  
            );  
        }  

        return NextResponse.json(manual);  
    } catch (error) {  
        return NextResponse.json(  
            { message: "Error obteniendo manual" },  
            { status: 500 }  
        );  
    }  
}  

// Actualizar manual 
export async function PUT(  
    request: Request,  
    { params }: { params: { id: string } }  
) {  
    try {  
        const data = await request.json();  
        const manualActualizado = await prisma.manualEquipo.update({  
            where: { id: Number(params.id) },  
            data  
        });  

        return NextResponse.json(manualActualizado);  
    } catch (error) {  
        return NextResponse.json(  
            { message: "Error actualizando manual" },  
            { status: 500 }  
        );  
    }  
}  

// Eliminar manual
export async function DELETE(  
    request: Request,  
    { params }: { params: { id: string } }  
) {  
    try {  
        await prisma.manualEquipo.delete({  
            where: { id: Number(params.id) }  
        });  

        return NextResponse.json(  
            { message: "manual eliminado" },  
            { status: 200 }  
        );  
    } catch (error) {  
        return NextResponse.json(  
            { message: "Error eliminando manual" },  
            { status: 500 }  
        );  
    }  
}