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
        
        console.log('🔍 Buscando:', termino);  

        const documento = await prisma.documento.findMany({  
            where: {  
                OR: [  
                    { titulo: { contains: termino } },  
                    { descripcion: { contains: termino } },  
                    { categorias: { contains: termino } }  
                ]  
            },  
            orderBy: {  
                fechaSubida: 'desc'  
            }  
        });  

        console.log(`✅ Encontrados ${documento.length} documentos`);  
        return NextResponse.json(documento);  

    } catch (error) {  
        console.error('❌ Error:', error);  
        return NextResponse.json(  
            { message: "Error al buscar documentos" },  
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
      const docFile = formData.get('documento') as File | null;  
      
      if (docFile) {  
        // Validaciones adicionales  
        const allowedExtensions = ['.pdf', '.docx'];  
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
        const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'documentos');  
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
        rutaLocal = `/uploads/documentos/${fileName}`;  



      }  
  
      // Crear registro en la base de datos  
      const nuevoDocumento = await prisma.documento.create({  
        data: {  
          titulo,  
          tema,  
          rutaLocal: rutaLocal,  
          descripcion,   
          categorias,  
          //formato,  
          fechaSubida: new Date()  
        }  
      });  
  
      return NextResponse.json(nuevoDocumento, { status: 201 });  
  
    } catch (error) {  
      console.error('Error al subir documento:', error);  
      return NextResponse.json(  
        {   
          message: "Error al subir documento",  
          error: error instanceof Error ? error.message : 'Error desconocido'  
        },  
        { status: 500 }  
      );  
    }  
  }