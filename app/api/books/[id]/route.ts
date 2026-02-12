import { NextResponse } from "next/server";
import { prisma } from '@/app/lib/prisma';
import { DeleteObjectCommand, S3Client } from "@aws-sdk/client-s3";

// 1. Configuración del Cliente S3 para Backblaze
// Nota mental: La región debe ser explícita para evitar errores de conexión.
const s3Client = new S3Client({
    endpoint: `https://${process.env.B2_ENDPOINT}`,
    region: process.env.B2_REGION!,
    credentials: {
        accessKeyId: process.env.B2_KEY_ID!,
        secretAccessKey: process.env.B2_APPLICATION_KEY!,
    },
});

type Params = Promise<{ id: string }>

// --- GET (Obtener un libro específico) ---
// Ya no devuelvo el PDF binario (stream) como antes. 
// Ahora solo devuelvo los datos (JSON) y el front se encarga de usar la URL de B2.
export async function GET(request: Request, { params }: { params: Params }) {
    const { id } = await params;

    try {
        const libro = await prisma.libro.findUnique({
            where: { id: Number(id) },
        });

        if (!libro) {
            return NextResponse.json({ message: 'Libro no encontrado' }, { status: 404 });
        }
        return NextResponse.json(libro);
    } catch (error) {
        return NextResponse.json({ message: 'Error obteniendo libro' }, { status: 500 });
    }
}


// --- PUT (Actualizar datos del libro) ---
export async function PUT(request: Request, { params }: { params: Params }) {
    const { id } = await params;
    
    try {
        const data = await request.json();
        
        // IMPORTANTE: Saco el ID, la URL y la Portada del objeto data.
        // No quiero que se actualicen por error si el front me manda basura.
        // Solo quiero actualizar título, descripción, etc.
        const { id: _, url, portada, storageProvider, googleFileId, ...restOfData } = data;

        const libroActualizado = await prisma.libro.update({
            where: { id: Number(id) },
            data: restOfData,
        });

        return NextResponse.json(libroActualizado);
    } catch (error) {
        return NextResponse.json({ message: 'Error actualizando libro' }, { status: 500 });
    }
}


// --- DELETE (Eliminar Libro de B2 y luego de Neon) ---
export async function DELETE(request: Request, { params }: { params: Params }) {
    const { id } = await params;
    console.log("Iniciando eliminación de libro ID:", id);

    try {
        // 1. Primero busco el libro en la DB para tener las URLs a mano
        const libro = await prisma.libro.findUnique({
            where: { id: Number(id) },
        });

        if (!libro) {
            return NextResponse.json({ message: 'Libro no encontrado' }, { status: 404 });
        }

        // 2. Eliminar de B2 (Solo si tiene URL y Portada válidas)
        if (libro.url && libro.portada) {
            
            const fileUrl = new URL(libro.url);
            const portadaUrl = new URL(libro.portada);

            // --- CORRECCIÓN CRÍTICA (La que me salvó la vida) ---
            // Las URLs vienen codificadas (ej: "mi%20libro.pdf").
            // Si le paso eso a B2, no encuentra el archivo.
            // Uso decodeURIComponent para convertir "%20" en espacios reales.
            const rawFilePath = decodeURIComponent(fileUrl.pathname);
            const rawPortadaPath = decodeURIComponent(portadaUrl.pathname);

            // Corto la URL para obtener solo la Key (ruta interna).
            // Estructura esperada: /file/bucket/libros/archivo.pdf
            // slice(3) elimina las primeras partes y deja: "libros/archivo.pdf"
            const fileKey = rawFilePath.split('/').slice(3).join('/');
            const portadaKey = rawPortadaPath.split('/').slice(3).join('/');

            if (fileKey && portadaKey) {
                console.log(`Eliminando de B2:\n - Libro: ${fileKey}\n - Portada: ${portadaKey}`);
                
                // Borro el PDF
                await s3Client.send(new DeleteObjectCommand({
                    Bucket: process.env.B2_BUCKET_NAME!,
                    Key: fileKey,
                }));

                // Borro la Portada
                await s3Client.send(new DeleteObjectCommand({
                    Bucket: process.env.B2_BUCKET_NAME!,
                    Key: portadaKey,
                }));
            }
        }

        // 3. Eliminar registro de la DB (Neon)
        // OJO: Esto va AL FINAL. Si falla B2 (paso anterior), el código salta al catch
        // y NO borra el registro. Así evito tener datos inconsistentes.
        await prisma.libro.delete({
            where: { id: Number(id) },
        });

        return NextResponse.json({ message: 'Libro eliminado correctamente' }, { status: 200 });

    } catch (error) {
        console.error("Error al eliminar libro:", error);
        return NextResponse.json({ message: 'Error eliminando libro' }, { status: 500 });
    }
}