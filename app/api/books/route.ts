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
        const descripcion = formData.get('descripcion') as string | null;
        const categorias = formData.get('categorias') as string | null;

        if (!file) {
            return NextResponse.json({ message: "No se proporcionó ningún archivo." }, { status: 400 });
        }

        const fileBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(fileBuffer);

        const sanitizedFileName = sanitizeFileName(file.name);
        const fileName = `${Date.now()}-${sanitizedFileName}`;

        const command = new PutObjectCommand({
            Bucket: process.env.B2_BUCKET_NAME!,
            Key: fileName,
            Body: buffer,
            ContentType: file.type,
        });

        await s3Client.send(command);


        
        // --- ¡CAMBIO CLAVE AQUÍ, SE AGREGO CLOUDFLARE! ---
        // Ahora se construye la URL usando el nuevo dominio personalizado.
            const publicUrl = `${process.env.CUSTOM_DOMAIN_URL}/file/${process.env.B2_BUCKET_NAME}/libros/${fileName}`;

        //Antiguo, sin usar Cloudflare, usando solo Backblaze B2:
        // Corregido: La URL pública se construye con el endpoint completo.
       // const publicUrl = `https://${process.env.B2_BUCKET_NAME}.${process.env.B2_ENDPOINT}/${fileName}`;


        const nuevoLibro = await prisma.libro.create({
            data: {
                titulo,
                tema,
                url: publicUrl,
                descripcion,
                categorias,
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

