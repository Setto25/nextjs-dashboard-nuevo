import { NextRequest, NextResponse } from "next/server";
import { writeFile } from "node:fs/promises";import path from "node:path";
import {prisma}  from '@/app/lib/prisma';
import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";


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


export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const termino = searchParams.get('q') || '';
    const tipo = searchParams.get('tipo') || '';

    console.log('🔍 Buscando:', termino);
    console.log('🔍 Buscando tipo:', tipo);

    let parametrosBusqueda = {};

    // Si hay un término, configuramos los filtros
    if (termino) {
      switch (tipo) {
        case 'titulo':
          parametrosBusqueda = {
            titulo: {
              contains: termino,
              mode: 'insensitive', // <--- ESTA ES LA CLAVE
            },
          };
          break;

        case 'descripcion':
          parametrosBusqueda = {
            descripcion: {
              contains: termino,
              mode: 'insensitive', // Ignora mayúsculas/minúsculas
            },
          };
          break;

        case 'tema':
          parametrosBusqueda = {
            tema: {
              contains: termino,
              mode: 'insensitive',
            },
          };
          break;

        case 'categoria':
          // Nota: Si 'categoria' es un String normal, esto funciona perfecto.
          // Si usas un <select> exacto, podrías usar 'equals' en vez de 'contains'.
          parametrosBusqueda = {
            categoria: {
              contains: termino, // O 'equals' si quieres coincidencia exacta
              mode: 'insensitive',
            },
          };
          break;

        case 'todos':
          // Busca el término en CUALQUIERA de estos campos
          parametrosBusqueda = {
            OR: [
              { categoria: { contains: termino, mode: 'insensitive' } },
              { descripcion: { contains: termino, mode: 'insensitive' } },
              { titulo: { contains: termino, mode: 'insensitive' } },
              // Agregamos 'palabrasClave' si también quieres buscar ahí en "todos"
              { palabrasClave: { contains: termino, mode: 'insensitive' } } 
            ],
          };
          break;

        default:
          // Si no hay tipo específico pero hay término, por defecto podrías buscar en "todos"
          // o dejarlo vacío si prefieres.
          parametrosBusqueda = {}; 
          break;
      }
    }

    // Ejecutamos la consulta a la BD
    const resultados = await prisma.plantilla.findMany({
      where: parametrosBusqueda,
      orderBy: {
        fechaSubida: 'desc', // Opcional: ordenar por fecha
      },
    });

    return NextResponse.json(resultados);

  } catch (error) {
    console.error('Error buscando plantillas:', error);
    return NextResponse.json({ message: 'Error interno del servidor' }, { status: 500 });
  }
}

// Metodo POST
//Limpieza de nombres de archivos para evitar problemas de caracteres especiales, espacios, etc. Esto es crucial para asegurar que los archivos se suban correctamente a Backblaze B2 y sean accesibles sin problemas de URL o de sistema de archivos.
function limpiarNombreArchivo(nombre: string): string {
  return nombre
    .normalize('NFD') // Separa acentos
    .replace(/[\u0300-\u036f]/g, '') // Elimina acentos
    .replace(/ñ/g, 'n') 
    .replace(/Ñ/g, 'N')
    .replace(/\s+/g, '-') // REEMPLAZA ESPACIOS POR GUIONES (Crucial)
    .replace(/[^a-zA-Z0-9.-]/g, '') // ELIMINA paréntesis, *, ?, etc. Solo deja letras, números, puntos y guiones.
    .toLowerCase(); // Todo a minúsculas para evitar problemas de Case Sensitivity
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();

    const docFile = formData.get('plantilla') as File | null;
    const portada = formData.get('portada') as File | null;
    const titulo = formData.get('titulo') as string;
    const tema = formData.get('tema') as string;
    const descripcion = formData.get('descripcion') as string | null;
    const categoria = (formData.get('categorias') as string) || '';

    // Validar existencia del archivo principal
    if (!docFile) {
      return NextResponse.json({ message: "No se proporcionó ningún archivo." }, { status: 400 });
    }

    // Validaciones de extensión y tamaño
    const allowedExtensions = ['.pdf']; // Agrega .docx si lo necesitas
    const fileExtension = path.extname(docFile.name).toLowerCase();

    if (!allowedExtensions.includes(fileExtension)) {
      return NextResponse.json({ message: "Tipo de archivo no permitido" }, { status: 400 });
    }

    if (docFile.size > 400 * 1024 * 1024) { // 400MB
      return NextResponse.json({ message: "Archivo demasiado grande. Máximo 400MB" }, { status: 400 });
    }

    // --- 1. Subir el PDF (plantilla) ---
    const fileBuffer = await docFile.arrayBuffer();
    
    // Generamos nombre limpio: "mi archivo (1).pdf" -> "mi-archivo-1.pdf"
    const sanitizedFileName = limpiarNombreArchivo(docFile.name); 
    const baseFileName = `${Date.now()}-${sanitizedFileName}`;
    
    const folder = "plantillas";
    const fileKey = `${folder}/${baseFileName}`; // Esta es la Key exacta para B2

    // Subir a B2
    const commandPlantilla = new PutObjectCommand({
      Bucket: process.env.B2_BUCKET_NAME!,
      Key: fileKey,
      Body: Buffer.from(fileBuffer),
      ContentType: docFile.type,
    });
    await s3Client.send(commandPlantilla);
    
    // Construir URL (Ahora es segura porque no tiene espacios)
    const plantillaUrl = `${process.env.CUSTOM_DOMAIN_URL}/file/${process.env.B2_BUCKET_NAME}/${fileKey}`;

    // --- 2. Subir la Portada (si existe) ---
    let portadaUrl: string | null = null;

    if (portada) {
      const portadaBuffer = await portada.arrayBuffer();
      
      const sanitizedPortadaName = limpiarNombreArchivo(portada.name);
      const portadaKey = `plantillas/portadas/${Date.now()}-${sanitizedPortadaName}`;

      const commandPortada = new PutObjectCommand({
        Bucket: process.env.B2_BUCKET_NAME!,
        Key: portadaKey,
        Body: Buffer.from(portadaBuffer),
        ContentType: portada.type,
      });
      await s3Client.send(commandPortada);

      portadaUrl = `${process.env.CUSTOM_DOMAIN_URL}/file/${process.env.B2_BUCKET_NAME}/${portadaKey}`;
    }

    // --- 3. Guardar en la Base de Datos ---
    const nuevoPlantilla = await prisma.plantilla.create({
      data: {
        titulo,
        tema,
        url: plantillaUrl, 
        portada: portadaUrl,
        descripcion,
        categoria,
        fechaSubida: new Date()
      }
    });

    return NextResponse.json(nuevoPlantilla, { status: 201 });

  } catch (error) {
    console.error('Error al subir plantilla:', error);
    return NextResponse.json(
      {
        message: "Error al subir plantilla",
        error: error instanceof Error ? error.message : 'Error desconocido'
      },
      { status: 500 }
    );
  }
}