import { NextRequest, NextResponse } from "next/server";  
import { writeFile } from "node:fs/promises";  
import path from "node:path";  
import fs from "node:fs";  
import { PrismaClient } from "@prisma/client";  

const prisma = new PrismaClient();  

// Obtener todos los protocolos  
export async function GET(request: NextRequest) {  
    try {  
        const { searchParams } = new URL(request.url);  
        const termino = searchParams.get('q') || '';  
        const tipo = searchParams.get('tipo') || '';  
        let parametrosBusqueda = {};  

        switch (tipo) {  
            case 'titulo':  
                parametrosBusqueda = { titulo: { contains: termino } };  
                break;  
            case 'descripcion':  
                parametrosBusqueda = { descripcion: { contains: termino } };  
                break;  
            case 'categoria':  
                parametrosBusqueda = { categoria: { contains: termino } };  
                break;  
            case 'todos':  
                parametrosBusqueda = {  
                    OR: [  
                        { titulo: { contains: termino } },  
                        { descripcion: { contains: termino } },  
                        { categoria: { contains: termino } }  
                    ]  
                };  
                break;  
            default:  
                parametrosBusqueda = {};  
        }  

        const protocolos = await prisma.protocolo.findMany({  
            where: parametrosBusqueda,  
            orderBy: {  
                fechaSubida: 'desc'  
            }  
        });  

        return NextResponse.json(protocolos);  
    } catch (error) {  
        console.error('❌ Error:', error);  
        return NextResponse.json(  
            { message: "Error al buscar protocolos" },  
            { status: 500 }  
        );  
    }  
}  

// Método POST para subir un nuevo protocolo  
export async function POST(request: NextRequest) {  
    try {  
        const formData = await request.formData(); 
        const codigo= formData.get('codigo') as string; 
        const titulo = formData.get('titulo') as string;  
        const descripcion = formData.get('descripcion') as string;  
        const categoria = formData.get('categoria') as string;  
        const version = formData.get('version') as string;  
        const creadoPor = formData.get('creadoPor') as string;  

        // Manejar el archivo  
        let rutaLocal = null;  
        const archivoFile = formData.get('archivo') as File | null;  

        if (archivoFile) {  
            const allowedExtensions = ['.pdf'];  
            const fileExtension = path.extname(archivoFile.name).toLowerCase();  

            // Validar extensión  
            if (!allowedExtensions.includes(fileExtension)) {  
                return NextResponse.json(  
                    { message: "Tipo de archivo no permitido" },  
                    { status: 400 }  
                );  
            }  

            // Validar tamaño máximo (por ejemplo, 400MB)  
            if (archivoFile.size > 400 * 1024 * 1024) {  
                return NextResponse.json(  
                    { message: "Archivo demasiado grande. Máximo 400MB" },  
                    { status: 400 }  
                );  
            }  

            // Crear directorio de uploads si no existe  
            const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'protocolos');  
            if (!fs.existsSync(uploadDir)) {  
                fs.mkdirSync(uploadDir, { recursive: true });  
            }  

            // Generar nombre de archivo único  
            const timestamp = Date.now();  
            const originalName = archivoFile.name.replace(/\s+/g, '_');  
            const fileName = `${timestamp}_${originalName}`;  
            const filePath = path.join(uploadDir, fileName);  

            // Convertir File a ArrayBuffer y luego a Buffer  
            const arrayBuffer = await archivoFile.arrayBuffer();  
            const buffer = Buffer.from(arrayBuffer);  
            const uint8Array = new Uint8Array(buffer);  

            // Guardar archivo  
            await writeFile(filePath, uint8Array);  

            // Guardar ruta relativa para referencia en base de datos  
            rutaLocal = `/uploads/protocolos/${fileName}`;  
        }  
        console.log("La ruta Local", rutaLocal)
        console.log("EL LÑOG POTROCOLO", titulo)

        // Crear registro en la base de datos  
        const nuevoProtocolo = await prisma.protocolo.create({  
            data: {  
                codigo,
                titulo,  
                descripcion,  
                categoria,  
                version,  
                creadoPor,  
                rutaLocal:rutaLocal,  
                fechaCreacion: new Date(),  
                fechaRevision: new Date(), // Puedes ajustar esto según tus necesidades  
                vigencia: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000) // Ejemplo: 1 año de vigencia  
            }  
        });  
console.log("EL LÑOG POTROCOLO", codigo)
        return NextResponse.json(nuevoProtocolo, { status: 201 });  
    } catch (error) {  
        console.error('Error al subir protocolo:', error);  
        return NextResponse.json(  
            {  
                message: "Error al subir protocolo",  
                error: error instanceof Error ? error.message : 'Error desconocido'  
            },  
            { status: 500 }  
        );  
    }  
}