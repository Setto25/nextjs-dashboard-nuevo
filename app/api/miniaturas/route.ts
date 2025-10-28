/*import { NextResponse } from "next/server";
import path from 'path';
import fs from 'fs/promises';

type Params = Promise<{ id: string }>;

export async function GET(request: Request, { params }: { params: Params }) {
  const { id } = await params;

  try {
    const decodedId = decodeURIComponent(id);
    const thumbnailPath = path.join(process.cwd(), 'public', 'uploads', 'thumbnails', decodedId);
    const file = await fs.readFile(thumbnailPath);

const body = new Uint8Array(file)

    return new NextResponse(body, {
      headers: {
        'Content-Type': 'image/jpeg',
        'Content-Disposition': `inline; filename="${decodedId}"`
      }
    });
  } catch (error) {
    return NextResponse.json(
      { message: 'Error obteniendo miniatura' },
      { status: 404 }
    );
  }
} */

  export {};