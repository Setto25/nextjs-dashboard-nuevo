import { NextRequest, NextResponse } from "next/server";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { prisma } from '@/app/lib/prisma';

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

// --- MÉTODO GET: Para buscar y listar libros ---
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const termino = searchParams.get('q') || '';
    const tipo = searchParams.get('tipo') || '';

    let parametrosBusqueda = {};

    switch (tipo) {
      case 'titulo':
        parametrosBusqueda = { titulo: { contains: termino, mode: 'insensitive' } };
        break;
      case 'descripcion':
        parametrosBusqueda = { descripcion: { contains: termino, mode: 'insensitive' } };
        break;
      case 'tema':
        parametrosBusqueda = { tema: { contains: termino, mode: 'insensitive' } };
        break;
      case 'categorias':
        parametrosBusqueda = { categorias: { contains: termino, mode: 'insensitive' } };
        break;
      case 'todos':
        parametrosBusqueda = {
          OR: [
            { categorias: { contains: termino, mode: 'insensitive' } },
            { descripcion: { contains: termino, mode: 'insensitive' } },
            { titulo: { contains: termino, mode: 'insensitive' } }
          ]
        };
        break;
      default:
        parametrosBusqueda = {};
    }

    const libros = await prisma.libro.findMany({
      where: parametrosBusqueda,
      orderBy: {
        fechaSubida: 'desc'
      }
    });
    
    return NextResponse.json(libros);

  } catch (error) {
    console.error('❌ Error en GET /api/books:', error);
    return NextResponse.json(
      { message: "Error al buscar libros" },
      { status: 500 }
    );
  }
}


// --- MÉTODO POST: Para subir un nuevo libro ---
export async function POST(request: NextRequest) {
    try {
        const formData = await request.formData();

        const file = formData.get('libro') as File | null;
        const titulo = formData.get('titulo') as string;
        const tema = formData.get('tema') as string;
        const portadaFile = formData.get('portada') as File | null; // --- CAMBIO
        const descripcion = formData.get('descripcion') as string | null;
        const categorias = formData.get('categorias') as string | null;

        if (!file) {
            return NextResponse.json({ message: "No se proporcionó ningún archivo." }, { status: 400 });
        }

        // --- 1. Subir el PDF (Libro) ---
        const fileBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(fileBuffer);

        const sanitizedFileName = sanitizeFileName(file.name);
        const baseFileName = `${Date.now()}-${sanitizedFileName}`;
        
        const folder = "libros";
        const fileKey = `${folder}/${baseFileName}`;

        const commandLibro = new PutObjectCommand({ // --- CAMBIO: Renombrado
            Bucket: process.env.B2_BUCKET_NAME!,
            Key: fileKey,
            Body: buffer,
            ContentType: file.type,
        });
        await s3Client.send(commandLibro); // --- CAMBIO: Enviamos comando del libro
        
        const libroUrl = `${process.env.CUSTOM_DOMAIN_URL}/file/${process.env.B2_BUCKET_NAME}/${fileKey}`;

        // --- 2. Subir la Portada (si existe) ---
        let portadaUrl: string | null = null; // --- CAMBIO: Variable para la URL de la portada

        if (portadaFile) {
            const portadaBuffer = await portadaFile.arrayBuffer();
            const bufferPortada = Buffer.from(portadaBuffer);
            
            // Creamos un nombre único para la portada
            const portadaKey = `portadas/${Date.now()}-${sanitizeFileName(portadaFile.name)}`;

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
        const nuevoLibro = await prisma.libro.create({
            data: {
                titulo,
                tema,
                url: libroUrl, // --- CAMBIO: URL del libro
                descripcion,
                categorias,
                portada: portadaUrl, // --- CAMBIO: URL de la portada (o null)
                formato: file.type.split('/')[1] || 'pdf',
                fechaSubida: new Date(),
                storageProvider: "BACKBLAZE_B2"
            }
        });

        return NextResponse.json(nuevoLibro, { status: 201 });

        
    } catch (error) {
        console.error('Error al subir libro a Backblaze B2:', error);
        return NextResponse.json(
            {
                message: "Error en el servidor al subir el archivo",
                error: error instanceof Error ? error.message : 'Error desconocido'
            },
            { status: 500 }
        );
    }
}