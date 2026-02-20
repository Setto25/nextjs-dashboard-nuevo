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

// -------------------------------------------------------------------------
// GET: Obtener un protocolo especifico
// -------------------------------------------------------------------------
export async function GET(request: Request, { params }: { params: Params }) {
    const { id } = await params;

    try {
        // Se busca el protocolo por su ID unico en la base de datos.
        const protocolo = await prisma.protocolo.findUnique({
            where: { id: Number(id) },
        });

        if (!protocolo) {
            return NextResponse.json({ message: 'Protocolo no encontrado' }, { status: 404 });
        }
        
        // Se devuelve el objeto completo, incluyendo las URLs publicas.
        return NextResponse.json(protocolo);

    } catch (error) {
        return NextResponse.json({ message: 'Error obteniendo protocolo' }, { status: 500 });
    }
}

// -------------------------------------------------------------------------
// PUT: Actualizar metadatos
// -------------------------------------------------------------------------
export async function PUT(request: Request, { params }: { params: Params }) {
    const { id } = await params;
    
    try {
        const data = await request.json();
        
        // LIMPIEZA DE DATOS:
        // Se extraen campos delicados (id, url, portada) para evitar que una edicion
        // de texto rompa los enlaces a los archivos fisicos.
        // Solo se permite actualizar titulo, descripcion, categoria, etc.
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

// -------------------------------------------------------------------------
// DELETE: Borrar de B2 y BD
// -------------------------------------------------------------------------
export async function DELETE(request: Request, { params }: { params: Params }) {
    const { id } = await params;
    console.log("Iniciando eliminacion de protocolo ID:", id);

    try {
        // 1. BUSQUEDA PREVIA
        // El sistema busca el registro antes de borrarlo para obtener las URLs de los archivos.
        const protocolo = await prisma.protocolo.findUnique({
            where: { id: Number(id) }
        });

        if (!protocolo) {
            return NextResponse.json({ message: "Protocolo no encontrado" }, { status: 404 });
        }

        // Helper interno para extraer la 'Key' (ruta interna) de la URL publica.
        // Decodifica espacios (%20) y elimina el dominio.
        const obtenerKey = (urlStr: string) => {
            try {
                const u = new URL(urlStr);
                return decodeURIComponent(u.pathname).split('/').slice(3).join('/');
            } catch (e) { return null; }
        };

        // 2. ELIMINACION EN BACKBLAZE (B2)
        
        // A diferencia del borrador original, aqui se evalua cada archivo por separado.
        // Si no tiene portada, aun asi intenta borrar el PDF.
        
        // Borrar PDF
        if (protocolo.url) {
            const fileKey = obtenerKey(protocolo.url);
            if (fileKey) {
                console.log(`Eliminando PDF B2: ${fileKey}`);
                await s3Client.send(new DeleteObjectCommand({
                    Bucket: process.env.B2_BUCKET_NAME!,
                    Key: fileKey,
                })).catch(e => console.error("Error no critico borrando PDF:", e));
            }
        }

        // Borrar Portada
        if (protocolo.portada) {
            const portadaKey = obtenerKey(protocolo.portada);
            if (portadaKey) {
                console.log(`Eliminando Portada B2: ${portadaKey}`);
                await s3Client.send(new DeleteObjectCommand({
                    Bucket: process.env.B2_BUCKET_NAME!,
                    Key: portadaKey,
                })).catch(e => console.error("Error no critico borrando Portada:", e));
            }
        }

        // 3. ELIMINACION EN BASE DE DATOS
        // Finalmente se elimina el registro de Neon.
        await prisma.protocolo.delete({
            where: { id: Number(id) }
        });

        return NextResponse.json({ message: "Protocolo eliminado correctamente" }, { status: 200 });

    } catch (error) {
        console.error("Error al eliminar protocolo:", error);
        return NextResponse.json({ message: "Error eliminando protocolo" }, { status: 500 });
    }
}