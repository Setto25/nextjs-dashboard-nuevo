import { NextResponse } from "next/server";
import { prisma } from '@/app/lib/prisma';
import { DeleteObjectCommand, S3Client } from "@aws-sdk/client-s3";

// 1. Configuración del Cliente S3 (Idéntica a Plantillas)
const s3Client = new S3Client({
    endpoint: `https://${process.env.B2_ENDPOINT}`,
    region: process.env.B2_REGION!,
    credentials: {
        accessKeyId: process.env.B2_KEY_ID!,
        secretAccessKey: process.env.B2_APPLICATION_KEY!,
    },
});

type Params = Promise<{ id: string }>

// --- GET (Obtener protocolo) ---
export async function GET(request: Request, { params }: { params: Params }) {
    const { id } = await params;

    try {
        const protocolo = await prisma.protocolo.findUnique({
            where: { id: Number(id) },
        });

        if (!protocolo) {
            return NextResponse.json({ message: 'Protocolo no encontrado' }, { status: 404 });
        }
        return NextResponse.json(protocolo);

    } catch (error) {
        return NextResponse.json({ message: 'Error obteniendo protocolo' }, { status: 500 });
    }
}

// --- PUT (Actualizar datos del protocolo) ---
export async function PUT(request: Request, { params }: { params: Params }) {
    const { id } = await params;
    
    try {
        const data = await request.json();
        
        // Excluimos campos sensibles para proteger la integridad de la DB/Storage
        const { id: _, url, portada, ...restOfData } = data;

        const protocoloActualizado = await prisma.protocolo.update({
            where: { id: Number(id) },
            data: restOfData,
        });

        return NextResponse.json(protocoloActualizado);

    } catch (error) {
        return NextResponse.json({ message: "Error actualizando protocolo" }, { status: 500 });
    }
}

// --- DELETE (Eliminar PDF y Portada de B2 + Registro en DB) ---
export async function DELETE(request: Request, { params }: { params: Params }) {
    const { id } = await params;
    console.log("Iniciando eliminación de protocolo ID:", id);

    try {
        // 1. Buscar en la DB para obtener las URLs
        const protocolo = await prisma.protocolo.findUnique({
            where: { id: Number(id) }
        });

        if (!protocolo) {
            return NextResponse.json({ message: "Protocolo no encontrado" }, { status: 404 });
        }

        // 2. Borrar archivos en B2 (PDF y Portada)
        // Verificamos que existan URL y Portada (tal como en plantillas)
        if (protocolo.url && protocolo.portada) {
            
            const fileUrl = new URL(protocolo.url);
            const portadaUrl = new URL(protocolo.portada);

            // --- DECODIFICACIÓN (La solución al problema de los espacios) ---
            const rawFilePath = decodeURIComponent(fileUrl.pathname);
            const rawPortadaPath = decodeURIComponent(portadaUrl.pathname);

            // Extraer las Keys (rutas internas)
            const fileKey = rawFilePath.split('/').slice(3).join('/');
            const portadaKey = rawPortadaPath.split('/').slice(3).join('/');

            if (fileKey && portadaKey) {
                console.log(`Eliminando de B2:\n - PDF: ${fileKey}\n - IMG: ${portadaKey}`);
                
                // Borrar PDF
                await s3Client.send(new DeleteObjectCommand({
                    Bucket: process.env.B2_BUCKET_NAME!,
                    Key: fileKey,
                }));

                // Borrar Portada
                await s3Client.send(new DeleteObjectCommand({
                    Bucket: process.env.B2_BUCKET_NAME!,
                    Key: portadaKey,
                }));
            }
        }

        // 3. Borrar de la Base de Datos (Solo si B2 no falló)
        await prisma.protocolo.delete({
            where: { id: Number(id) }
        });

        return NextResponse.json({ message: "Protocolo eliminado correctamente" }, { status: 200 });

    } catch (error) {
        console.error("Error al eliminar protocolo:", error);
        return NextResponse.json({ message: "Error eliminando protocolo" }, { status: 500 });
    }
}