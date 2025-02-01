
// app/api/videos/route.ts  
import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { promises as fsPromises } from 'fs';
import { writeFile } from 'fs/promises';
import path from 'path';
import fs from 'fs';

const prisma = new PrismaClient();

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
        parametrosBusqueda= { titulo: { contains: termino } }; // aqui parametrosBusquedaalmacena la clave titulo y el valor que contiene termino
        break;
      case 'descripcion':
        parametrosBusqueda= { descripcion: { contains: termino } };
        break;
      case 'categorias':
        parametrosBusqueda= { categorias: { contains: termino } };
        break;
      case 'todos':
        parametrosBusqueda= { //aqui parametrosBusquedaalmacena un objeto con la clave OR y el valor que contiene un arreglo con los valores de las claves categorias, descripcion y titulo.
          OR: [ // or para buscar en cualquiera d elas categorias
            { categorias: { contains: termino } },
            { descripcion: { contains: termino } },
            { titulo: { contains: termino } }
          ]
        };
        break;

      case '':
        parametrosBusqueda= {};
        break;


      default:
        parametrosBusqueda= {};
    }

    const videos = await prisma.video.findMany({
      where: parametrosBusqueda,
      orderBy: {
        fechaSubida: 'desc'
      }
    });

    console.log(`✅ Encontrados ${videos.length} videos`);
    return NextResponse.json(videos);

  } catch (error) {
    console.error('❌ Error:', error);
    return NextResponse.json(
      { message: "Error al buscar videos" },
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
    const tema = formData.get('tema') as string;
    const tipo = formData.get('tipo') as string;
    const url = formData.get('url') as string | null;
    const descripcion = formData.get('descripcion') as string | null;
    const duracion = formData.get('duracion') as string | null;
    const categorias = formData.get('categorias') as string | null;
    const formato = formData.get('formato') as string | null;

    // Manejar el archivo de video  
    let rutaLocal = null;
    const videoFile = formData.get('video') as File | null;

    if (videoFile && tipo === 'LOCAL') {
      // Validaciones adicionales  
      const allowedExtensions = ['.mp4', '.avi', '.mov', '.webm', '.mkv'];
      const fileExtension = path.extname(videoFile.name).toLowerCase();

      // Validar extensión  
      if (!allowedExtensions.includes(fileExtension)) {
        return NextResponse.json(
          { message: "Tipo de archivo no permitido" },
          { status: 400 }
        );
      }

      // Validar tamaño máximo (por ejemplo, 400MB)  
      if (videoFile.size > 400 * 1024 * 1024) {
        return NextResponse.json(
          { message: "Archivo demasiado grande. Máximo 200MB" },
          { status: 400 }
        );
      }

      // Crear directorio de uploads si no existe  
      const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'videos');
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }

      // Generar nombre de archivo único  
      const timestamp = Date.now();
      const originalName = videoFile.name.replace(/\s+/g, '_');
      const fileName = `${timestamp}_${originalName}`;
      const filePath = path.join(uploadDir, fileName);

      // Convertir File a ArrayBuffer y luego a Buffer  
      const arrayBuffer = await videoFile.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      // Guardar archivo  
      await writeFile(filePath, buffer);

      // Guardar ruta relativa para referencia en base de datos  
      rutaLocal = `/uploads/videos/${fileName}`;
    }

    // Crear registro en la base de datos  
    const nuevoVideo = await prisma.video.create({
      data: {
        titulo,
        tema,
        tipo,
        url: tipo === 'YOUTUBE' ? url : null,
        rutaLocal: tipo === 'LOCAL' ? rutaLocal : null,
        descripcion,
        duracion,
        categorias,
        formato,
        fechaSubida: new Date()
      }
    });

    return NextResponse.json(nuevoVideo, { status: 201 });

  } catch (error) {
    console.error('Error al subir video:', error);
    return NextResponse.json(
      {
        message: "Error al subir video",
        error: error instanceof Error ? error.message : 'Error desconocido'
      },
      { status: 500 }
    );
  }
}