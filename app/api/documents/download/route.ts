import { NextRequest, NextResponse } from 'next/server';

// Ruta para descargar un archivo desde una URL externa, fuerz la descarga en lugar de abrirlo en el navegador
export async function GET(request: NextRequest) {
    try {
        // Obtener los parámetros de la URL
        const { searchParams } = new URL(request.url);
        const url = searchParams.get('url');
        const filename = searchParams.get('filename');

        if (!url) {
            return NextResponse.json(
                { error: 'URL no proporcionada' },
                { status: 400 }
            );
        }

        // Obtener el archivo
        const response = await fetch(url);
        
        if (!response.ok) {
            return NextResponse.json(
                { error: 'Error al obtener el archivo' },
                { status: response.status }
            );
        }

        // Obtener el contenido del archivo
        const arrayBuffer = await response.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        // Crear la respuesta con los headers apropiados para forzar la descarga
        return new NextResponse(buffer, {
            headers: {
                'Content-Type': 'application/pdf',
                'Content-Disposition': `attachment; filename="${filename || 'documento.pdf'}"`,
                'Content-Length': buffer.length.toString()
            }
        });

    } catch (error) {
        console.error('Error al descargar archivo:', error);
        return NextResponse.json(
            { error: 'Error al procesar la descarga' },
            { status: 500 }
        );
    }
}