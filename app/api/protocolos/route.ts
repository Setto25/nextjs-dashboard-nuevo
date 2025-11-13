import { NextRequest, NextResponse } from "next/server";  
import { writeFile } from "node:fs/promises";  
import path from "node:path";  
import fs from "node:fs";  
import { prisma } from '@/app/lib/prisma';
import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";

// --- Configuración del Cliente S3 para Backblaze B2 ---
// Ahora lee la región directamente desde la nueva variable de entorno B2_REGION.
const s3Client = new S3Client({
    endpoint: `https://${process.env.B2_ENDPOINT}`,
    region: process.env.B2_REGION!, // Cambio clave: Usa la variable explícita.
    credentials: {
        accessKeyId: process.env.B2_KEY_ID!,
        secretAccessKey: process.env.B2_APPLICATION_KEY!,
    },
});

function sanitizeFileName(name: string): string {
    return name.replace(/[^a-zA-Z0-9.\-_]/g, '_');
}


// Obtener todos los protocolos  
export async function GET(request: NextRequest) {  
    try {  
        const { searchParams } = new URL(request.url);  
        const termino = searchParams.get('q') || '';  
        const tipo = searchParams.get('tipo') || '';  
        let parametrosBusqueda = {};  

        console.log("Termino de busqueda:", termino);
        console.log("Tipo de busqueda:", tipo);

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

function limpiarNombreArchivo(nombre: string): string {
  return nombre
    .normalize('NFD') // Separa los acentos
    .replace(/[\u0300-\u036f]/g, '') // Elimina los acentos
    .replace(/ñ/g, 'n') // Reemplaza ñ por n
    .replace(/Ñ/g, 'N'); // Reemplaza Ñ por N
}

export async function POST(request: NextRequest) {  
    try {  
        const formData = await request.formData(); 
        const file = formData.get('protocolo') as File | null;
        const codigo= formData.get('codigo') as string; 
        const titulo = formData.get('titulo') as string;  
        const portadaFile = formData.get('portada') as File | null; // --- CAMBIO
        const url = formData.get('url') as string;
        const descripcion = formData.get('descripcion') as string;  
        const categoria = formData.get('categoria') as string;  
        const version = formData.get('version') as string;  
        const creadoPor = formData.get('creadoPor') as string;  


/*
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


            */
              // Generar nombre de archivo único y limpio
   if (!file) {
            return NextResponse.json({ message: "No se proporcionó ningún archivo." }, { status: 400 });
        }

  // --- 1. Subir el PDF (Libro) ---
        const fileBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(fileBuffer);

        const sanitizedFileName = limpiarNombreArchivo(file.name.replace(/\s+/g, '_'));
        const baseFileName = `${Date.now()}-${sanitizedFileName}`;
        
        const folder = "protocolos";
        const fileKey = `${folder}/${baseFileName}`;

        const commandProtocolo = new PutObjectCommand({ // --- CAMBIO: Renombrado
            Bucket: process.env.B2_BUCKET_NAME!,
            Key: fileKey,
            Body: buffer,
            ContentType: file.type,
        });
        await s3Client.send(commandProtocolo); // --- CAMBIO: Enviamos comando del libro
        
        const protocoloUrl = `${process.env.CUSTOM_DOMAIN_URL}/file/${process.env.B2_BUCKET_NAME}/${fileKey}`;

        // --- 2. Subir la Portada (si existe) ---
        let portadaUrl: string | null = null; // --- CAMBIO: Variable para la URL de la portada

        if (portadaFile) {
            const portadaBuffer = await portadaFile.arrayBuffer();
            const bufferPortada = Buffer.from(portadaBuffer);
            
            // Creamos un nombre único para la portada
            const portadaKey = `protocolos/portadas/${Date.now()}-${limpiarNombreArchivo(portadaFile.name)}`;

            const commandPortada = new PutObjectCommand({
                Bucket: process.env.B2_BUCKET_NAME!,
                Key: portadaKey,
                Body: bufferPortada,
                ContentType: portadaFile.type,
            });
            await s3Client.send(commandPortada); // --- CAMBIO: Enviamos comando de la portada

            // Generamos la URL pública para la portada
            portadaUrl = `${process.env.CUSTOM_DOMAIN_URL}/file/${process.env.B2_BUCKET_NAME}/${portadaKey}`;
        }

        // --- 3. Guardar en la Base de Datos ---
        // Crear registro en la base de datos  
        const nuevoProtocolo = await prisma.protocolo.create({  
            data: {  
                codigo,
                titulo,  
                descripcion,  
                categoria,  
                version,  
                creadoPor,  
                url: protocoloUrl, // ANTES: rutaLocal
                portada: portadaUrl, // --- CAMBIO: URL de la portada (o null)
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