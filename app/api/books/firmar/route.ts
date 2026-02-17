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
// app/api/libros/firmar/route.ts

// ... (todo el código anterior de imports y configuración s3Client)

export async function POST(solicitud: NextRequest) {
    try {
        const datos = await solicitud.json();
        const { nombreLibro, tipoLibro, nombrePortada, tipoPortada } = datos;

        // 1. CONFIGURAR LIBRO (PDF)
        const nombreLimpio = limpiarNombreArchivo(nombreLibro);
        const rutaLibro = `libros/${Date.now()}-${nombreLimpio}`; // <--- ESTO ES LA "KEY" (ruta corta)

        const ordenLibro = new PutObjectCommand({
            Bucket: process.env.B2_BUCKET_NAME!,
            Key: rutaLibro,
            ContentType: tipoLibro,
        });
        const urlParaSubirLibro = await getSignedUrl(s3Client, ordenLibro, { expiresIn: 300 });

        // 🔥 AQUÍ SE GENERA LA URL COMPLETA (TIPO https://...)
        const urlPublicaLibro = `${process.env.CUSTOM_DOMAIN_URL}/file/${process.env.B2_BUCKET_NAME}/${rutaLibro}`;


        // 2. CONFIGURAR PORTADA (Opcional)
        let urlParaSubirPortada = null;
        let rutaPortada = null; // Ruta corta (Key)
        let urlPublicaPortada = null; // URL Larga (https://...)

        if (nombrePortada) {
            rutaPortada = `libros/portadas/${Date.now()}-${limpiarNombreArchivo(nombrePortada)}`;
            const ordenPortada = new PutObjectCommand({
                Bucket: process.env.B2_BUCKET_NAME!,
                Key: rutaPortada,
                ContentType: tipoPortada,
            });
            urlParaSubirPortada = await getSignedUrl(s3Client, ordenPortada, { expiresIn: 300 });
            
            // 🔥 URL COMPLETA DE PORTADA
            urlPublicaPortada = `${process.env.CUSTOM_DOMAIN_URL}/file/${process.env.B2_BUCKET_NAME}/${rutaPortada}`;
        }

        // 3. RESPUESTA AL FRONTEND
        return NextResponse.json({
            // Llaves temporales para subir (PUT)
            urlParaSubirLibro,   
            urlParaSubirPortada, 

            // 🔥 IMPORTANTE: ENVÍAS LAS URLS COMPLETAS
            urlPublicaLibro,   // <--- ESTA ES LA QUE TIENES QUE USAR
            urlPublicaPortada, 
            
            // Rutas cortas (solo por si acaso)
            rutaFinalLibro: rutaLibro, 
            rutaFinalPortada: rutaPortada
        });

    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: "Error al firmar" }, { status: 500 });
    }
}