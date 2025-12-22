import { NextResponse } from "next/server";  
import  prisma  from '@/app/lib/prisma';
import { DeleteObjectCommand, S3Client } from "@aws-sdk/client-s3";

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

// Obtener plantilla específico
// --- GET (Obtener plantilla específico) ---
// (se amntiene por si se usa en el admin, pero ya no es necesario para el público)
export async function GET (request: Request, { params }: { params: Params }) {
  const { id } = await params

    try {
        const plantilla = await prisma.plantilla.findUnique({
            where: { id: Number(id) },
        });
        if (!plantilla) {
            return NextResponse.json({ message: 'Libro no encontrado' }, { status: 404 });
        }
        return NextResponse.json(plantilla);
    } catch (error) {
        return NextResponse.json({ message: 'Error obteniendo libro' }, { status: 500 });
    }
}




// --- PUT (Actualizar un doc) ---
// (Esta lógica está bien, solo actualiza el texto en Neon)
export async function PUT(request: Request, { params }: { params: Params }) {
    const { id } = await params
    try {
        const data = await request.json();
        // Excluimos campos que no queremos que se actualicen por esta vía
        const { id, url, storageProvider, googleFileId, ...restOfData } = data;

        const plantillaActualizado = await prisma.plantilla.update({
            where: { id: Number(id) },
            data: restOfData,
        });
        return NextResponse.json(plantillaActualizado);
    } catch (error) {
        return NextResponse.json({ message: 'Error actualizando plantilla' }, { status: 500 });
    }
}



// --- DELETE (Eliminar un plantilla de B2 y de Neon) ---
// ¡ESTA ES LA LÓGICA CORREGIDA!
export async function DELETE(request: Request, { params }: { params: Params }) {
    const { id } = await params
    try {
        // 1. Buscar el plantilla en la base de datos para obtener la URL
        const plantilla= await prisma.plantilla.findUnique({
            where: { id: Number(id) },
        });

        if (!plantilla) {
            return NextResponse.json({ message: 'Plantilla no encontrado' }, { status: 404 });
        }

        // 2. Si tiene una URL y es de B2, eliminarlo de Backblaze
        // **CAMBIO IMPORTANTE:** Hemos eliminado el try...catch interno.
        // Ahora, si s3Client.send(command) falla, el catch externo lo capturará
        // y la ejecución se detendrá ANTES de borrar de Neon.
        if (plantilla.url && plantilla.portada /*&& plantilla.storageProvider === 'BACKBLAZE_B2'*/ ) {
            
            // Extraer la Key (ruta del archivo en el bucket) de la URL
            const fileUrl = new URL(plantilla.url);
            const portadaUrl = new URL(plantilla.portada);

            // El pathname es: /file/plafatorma-neo/plantilla/archivo.pdf
            // Extraer la parte: "plantilla/archivo.pdf"
            const fileKey = fileUrl.pathname.split('/').slice(3).join('/'); 
            const portadaKey = portadaUrl.pathname.split('/').slice(3).join('/');

            if (fileKey && portadaKey) {
                console.log(`Intentando eliminar archivo y portada de B2 con Key: ${fileKey} y ${portadaUrl}`); // Log para depuración
                
                // 1. Crear y enviar el comando para eliminar el archivo principal
                const deleteFileCommand = new DeleteObjectCommand({
                    Bucket: process.env.B2_BUCKET_NAME!,
                    Key: fileKey, // Usamos la Key completa
                });
                
                await s3Client.send(deleteFileCommand );


                // 2. Crear y enviar el comando para eliminar la portada
                const deletePortadaCommand = new DeleteObjectCommand({
                    Bucket: process.env.B2_BUCKET_NAME!,
                    Key: portadaKey, // Usamos la Key completa
                });
                
                await s3Client.send(deletePortadaCommand);
                
                console.log(`Archivo y portada eliminados de B2: ${fileKey} y ${portadaKey}`); // Log para confirmar eliminación
            }
        }

        // 3. Eliminar el registro de la base de datos (Neon)
        // Esta línea SOLO se ejecutará si el borrado de B2 fue exitoso.
        await prisma.plantilla.delete({
            
            where: { id: Number(id) },
        });

        return NextResponse.json({ message: 'Plantilla eliminado correctamente' }, { status: 200 });

    } catch (error) {
        // Si algo falla (el borrado de B2 o la conexión a Neon), todo se detiene aquí.
        console.error("Error al eliminar plantilla:", error);
        return NextResponse.json({ message: 'Error eliminando plantilla' }, { status: 500 });
    }
}
