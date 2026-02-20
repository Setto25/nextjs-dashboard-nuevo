import { NextResponse } from "next/server";
import { prisma } from '@/app/lib/prisma';
import { DeleteObjectCommand, S3Client } from "@aws-sdk/client-s3";

// -------------------------------------------------------------------------
// CONFIGURACION S3 (Para borrar)
// -------------------------------------------------------------------------
// Es necesaria aqui porque al borrar un registro, tambien debemos limpiar la nube.
const s3Client = new S3Client({
    endpoint: `https://${process.env.B2_ENDPOINT}`,
    region: process.env.B2_REGION!,
    credentials: {
        accessKeyId: process.env.B2_KEY_ID!,
        secretAccessKey: process.env.B2_APPLICATION_KEY!,
    },
});

type Params = Promise<{ id: string }>

// --- GET (Ver una plantilla especifica) ---
export async function GET(request: Request, { params }: { params: Params }) {
    const { id } = await params;
    try {
        const plantilla = await prisma.plantilla.findUnique({
            where: { id: Number(id) },
        });
        if (!plantilla) return NextResponse.json({ message: 'No encontrado' }, { status: 404 });
        return NextResponse.json(plantilla);
    } catch (error) {
        return NextResponse.json({ message: 'Error interno' }, { status: 500 });
    }
}

// --- PUT (Editar metadatos) ---
export async function PUT(request: Request, { params }: { params: Params }) {
    const { id } = await params;
    try {
        const data = await request.json();
        
        // LIMPIEZA DE DATOS:
        // Se evita que se modifiquen las URLs o IDs accidentalmente al editar texto.
        const { id: _, url, portada, fechaSubida, ...restOfData } = data;

        const plantillaActualizada = await prisma.plantilla.update({
            where: { id: Number(id) },
            data: restOfData,
        });
        return NextResponse.json(plantillaActualizada);
    } catch (error) {
        return NextResponse.json({ message: 'Error actualizando' }, { status: 500 });
    }
}

// --- DELETE (Borrar de B2 y BD) ---
export async function DELETE(request: Request, { params }: { params: Params }) {
    const { id } = await params;
    console.log("Iniciando eliminacion de plantilla ID:", id);

    try {
        // 1. BUSQUEDA PREVIA
        // Se busca el registro para obtener las URLs antes de borrarlo.
        const plantilla = await prisma.plantilla.findUnique({
            where: { id: Number(id) },
        });

        if (!plantilla) return NextResponse.json({ message: 'No encontrado' }, { status: 404 });

        // Helper para extraer la 'Key' (ruta interna) de la URL publica.
        const obtenerKey = (urlStr: string) => {
            try {
                const u = new URL(urlStr);
                return decodeURIComponent(u.pathname).split('/').slice(3).join('/');
            } catch (e) { return null; }
        };

        // 2. ELIMINACION EN BACKBLAZE (B2)
        
        // Borrar archivo principal
        if (plantilla.url) {
            const fileKey = obtenerKey(plantilla.url);
            if (fileKey) {
                console.log(`Eliminando Archivo B2: ${fileKey}`);
                await s3Client.send(new DeleteObjectCommand({
                    Bucket: process.env.B2_BUCKET_NAME!,
                    Key: fileKey,
                })).catch(e => console.error("Error no critico borrando archivo:", e));
            }
        }

        // Borrar Portada
        if (plantilla.portada) {
            const portadaKey = obtenerKey(plantilla.portada);
            if (portadaKey) {
                console.log(`Eliminando Portada B2: ${portadaKey}`);
                await s3Client.send(new DeleteObjectCommand({
                    Bucket: process.env.B2_BUCKET_NAME!,
                    Key: portadaKey,
                })).catch(e => console.error("Error no critico borrando Portada:", e));
            }
        }

        // 3. ELIMINACION EN BASE DE DATOS
        await prisma.plantilla.delete({
            where: { id: Number(id) },
        });

        return NextResponse.json({ message: 'Eliminado correctamente' });

    } catch (error) {
        console.error(error);
        return NextResponse.json({ message: 'Error eliminando' }, { status: 500 });
    }
}