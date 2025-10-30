import { NextResponse } from 'next/server'
import { prisma } from '@/app/lib/prisma'
import path from 'node:path'
import fs from 'node:fs/promises'
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { S3Client, DeleteObjectCommand } from "@aws-sdk/client-s3";

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

type Params = Promise<{ id: string }>


/* ONLINE SE ELIMINA; SU USO SE LIMITABA A SERVIR EL PDF DESDE EL SERVIDOR LOCAL, ES DECIR, CUANDO SE SUBIA EL PDF A LA CARPETA PUBLIC/UPLOADS/LIBROS Y SE PRESENTABA EL PROBLEMA DE QUE SE NECESITABA UNA RUTA ESPECÍFICA PARA ACCEDER AL PDF. AHORA QUE SE USA BACKBLAZE B2, ESTO YA NO ES NECESARIO.

// Obtener docuemnto específico
export async function GET (request: Request, { params }: { params: Params }) {
  const { id } = await params

  try {
    const decodedId = decodeURIComponent(id) // Decodifica caracteres especiales
    const filePath = path.join(
      process.cwd(),
      'public',
      'uploads',
      'libros',
      decodedId
    )
    const file = await fs.readFile(filePath) // Lee el archivo PDF

    // Devuelve el PDF como respuesta binaria
const body = new Uint8Array(file)

    return new NextResponse(body, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `inline; filename="${id}"`
      }
    })
  } catch (error) {
    return NextResponse.json(
      { message: 'Error obteniendo libro' },
      { status: 500 }
    )
  }
} */


// --- GET (Obtener un libro específico) ---
// (Lo mantenemos por si lo usas en el admin, pero ya no es necesario para el público)
export async function GET (request: Request, { params }: { params: Params }) {
  const { id } = await params

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


// --- PUT (Actualizar un libro) ---
// (Esta lógica está bien, solo actualiza el texto en Neon)
export async function PUT(request: Request, { params }: { params: { id: string } }) {
    try {
        const data = await request.json();
        // Excluimos campos que no queremos que se actualicen por esta vía
        const { id, url, storageProvider, googleFileId, ...restOfData } = data;

        const libroActualizado = await prisma.libro.update({
            where: { id: Number(params.id) },
            data: restOfData,
        });
        return NextResponse.json(libroActualizado);
    } catch (error) {
        return NextResponse.json({ message: 'Error actualizando libro' }, { status: 500 });
    }
}

// --- DELETE (Eliminar un libro de B2 y de Neon) ---
// ¡ESTA ES LA LÓGICA CORREGIDA!
export async function DELETE(request: Request, { params }: { params: { id: string } }) {
    try {
        // 1. Buscar el libro en la base de datos para obtener la URL
        const libro = await prisma.libro.findUnique({
            where: { id: Number(params.id) },
        });

        if (!libro) {
            return NextResponse.json({ message: 'Libro no encontrado' }, { status: 404 });
        }

        // 2. Si tiene una URL y es de B2, eliminarlo de Backblaze
        if (libro.url && libro.storageProvider === 'BACKBLAZE_B2') {
            try {
                // Extraemos la Key (ruta del archivo en el bucket) de la URL
                const fileUrl = new URL(libro.url);
                // El pathname es: /file/plafatorma-neo/libros/archivo.pdf
                // Extraemos la parte: "libros/archivo.pdf"
                const fileKey = fileUrl.pathname.split('/').slice(3).join('/'); 

                if (fileKey) {
                    const command = new DeleteObjectCommand({
                        Bucket: process.env.B2_BUCKET_NAME!,
                        Key: fileKey, // Usamos la Key completa
                    });
                    
                    await s3Client.send(command);
                }
            } catch (s3Error) {
                console.error("Error al eliminar el archivo de B2, pero se continuará borrando el registro:", s3Error);
            }
        }

        // 3. Eliminar el registro de la base de datos (Neon)
        await prisma.libro.delete({
            where: { id: Number(params.id) },
        });

        return NextResponse.json({ message: 'Libro eliminado correctamente' }, { status: 200 });

    } catch (error) {
        console.error("Error al eliminar libro:", error);
        return NextResponse.json({ message: 'Error eliminando libro' }, { status: 500 });
    }
}

