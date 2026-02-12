import { NextResponse } from "next/server";
import { prisma } from '@/app/lib/prisma'; // Asegúrate de que la ruta sea la correcta en tu proyecto
import { DeleteObjectCommand, S3Client } from "@aws-sdk/client-s3";

// Configuración del cliente para Backblaze B2 (compatible con S3)
const s3Client = new S3Client({
    endpoint: `https://${process.env.B2_ENDPOINT}`, // El endpoint de mi región en B2
    region: process.env.B2_REGION!, 
    credentials: {
        accessKeyId: process.env.B2_KEY_ID!,
        secretAccessKey: process.env.B2_APPLICATION_KEY!, // Ojo: Revisar si en .env se llama APP_KEY o APPLICATION_KEY
    },
});

type Params = Promise<{ id: string }>

// --- GET (Obtener una plantilla específica) ---
export async function GET (request: Request, { params }: { params: Params }) {
    const { id } = await params;

    try {
        const plantilla = await prisma.plantilla.findUnique({
            where: { id: Number(id) },
        });

        if (!plantilla) {
            return NextResponse.json({ message: 'Plantilla no encontrada' }, { status: 404 });
        }
        return NextResponse.json(plantilla);
    } catch (error) {
        return NextResponse.json({ message: 'Error obteniendo la plantilla' }, { status: 500 });
    }
}

// --- PUT (Actualizar datos de la plantilla) ---
export async function PUT(request: Request, { params }: { params: Params }) {
    const { id } = await params;
    
    try {
        const data = await request.json();

        // NOTA: Saco el ID y la URL del objeto data para evitar que se sobrescriban accidentalmente.
        // Solo quiero actualizar título, descripción, etc.
        const { id: _, url, storageProvider, ...restOfData } = data;

        const plantillaActualizado = await prisma.plantilla.update({
            where: { id: Number(id) },
            data: restOfData,
        });

        return NextResponse.json(plantillaActualizado);
    } catch (error) {
        return NextResponse.json({ message: 'Error actualizando plantilla' }, { status: 500 });
    }
}

// --- DELETE (La parte crítica: Borrar de B2 y luego de la DB) ---
export async function DELETE(request: Request, { params }: { params: Params }) {
    const { id } = await params;
    console.log("ID recibido para eliminar:", id);

    try {
        // 1. Primero busco en la DB para obtener las URLs de los archivos a borrar
        const plantilla = await prisma.plantilla.findUnique({
            where: { id: Number(id) },
        });

        if (!plantilla) {
            return NextResponse.json({ message: 'Plantilla no encontrada en la DB' }, { status: 404 });
        }

        // 2. Si existen archivos en B2, procedo a borrarlos
        if (plantilla.url && plantilla.portada) {
            
            const fileUrl = new URL(plantilla.url);
            const portadaUrl = new URL(plantilla.portada);

            // --- ¡IMPORTANTE! AQUÍ ESTABA EL BUG ---
            // Las URLs vienen codificadas (ej: "mi%20archivo.pdf").
            // Backblaze necesita el nombre REAL con espacios ("mi archivo.pdf").
            // Si no uso decodeURIComponent, B2 no encuentra el archivo y no borra nada.
            const rawFilePath = decodeURIComponent(fileUrl.pathname);
            const rawPortadaPath = decodeURIComponent(portadaUrl.pathname);

            // Corto la URL para quedarme solo con la Key (ruta interna del bucket).
            // Mi estructura es: /file/NOMBRE-BUCKET/carpeta/archivo.pdf
            // split('/') crea un array y slice(3) elimina las 3 primeras partes para dejar solo: "carpeta/archivo.pdf"
            const fileKey = rawFilePath.split('/').slice(3).join('/');
            const portadaKey = rawPortadaPath.split('/').slice(3).join('/');

            if (fileKey && portadaKey) {
                console.log(`Intentando eliminar en B2. Keys decodificadas:\n - Archivo: ${fileKey}\n - Portada: ${portadaKey}`);
                
                // Borro el archivo principal (PDF)
                await s3Client.send(new DeleteObjectCommand({
                    Bucket: process.env.B2_BUCKET_NAME!,
                    Key: fileKey,
                }));

                // Borro la imagen de portada
                await s3Client.send(new DeleteObjectCommand({
                    Bucket: process.env.B2_BUCKET_NAME!,
                    Key: portadaKey, 
                }));
                
                console.log("¡Éxito! Archivos eliminados (o marcados como ocultos) en B2.");
            }
        }

        // 3. Eliminar el registro de la Base de Datos (Neon)
        // NOTA: Esto lo hago AL FINAL. Si falla el borrado de B2 (el paso anterior lanza error),
        // el código salta al catch y NO se ejecuta esta línea.
        // Así evito tener registros borrados en la DB pero con archivos huérfanos en la nube.
        await prisma.plantilla.delete({
            where: { id: Number(id) },
        });

        return NextResponse.json({ message: 'Plantilla eliminada correctamente' }, { status: 200 });

    } catch (error) {
        console.error("Error crítico al eliminar plantilla:", error);
        // Si falló B2 o la DB, devuelvo 500 para saber que algo salió mal.
        return NextResponse.json({ message: 'Error eliminando plantilla' }, { status: 500 });
    }
}