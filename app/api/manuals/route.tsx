// app/api/videos/[id]/route.ts  
import { NextRequest, NextResponse } from "next/server";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { prisma } from '@/app/lib/prisma';

// --- Configuración del Cliente S3 para Backblaze B2 ---
const s3Client = new S3Client({
    endpoint: `https://${process.env.B2_ENDPOINT}`,
    region: process.env.B2_REGION!,
    credentials: {
        accessKeyId: process.env.B2_KEY_ID!,
        secretAccessKey: process.env.B2_APPLICATION_KEY!,
    },
});

function sanitizeFileName(name: string): string {
  return name.replace(/[^a-zA-Z0-9.\-_]/g, '_');
}


export async function GET(request: NextRequest) {
  try {
 
    const { searchParams } = new URL(request.url);
    const termino = searchParams.get('q') || '';
    const tipo = searchParams.get('tipo') || '';

    console.log('🔍 Buscando:', termino);
    console.log('🔍 Buscando:', tipo);
    let parametrosBusqueda= {};  //let determina que la variable solo se puede usar dentro deel bloque en que se encuentra, ademas permite reasignar valores a la variable, no asi const. parametrosBusquedaes un objeto que se usa para buscar en la base de datos, almacena una clave y un valor.

    switch (tipo) {
      case 'titulo':
        parametrosBusqueda= { titulo: { contains: termino, mode: 'insensitive' } }; // aqui parametrosBusquedaalmacena la clave titulo y el valor que contiene termino
        break;
      case 'descripcion':
        parametrosBusqueda= { descripcion: { contains: termino, mode: 'insensitive' } };
        break;
        case 'tema':
          parametrosBusqueda= { tema: { contains: termino, mode: 'insensitive' } };
          break;
        case 'categorias':
          parametrosBusqueda= { categorias: { contains: termino, mode: 'insensitive' } };
          break;
        case 'todos':
          parametrosBusqueda= { //aqui parametrosBusquedaalmacena un objeto con la clave OR y el valor que contiene un arreglo con los valores de las claves categorias, descripcion y titulo.
            OR: [ // or para buscar en cualquiera d elas categorias
              { categorias: { contains: termino, mode: 'insensitive' } },
              { descripcion: { contains: termino, mode: 'insensitive' } },
              { titulo: { contains: termino, mode: 'insensitive' } }
            ]
          };
          break;

      case '':
        parametrosBusqueda= {};
        break;

      default:
        parametrosBusqueda= {};
    }

    const manuales = await prisma.manualEquipo.findMany({
      where: parametrosBusqueda,
      orderBy: {
        fechaSubida: 'desc'
      }
    });

    console.log(`✅ Encontrados ${manuales.length} manuales`);
    return NextResponse.json(manuales);

  } catch (error) {
    console.error('❌ Error:', error);
    return NextResponse.json(
      { message: "Error al buscar manuales" },
      { status: 500 }
    );
  }
}



// Metodo POST

export async function POST(request: NextRequest) {
  try {
    // Obtener los datos del formulario  
    const formData = await request.formData();

    // Extraer campos de texto  
    const titulo = formData.get('titulo') as string;
    const portadaFile = formData.get('portada') as File | null;
    const manualFile = formData.get('manual') as File | null;
    const descripcion = formData.get('descripcion') as string | null;
    const categorias = formData.get('categorias') as string | null;

    // Manejar el archivo 
    const file = formData.get('manual') as File | null;

    if (!file) {
      return NextResponse.json({ message: "No se proporcionó ningún archivo de manual." }, { status: 400 });
    }


    // --- 1. Subir el archivo del manual a B2 ---
    const fileBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(fileBuffer);

    const sanitizedFileName = sanitizeFileName(file.name);
    const baseFileName = `${Date.now()}-${sanitizedFileName}`;
    
    const folder = "manuales";
    const fileKey = `${folder}/${baseFileName}`;

    const commandManual = new PutObjectCommand({
        Bucket: process.env.B2_BUCKET_NAME!,
        Key: fileKey,
        Body: buffer,
        ContentType: file.type,
    });
    await s3Client.send(commandManual);
    
    const manualUrl = `${process.env.CUSTOM_DOMAIN_URL}/file/${process.env.B2_BUCKET_NAME}/${fileKey}`;

     // --- 2. Subir la Portada (si existe) ---
            let portadaUrl: string | null = null; // --- CAMBIO: Variable para la URL de la portada
    
            if (portadaFile) {
                const portadaBuffer = await portadaFile.arrayBuffer();
                const bufferPortada = Buffer.from(portadaBuffer);
                
                // Creamos un nombre único para la portada
                const portadaKey = `manuales/portadas/${Date.now()}-${sanitizeFileName(portadaFile.name)}`;
    
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

    // Crear registro en la base de datos  
    const nuevoManual = await prisma.manualEquipo.create({
      data: {
        titulo,
        url: manualUrl,
        portada: portadaUrl, // No hay portada para manuales
        descripcion,
        categorias,  
        //formato: file.type.split('/')[1] || 'pdf',
        //fechaSubida: new Date(),
        //storageProvider: "BACKBLAZE_B2"
      }
    });


    return NextResponse.json(nuevoManual, { status: 201 });

  } catch (error) {
    console.error('Error al subir manual:', error);
    return NextResponse.json(
      {
        message: "Error al subir manual",
        error: error instanceof Error ? error.message : 'Error desconocido'
      },
      { status: 500 }
    );
  }
}