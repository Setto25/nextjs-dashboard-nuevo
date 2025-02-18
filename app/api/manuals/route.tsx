// app/api/videos/[id]/route.ts  
import { NextRequest, NextResponse } from "next/server";
import { writeFile } from "node:fs/promises";
import path from "node:path";
import fs from "node:fs";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    console.log("Solicitud POST recibida");
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
    const tema = formData.get('tema') as string;
    const descripcion = formData.get('descripcion') as string | null;
    const categorias = formData.get('categorias') as string | null;
    // const formato = formData.get('formato') as string | null;  

    // Manejar el archivo 
    let rutaLocal = null;
    const docFile = formData.get('manual') as File | null;

    if (docFile) {
      // Validaciones adicionales  
      const allowedExtensions = ['.pdf', '.docx', /*'.txt'*/];
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
      }

      // Crear directorio de uploads si no existe  
      const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'manuales');
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }

      
      // Generar nombre de archivo único  
      const timestamp = Date.now();
      const originalName = docFile.name.replace(/\s+/g, '_');  // reemplaza todos los espacios en blanco (uno o más) con guiones bajos (_). Esto se hace utilizando una expresión regular (/\s+/g), donde \s representa cualquier espacio en blanco y + indica uno o más espacios consecutivos. El modificador g significa que la búsqueda y el reemplazo se realizan globalmente en toda la cadena.
      const fileName = `${timestamp}_${originalName}`;
      const filePath = path.join(uploadDir, fileName);
      // const fileHTMLPath = path.join(uploadDir, `${timestamp}_${originalName}.html`); // ***Linea para archivos docx a html***

      // Convertir File a ArrayBuffer y luego a Buffer  
      const arrayBuffer = await docFile.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      // Convertir Buffer a Uint8Array  
      const uint8Array = new Uint8Array(buffer);

      // Guardar archivo  
      await writeFile(filePath, uint8Array);

      // Guardar ruta relativa para referencia en base de datos  
      rutaLocal = `/uploads/manuales/${fileName}`;



    }

    // Crear registro en la base de datos  
    const nuevoManual = await prisma.manualEquipo.create({
      data: {
        titulo,
        rutaLocal: rutaLocal,
        descripcion,
        categorias,  
        fechaSubida: new Date()
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