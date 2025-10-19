// app/api/thumbnails/[id]/route.ts
import { NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs/promises';

type Params = Promise<{ id: string }>;

export async function GET(request: Request, { params }: { params: Params }) {
  const { id } = await params;
  try {
    const filename = decodeURIComponent(id);
    const thumbPath = path.join(process.cwd(), 'uplodas', 'miniaturas', filename);
    // Verificar existencia
    await fs.access(thumbPath);
    const file = await fs.readFile(thumbPath);

    const body= new Uint8Array(file)
    return new NextResponse(body, {
      headers: {
        'Content-Type': 'image/jpeg',
        'Cache-Control': 'public, max-age=31536000'
      }
    });
  } catch (err) {
    console.error('Error sirviendo miniatura:', err);
    return NextResponse.json({ message: 'Miniatura no encontrada' }, { status: 404 });
  }
}