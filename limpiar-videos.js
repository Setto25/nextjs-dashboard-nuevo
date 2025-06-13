import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const prisma = new PrismaClient();
const videosFolderPath = path.join(__dirname, 'public', 'uploads', 'videos');

async function cleanVideos() {
  try {
    const videosFromDB = await prisma.video.findMany({
      where: {
        rutaLocal: {
          not: null,
        },
      },
    });

    const videoFileNamesDB = videosFromDB.map((video) => {
      if (video.rutaLocal) {
        return path.basename(video.rutaLocal);
      }
      return null;
    }).filter(Boolean);

    const filesInFolder = fs.readdirSync(videosFolderPath);

    filesInFolder.forEach((file) => {
      if (!videoFileNamesDB.includes(file)) {
        const filePath = path.join(videosFolderPath, file);
        fs.unlinkSync(filePath);
        console.log(`Eliminado: ${file}`);
      }
    });

    console.log('Limpieza de videos completada.');
  } catch (error) {
    console.error('Error durante la limpieza de videos:', error);
  } finally {
    await prisma.$disconnect();
  }
}

export default cleanVideos;