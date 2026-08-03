import { NextResponse } from "next/server";
import { prisma } from '@/app/lib/prisma';
import { DeleteObjectCommand, S3Client } from "@aws-sdk/client-s3";

// -------------------------------------------------------------------------
// CONFIGURACION S3 (Backblaze)
// -------------------------------------------------------------------------
// En esta ruta SI es necesaria la configuracion de S3.
// El metodo DELETE necesita las credenciales para borrar archivos fisicos de la nube.

const s3Client = new S3Client({
    endpoint: `https://${process.env.B2_ENDPOINT}`,
    region: process.env.B2_REGION!,
    credentials: {
        accessKeyId: process.env.B2_KEY_ID!,
        secretAccessKey: process.env.B2_APPLICATION_KEY!,
    },
});

// Definicion de tipos para rutas dinamicas en Next.js 15
type Params = Promise<{ id: string }>

// -------------------------------------------------------------------------
// GET: Obtener un libro especifico
// -------------------------------------------------------------------------
export async function GET(request: Request, { params }: { params: Params }) {
    // Se espera a que los parametros esten listos (Next.js 15)
    const { id } = await params;

    try {
        // Busca el libro por ID en la base de datos
        const libro = await prisma.libro.findUnique({
            where: { id: Number(id) },
        });

        if (!libro) {
            return NextResponse.json({ message: 'Libro no encontrado' }, { status: 404 });
        }
        
        // Devuelve el JSON con los datos (incluyendo las URLs publicas)
        return NextResponse.json(libro);
    } catch (error) {
        return NextResponse.json({ message: 'Error obteniendo libro' }, { status: 500 });
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
        // Se extraen y descartan campos sensibles como 'url' o 'portada' para evitar
        // que una edicion de texto rompa los enlaces a los archivos.
        // Solo se actualizan titulo, descripcion, categorias, etc.
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

// -------------------------------------------------------------------------
// DELETE: Borrado fisico y logico
// -------------------------------------------------------------------------
export async function DELETE(request: Request, { params }: { params: Params }) {
    const { id } = await params;
    console.log("Iniciando eliminacion de libro ID:", id);

    try {
        // 1. BUSQUEDA PREVIA
        // Se necesita buscar el libro antes de borrarlo para obtener sus URLs.
        const libro = await prisma.libro.findUnique({
            where: { id: Number(id) },
        });

        if (!libro) {
            return NextResponse.json({ message: 'Libro no encontrado' }, { status: 404 });
        }

        // Funcion auxiliar para extraer la KEY (ruta interna) desde la URL publica.
        // Ejemplo URL: https://dominio.com/file/bucket/libros/archivo.pdf
        // Resultado Key: libros/archivo.pdf
        const obtenerKeyDesdeUrl = (urlStr: string) => {
            try {
                const urlObj = new URL(urlStr);
                const pathDecodificado = decodeURIComponent(urlObj.pathname);
                // El slice(3) asume la estructura /file/bucket/carpeta/archivo
                return pathDecodificado.split('/').slice(3).join('/');
            } catch (e) {
                return null;
            }
        };

        // 2. ELIMINACION EN BACKBLAZE (B2)
        
        // Intento borrar el archivo PDF (si existe URL)
        if (libro.url) {
            const fileKey = obtenerKeyDesdeUrl(libro.url);
            if (fileKey) {
                console.log(`Eliminando PDF en B2: ${fileKey}`);
                await s3Client.send(new DeleteObjectCommand({
                    Bucket: process.env.B2_BUCKET_NAME!,
                    Key: fileKey,
                })).catch(err => console.error("Error borrando PDF en B2 (no critico):", err));
            }
        }

        // Intento borrar la Portada (si existe URL)
        // Se hace en un bloque separado por si el libro no tiene portada.
        if (libro.portada) {
            const portadaKey = obtenerKeyDesdeUrl(libro.portada);
            if (portadaKey) {
                console.log(`Eliminando Portada en B2: ${portadaKey}`);
                await s3Client.send(new DeleteObjectCommand({
                    Bucket: process.env.B2_BUCKET_NAME!,
                    Key: portadaKey,
                })).catch(err => console.error("Error borrando Portada en B2 (no critico):", err));
            }
        }

        // 3. ELIMINACION EN BASE DE DATOS (Neon)
        // Esto se hace al final. Si B2 falla, igual intentamos borrar el registro
        // para que el usuario no vea un libro fantasma.
        await prisma.libro.delete({
            where: { id: Number(id) },
        });

        return NextResponse.json({ message: 'Libro eliminado correctamente' }, { status: 200 });

    } catch (error) {
        console.error("Error al eliminar libro:", error);
        return NextResponse.json({ message: 'Error eliminando libro' }, { status: 500 });
    }
}