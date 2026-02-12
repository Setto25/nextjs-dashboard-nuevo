import { NextResponse } from "next/server";
import { prisma } from '@/app/lib/prisma';
import { DeleteObjectCommand, S3Client } from "@aws-sdk/client-s3";

// 1. Configuración del Cliente S3 para Backblaze
// Nota mental: Uso la región explícita para evitar problemas de conexión y timeouts.
const s3Client = new S3Client({
    endpoint: `https://${process.env.B2_ENDPOINT}`,
    region: process.env.B2_REGION!,
    credentials: {
        accessKeyId: process.env.B2_KEY_ID!,
        secretAccessKey: process.env.B2_APPLICATION_KEY!,
    },
});

type Params = Promise<{ id: string }>

// --- GET (Obtener un manual específico) ---
// Antes: Leía el archivo del disco y devolvía el binario (PDF).
// Ahora: Devuelvo el objeto JSON con la URL de B2. El frontend se encarga de mostrarlo.
export async function GET(request: Request, { params }: { params: Params }) {
    const { id } = await params;

    try {
        const manual = await prisma.manualEquipo.findUnique({
            where: { id: Number(id) },
        });

        if (!manual) {
            return NextResponse.json({ message: 'Manual no encontrado' }, { status: 404 });
        }
        return NextResponse.json(manual);
    } catch (error) {
        return NextResponse.json({ message: 'Error obteniendo manual' }, { status: 500 });
    }
}


// --- PUT (Actualizar datos del manual) ---
export async function PUT(request: Request, { params }: { params: Params }) {
    const { id } = await params;
    
    try {
        const data = await request.json();
        
        // IMPORTANTE: Saco el ID, la URL y la Portada del objeto data.
        // Protejo estos campos para que no se sobrescriban con basura desde el front.
        // Solo actualizo título, equipo asociado, descripción, etc.
        const { id: _, url, portada, storageProvider, googleFileId, ...restOfData } = data;

        const manualActualizado = await prisma.manualEquipo.update({
            where: { id: Number(id) },
            data: restOfData,
        });

        return NextResponse.json(manualActualizado);
    } catch (error) {
        return NextResponse.json({ message: 'Error actualizando manual' }, { status: 500 });
    }
}


// --- DELETE (Eliminar Manual de B2 y luego de Neon) ---
export async function DELETE(request: Request, { params }: { params: Params }) {
    const { id } = await params;
    console.log("Iniciando eliminación de manual ID:", id);

    try {
        // 1. Busco el manual en la DB para obtener las URLs
        const manual = await prisma.manualEquipo.findUnique({
            where: { id: Number(id) },
        });

        if (!manual) {
            return NextResponse.json({ message: 'Manual no encontrado' }, { status: 404 });
        }

        // 2. Eliminar de B2 (Solo si tiene URL y Portada válidas)
        if (manual.url && manual.portada) {
            
            const fileUrl = new URL(manual.url);
            const portadaUrl = new URL(manual.portada);

            // --- CORRECCIÓN CRÍTICA ---
            // Las URLs vienen codificadas (ej: "mi%20manual.pdf").
            // Backblaze necesita el nombre con espacios reales ("mi manual.pdf").
            // Uso decodeURIComponent para arreglar esto antes de intentar borrar.
            const rawFilePath = decodeURIComponent(fileUrl.pathname);
            const rawPortadaPath = decodeURIComponent(portadaUrl.pathname);

            // Corto la URL para quedarme solo con la Key (ruta interna).
            // Estructura: /file/bucket/manuales/archivo.pdf  -> "manuales/archivo.pdf"
            const fileKey = rawFilePath.split('/').slice(3).join('/');
            const portadaKey = rawPortadaPath.split('/').slice(3).join('/');

            if (fileKey && portadaKey) {
                console.log(`Eliminando de B2:\n - Manual: ${fileKey}\n - Portada: ${portadaKey}`);
                
                // Borro el archivo PDF
                await s3Client.send(new DeleteObjectCommand({
                    Bucket: process.env.B2_BUCKET_NAME!,
                    Key: fileKey,
                }));

                // Borro la imagen de portada
                await s3Client.send(new DeleteObjectCommand({
                    Bucket: process.env.B2_BUCKET_NAME!,
                    Key: portadaKey,
                }));
            }
        }

        // 3. Eliminar registro de la DB (Neon)
        // OJO: Esto va AL FINAL. Si falla el borrado de B2, el código salta al catch
        // y NO borra el registro de la DB. Así mantengo la consistencia de datos y evito huérfanos.
        await prisma.manualEquipo.delete({
            where: { id: Number(id) },
        });

        return NextResponse.json({ message: 'Manual eliminado correctamente' }, { status: 200 });

    } catch (error) {
        console.error("Error al eliminar manual:", error);
        return NextResponse.json({ message: 'Error eliminando manual' }, { status: 500 });
    }
}