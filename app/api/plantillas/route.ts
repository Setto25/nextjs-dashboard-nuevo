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
    console.log('🔍 Buscando:', tipo);
    let parametrosBusqueda= {};  

    switch (tipo) {
      case 'titulo':
        parametrosBusqueda= { titulo: { contains: termino } }; // aqui parametrosBusquedaalmacena la clave titulo y el valor que contiene termino
        break;
      case 'descripcion':
        parametrosBusqueda= { descripcion: { contains: termino } };
        break;
        case 'tema':
          parametrosBusqueda= { tema: { contains: termino } };
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

console.log("PARAMETROS BUSQUEDA EN DOCMUENTOS ES", parametrosBusqueda)

    const plantilla = await prisma.plantilla.findMany({
      where: parametrosBusqueda,
      orderBy: {
        fechaSubida: 'desc'
      }
    });

    console.log(`✅ Encontrados ${plantilla.length} plantillas`);
    return NextResponse.json(plantilla);

  } catch (error) {
    console.error('❌ Error:', error);
    return NextResponse.json(
      { message: "Error al buscar plantillas" },
      { status: 500 }
    );
  }
}


// Metodo POST

function limpiarNombreArchivo(nombre: string): string {
  return nombre
    .normalize('NFD') // Separa los acentos
    .replace(/[\u0300-\u036f]/g, '') // Elimina los acentos
    .replace(/ñ/g, 'n') // Reemplaza ñ por n
    .replace(/Ñ/g, 'N'); // Reemplaza Ñ por N
}

export async function POST(request: NextRequest) {
  try {
    // Obtener los datos del formulario  
    const formData = await request.formData();

    // Extraer campos de texto  
    const docFile = formData.get('plantilla') as File | null;
    const portada = formData.get('portada') as File | null;
    const titulo = formData.get('titulo') as string;
    const tema = formData.get('tema') as string;
    const descripcion = formData.get('descripcion') as string | null;
    const categoria = (formData.get('categorias') as string) || '';



        // Validar que temaId sea un número válido
   /* if (temaId === null || isNaN(temaId)) {
      return NextResponse.json(
        { message: "El temaId es inválido o no se proporcionó" },
        { status: 400 }
      );
    }*/

    if (docFile) {
      // Validaciones adicionales  
      const allowedExtensions = ['.pdf', /* '.docx', /*'.txt'*/];
      const fileExtension = path.extname(docFile.name).toLowerCase();

     // Validar extensión  
      if (!allowedExtensions.includes(fileExtension)) {
        return NextResponse.json(
          { message: "Tipo de archivo no permitido" },
          { status: 400 }
        );
      }

      // Validar tamaño máximo (por ejemplo, 400MB)  
      if (docFile.size > 400 * 1024 * 1024) {
        return NextResponse.json(
          { message: "Archivo demasiado grande. Máximo 400MB" },
          { status: 400 }
        );
      }}


 if (!docFile) {
            return NextResponse.json({ message: "No se proporcionó ningún archivo." }, { status: 400 });
        }

        // --- 1. Subir el PDF (plantilla) ---
        const fileBuffer = await docFile.arrayBuffer();
        const buffer = Buffer.from(fileBuffer);

        const sanitizedFileName = limpiarNombreArchivo(docFile.name);
        const baseFileName = `${Date.now()}-${sanitizedFileName}`;
        
        const folder = "plantillas";
        const fileKey = `${folder}/${baseFileName}`;

        const commandPlantilla = new PutObjectCommand({ // --- CAMBIO: Renombrado
            Bucket: process.env.B2_BUCKET_NAME!,
            Key: fileKey,
            Body: buffer,
            ContentType: docFile.type,
        });
        await s3Client.send(commandPlantilla); // --- CAMBIO: Enviamos comando del docuemnto
        
        const plantillaUrl = `${process.env.CUSTOM_DOMAIN_URL}/file/${process.env.B2_BUCKET_NAME}/${fileKey}`;

        // --- 2. Subir la Portada (si existe) ---
        let portadaUrl: string | null = null; // --- CAMBIO: Variable para la URL de la portada

        if (portada) {
            const portadaBuffer = await portada.arrayBuffer();
            const bufferPortada = Buffer.from(portadaBuffer);
            
            // Creamos un nombre único para la portada
            const portadaKey = `plantillas/portadas/${Date.now()}-${limpiarNombreArchivo(portada.name)}`;

            const commandPortada = new PutObjectCommand({
                Bucket: process.env.B2_BUCKET_NAME!,
                Key: portadaKey,
                Body: bufferPortada,
                ContentType: portada.type,
            });
            await s3Client.send(commandPortada); // --- CAMBIO: Enviamos comando de la portada

            // Generamos la URL pública para la portada
            portadaUrl = `${process.env.CUSTOM_DOMAIN_URL}/file/${process.env.B2_BUCKET_NAME}/${portadaKey}`;
        }

        // --- 3. Guardar en la Base de Datos ---
    // Crear registro en la base de datos  
    const nuevoPlantilla = await prisma.plantilla.create({
      data: {
        titulo,
        tema,
        url: plantillaUrl, 
        portada: portadaUrl, // --- CAMBIO: URL de la portada (o null)
        descripcion,
        categoria,
        fechaSubida: new Date()
       /* menuCategorias: {
          connect: { id: temaId }, // Conecta el temaId con un registro existente en MenuCategoria
        },*/
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