import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const prisma = new PrismaClient();
const librosFolderPath = path.join(__dirname, 'public', 'uploads', 'libros');

async function cleanLibros() {
  try {
    const librosFromDB = await prisma.libro.findMany({
      where: {
        rutaLocal: {
          not: null,
        },
      },
    });

    const libroFileNamesDB = librosFromDB.map((libro) => {
      if (libro.rutaLocal) {
        return path.basename(libro.rutaLocal);
      }
      return null;
    }).filter(Boolean);

    const filesInFolder = fs.readdirSync(librosFolderPath);

    filesInFolder.forEach((file) => {
      if (!libroFileNamesDB.includes(file)) {
        const filePath = path.join(librosFolderPath, file);
        fs.unlinkSync(filePath);
        console.log(`Eliminado: ${file}`);
      }
    });

    console.log('Limpieza de libros completada.');
  } catch (error) {
    console.error('Error durante la limpieza de libros:', error);
  } finally {
    await prisma.$disconnect();
  }
}

cleanLibros();