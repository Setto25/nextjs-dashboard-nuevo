// app/api/videos/[id]/route.ts  
import { NextResponse } from "next/server";  
import { prisma } from '@/app/lib/prisma';  

// Obtener docuemnto específico  
export async function GET(  
    request: Request,  
    { params }: { params: { id: string } }  
) {  
    try {  
        const documento = await prisma.documento.findUnique({  
            where: { id: Number(params.id) }  
        });  

        if (!documento) {  
            return NextResponse.json(  
                { message: "Documento no encontrado" },  
                { status: 404 }  
            );  
        }  

        return NextResponse.json(documento);  
    } catch (error) {  
        return NextResponse.json(  
            { message: "Error obteniendo documento" },  
            { status: 500 }  
        );  
    }  
}  

// Actualizar documento 
export async function PUT(  
    request: Request,  
    { params }: { params: { id: string } }  
) {  
    try {  
        const data = await request.json();  
        const documentoActualizado = await prisma.documento.update({  
            where: { id: Number(params.id) },  
            data  
        });  

        return NextResponse.json(documentoActualizado);  
    } catch (error) {  
        return NextResponse.json(  
            { message: "Error actualizando documento" },  
            { status: 500 }  
        );  
    }  
}  

// Eliminar documento
export async function DELETE(  
    request: Request,  
    { params }: { params: { id: string } }  
) {  
    try {  
        await prisma.documento.delete({  
            where: { id: Number(params.id) }  
        });  

        return NextResponse.json(  
            { message: "documento eliminado" },  
            { status: 200 }  
        );  
    } catch (error) {  
        return NextResponse.json(  
            { message: "Error eliminando documento" },  
            { status: 500 }  
        );  
    }  
}