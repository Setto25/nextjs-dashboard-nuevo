
import { PrismaClient } from '@prisma/client';  
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();
const videosFolderPath = path.join(__dirname, 'public', 'videos');

async function cleanVideos() {
  try {
    // Obtener la lista de videos desde la base de datos
    const videosFromDB = await prisma.video.findMany({
      where: {
        rutaLocal: {
          not: null, // Solo videos con ruta local
        },
      },
    });

    // Extraer los nombres de archivo de rutaLocal
    const videoFileNamesDB = videosFromDB.map((video) => {
      if (video.rutaLocal) {
        return path.basename(video.rutaLocal); // Obtener solo el nombre del archivo
      }
      return null;
    }).filter(Boolean); // Filtrar valores nulos

    // Obtener la lista de archivos en la carpeta public/videos
    const filesInFolder = fs.readdirSync(videosFolderPath);

    // Identificar y eliminar videos que no están en la base de datos
    filesInFolder.forEach((file: any) => {
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

cleanVideos();