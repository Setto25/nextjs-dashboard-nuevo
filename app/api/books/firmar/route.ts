// --- Configuración del Cliente S3 para Backblaze B2 ---

import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { NextRequest, NextResponse } from "next/server";




// Ahora lee la región directamente desde la nueva variable de entorno B2_REGION.
const s3Client = new S3Client({
    endpoint: `https://${process.env.B2_ENDPOINT}`,
    region: process.env.B2_REGION!, // Cambio clave: Usa la variable explícita.
    credentials: {
        accessKeyId: process.env.B2_KEY_ID!,
        secretAccessKey: process.env.B2_APPLICATION_KEY!,
    },
});




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

// --- NUEVO MÉTODO POST: Ahora solo funciona como "Notario" ---
export async function POST(solicitud: NextRequest) {
    try {
        // Leo el JSON que viene del frontend (ya no es FormData con archivos pesados)
        // Esto evita que Vercel explote con el error 413 porque solo recibo texto.
        const datosRecibidos = await solicitud.json();
        const { nombreLibro, tipoLibro, nombrePortada, tipoPortada } = datosRecibidos;

        // 1. --- PREPARAR EL PERMISO PARA EL PDF (LIBRO) ---
        const nombreLimpioLibro = limpiarNombreArchivo(nombreLibro);
        const rutaLibro = `libros/${Date.now()}-${nombreLimpioLibro}`;

        // 'ordenLibro' es mi variable arbitraria, 'PutObjectCommand' es obligatorio del sistema.
        // Aquí no envío el "Body", solo aviso qué tipo de archivo será.
        const ordenLibro = new PutObjectCommand({
            Bucket: process.env.B2_BUCKET_NAME!,
            Key: rutaLibro,
            ContentType: tipoLibro,
        });

        // Genero la URL firmada. Esta es la "llave" que le daré al cliente para que suba directo a B2.
        const llaveParaSubirLibro = await getSignedUrl(s3Client, ordenLibro, { expiresIn: 300 });

        // 2. --- PREPARAR EL PERMISO PARA LA PORTADA (Si viene en la petición) ---
        let llaveParaSubirPortada = null;
        let rutaPortada = null;

        if (nombrePortada) {
            rutaPortada = `libros/portadas/${Date.now()}-${limpiarNombreArchivo(nombrePortada)}`;
            const ordenPortada = new PutObjectCommand({
                Bucket: process.env.B2_BUCKET_NAME!,
                Key: rutaPortada,
                ContentType: tipoPortada,
            });
            llaveParaSubirPortada = await getSignedUrl(s3Client, ordenPortada, { expiresIn: 300 });
        }

        // 3. --- RESPUESTA AL CLIENTE ---
        // Le devuelvo las URLs temporales para que él haga el trabajo pesado de subir.
        // También le doy las rutas finales para que sepa dónde quedarán.
        return NextResponse.json({
            urlLibro: llaveParaSubirLibro,
            urlPortada: llaveParaSubirPortada,
            rutaFinalLibro: rutaLibro,
            rutaFinalPortada: rutaPortada
        }, { status: 200 });

    } catch (error) {
        console.error('Error al generar llaves de subida:', error);
        return NextResponse.json({ message: "Error al autorizar subida" }, { status: 500 });
    }
}