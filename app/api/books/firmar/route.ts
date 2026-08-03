import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { NextRequest, NextResponse } from "next/server";

// -------------------------------------------------------------------------
// CONFIGURACION DE S3 (Backblaze B2)
// -------------------------------------------------------------------------
// En este archivo SI es obligatoria esta configuracion.
// El servidor necesita las credenciales para poder "firmar" los permisos de subida (PUT).
const s3Client = new S3Client({
    endpoint: `https://${process.env.B2_ENDPOINT}`,
    region: process.env.B2_REGION!, 
    credentials: {
        accessKeyId: process.env.B2_KEY_ID!,
        secretAccessKey: process.env.B2_APPLICATION_KEY!,
    },
});

// Funcion auxiliar para normalizar nombres de archivos.
// Elimina acentos, espacios y caracteres especiales para evitar errores en la URL.
function limpiarNombreArchivo(nombre: string): string {
  return nombre
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') 
    .replace(/ñ/g, 'n') 
    .replace(/Ñ/g, 'N')
    .replace(/\s+/g, '-') 
    .replace(/[^a-zA-Z0-9.-]/g, '') 
    .toLowerCase(); 
}

// -------------------------------------------------------------------------
// API NOTARIO (Generador de Firmas)
// -------------------------------------------------------------------------
export async function POST(solicitud: NextRequest) {
    try {
        // 1. RECEPCION DE METADATOS
        // Se reciben los nombres y tipos de archivo. NO el archivo fisico.
        const datos = await solicitud.json();
        const { nombreLibro, tipoLibro, nombrePortada, tipoPortada } = datos;

        // 2. PROCESAMIENTO DEL LIBRO (PDF)
        const nombreLimpio = limpiarNombreArchivo(nombreLibro);
        
        // Se define la ruta interna (Key) donde vivira el archivo en el Bucket.
        const rutaLibro = `libros/${Date.now()}-${nombreLimpio}`; 

        // Se prepara la orden de subida.
        const ordenLibro = new PutObjectCommand({
            Bucket: process.env.B2_BUCKET_NAME!,
            Key: rutaLibro,
            ContentType: tipoLibro,
        });
        
        // Se genera la firma criptografica (URL temporal) para permitir la subida.
        const urlParaSubirLibro = await getSignedUrl(s3Client, ordenLibro, { expiresIn: 300 });

        // Se construye la URL Publica (la que se guardara en la BD).
        // Esta URL no expira y sirve para descargar/ver el archivo.
        const urlPublicaLibro = `${process.env.CUSTOM_DOMAIN_URL}/file/${process.env.B2_BUCKET_NAME}/${rutaLibro}`;


        // 3. PROCESAMIENTO DE LA PORTADA (Opcional)
        let urlParaSubirPortada = null;
        let rutaPortada = null; 
        let urlPublicaPortada = null;

        if (nombrePortada) {
            rutaPortada = `libros/portadas/${Date.now()}-${limpiarNombreArchivo(nombrePortada)}`;
            
            const ordenPortada = new PutObjectCommand({
                Bucket: process.env.B2_BUCKET_NAME!,
                Key: rutaPortada,
                ContentType: tipoPortada,
            });
            
            // Generacion de firma para la imagen
            urlParaSubirPortada = await getSignedUrl(s3Client, ordenPortada, { expiresIn: 300 });
            
            // Construccion de URL publica para la imagen
            urlPublicaPortada = `${process.env.CUSTOM_DOMAIN_URL}/file/${process.env.B2_BUCKET_NAME}/${rutaPortada}`;
        }

        // 4. RESPUESTA AL FRONTEND
        // Se devuelve un paquete con dos tipos de URLs:
        // - urlParaSubir... : Usadas por el navegador para hacer el PUT (Subida).
        // - urlPublica...   : Usadas por el navegador para enviarlas a la BD (Guardado).
        return NextResponse.json({
            urlParaSubirLibro,   
            urlParaSubirPortada, 

            urlPublicaLibro,   
            urlPublicaPortada, 
            
            // Se envian tambien las rutas cortas por si fueran necesarias para logica futura.
            rutaFinalLibro: rutaLibro, 
            rutaFinalPortada: rutaPortada
        });

    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: "Error al firmar" }, { status: 500 });
    }
}