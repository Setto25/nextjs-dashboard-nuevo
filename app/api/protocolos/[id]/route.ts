import { NextResponse } from "next/server";  
import { prisma } from '@/app/lib/prisma';

type Params= Promise<{id:string}>;

// Obtener protocolo específico  
export async function GET(  
    request: Request,  
    { params }: { params: Params }  
) {  
    const{ id} = await params
    try {  
        const protocolo = await prisma.protocolo.findUnique({  
            where: { id: Number(id) }  
        });  

        if (!protocolo) {  
            return NextResponse.json(  
                { message: "Protocolo no encontrado" },  
                { status: 404 }  
            );  
        }  

        return NextResponse.json(protocolo);  
    } catch (error) {  
        return NextResponse.json(  
            { message: "Error obteniendo protocolo" },  
            { status: 500 }  
        );  
    }  
}  

// Actualizar protocolo   
export async function PUT(  
    request: Request,  
    { params }: { params: Params }  
) {  
    const{ id} = await params
    try {  
        const data = await request.json();  
        const protocoloActualizado = await prisma.protocolo.update({  
            where: { id: Number(id) },  
            data  
        });  

        return NextResponse.json(protocoloActualizado);  
    } catch (error) {  
        return NextResponse.json(  
            { message: "Error actualizando protocolo" },  
            { status: 500 }  
        );  
    }  
}  

// Eliminar protocolo  
export async function DELETE(  
    request: Request,  
    { params }: { params: Params }  
) {  
    const{ id} = await params
    try {  
        await prisma.protocolo.delete({  
            where: { id: Number(id) }  
        });  

        return NextResponse.json(  
            { message: "Protocolo eliminado" },  
            { status: 200 }  
        );  
    } catch (error) {  
        return NextResponse.json(  
            { message: "Error eliminando protocolo" },  
            { status: 500 }  
        );  
    }  
}