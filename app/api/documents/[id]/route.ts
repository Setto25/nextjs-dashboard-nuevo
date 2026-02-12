import { NextResponse } from "next/server";
import { prisma } from '@/app/lib/prisma';
import { DeleteObjectCommand, S3Client } from "@aws-sdk/client-s3";

// 1. Configuración del Cliente S3 para Backblaze
// Nota mental: Uso la región explícita para evitar problemas de conexión.
const s3Client = new S3Client({
    endpoint: `https://${process.env.B2_ENDPOINT}`,
    region: process.env.B2_REGION!,
    credentials: {
        accessKeyId: process.env.B2_KEY_ID!,
        secretAccessKey: process.env.B2_APPLICATION_KEY!,
    },
});

type Params = Promise<{ id: string }>

// --- GET (Obtener un documento específico) ---
// Nota: Ya no devuelvo el archivo binario (stream), sino los datos JSON.
// El frontend usará la propiedad 'url' para descargar o mostrar el archivo desde B2.
export async function GET(request: Request, { params }: { params: Params }) {
    const { id } = await params;

    try {
        const documento = await prisma.documento.findUnique({
            where: { id: Number(id) },
        });

        if (!documento) {
            return NextResponse.json({ message: 'Documento no encontrado' }, { status: 404 });
        }
        return NextResponse.json(documento);
    } catch (error) {
        return NextResponse.json({ message: 'Error obteniendo documento' }, { status: 500 });
    }
}


// --- PUT (Actualizar datos del documento) ---
export async function PUT(request: Request, { params }: { params: Params }) {
    const { id } = await params;
    
    try {
        const data = await request.json();
        
        // IMPORTANTE: Saco el ID, la URL y la Portada del objeto data.
        // Protejo estos campos para que no se sobrescriban con basura desde el front.
        // Solo actualizo título, descripción, visibilidad, etc.
        const { id: _, url, portada, storageProvider, googleFileId, ...restOfData } = data;

        const documentoActualizado = await prisma.documento.update({
            where: { id: Number(id) },
            data: restOfData,
        });

        return NextResponse.json(documentoActualizado);
    } catch (error) {
        return NextResponse.json({ message: 'Error actualizando documento' }, { status: 500 });
    }
}


// --- DELETE (Eliminar Documento de B2 y luego de Neon) ---
export async function DELETE(request: Request, { params }: { params: Params }) {
    const { id } = await params;
    console.log("Iniciando eliminación de documento ID:", id);

    try {
        // 1. Busco el documento en la DB para obtener las URLs
        const documento = await prisma.documento.findUnique({
            where: { id: Number(id) },
        });

        if (!documento) {
            return NextResponse.json({ message: 'Documento no encontrado' }, { status: 404 });
        }

        // 2. Eliminar de B2 (Solo si tiene URL y Portada válidas)
        if (documento.url && documento.portada) {
            
            const fileUrl = new URL(documento.url);
            const portadaUrl = new URL(documento.portada);

            // --- CORRECCIÓN CRÍTICA ---
            // Las URLs vienen codificadas (ej: "mi%20documento.pdf").
            // Backblaze necesita el nombre con espacios reales ("mi documento.pdf").
            // Uso decodeURIComponent para arreglar esto antes de intentar borrar.
            const rawFilePath = decodeURIComponent(fileUrl.pathname);
            const rawPortadaPath = decodeURIComponent(portadaUrl.pathname);

            // Corto la URL para quedarme solo con la Key (ruta interna).
            // Estructura: /file/bucket/documentos/archivo.pdf  -> "documentos/archivo.pdf"
            const fileKey = rawFilePath.split('/').slice(3).join('/');
            const portadaKey = rawPortadaPath.split('/').slice(3).join('/');

            if (fileKey && portadaKey) {
                console.log(`Eliminando de B2:\n - Doc: ${fileKey}\n - Portada: ${portadaKey}`);
                
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
        // y NO borra el registro de la DB. Así mantengo la consistencia de datos.
        await prisma.documento.delete({
            where: { id: Number(id) },
        });

        return NextResponse.json({ message: 'Documento eliminado correctamente' }, { status: 200 });

    } catch (error) {
        console.error("Error al eliminar documento:", error);
        return NextResponse.json({ message: 'Error eliminando documento' }, { status: 500 });
    }
}