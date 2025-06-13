import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const prisma = new PrismaClient();
const manualesFolderPath = path.join(__dirname, 'public', 'uploads', 'manuales');

async function cleanManuales() {
  try {
    const manualesFromDB = await prisma.manualEquipo.findMany({
      where: {
        rutaLocal: {
          not: null,
        },
      },
    });

    const manualFileNamesDB = manualesFromDB.map((manual) => {
      if (manual.rutaLocal) {
        return path.basename(manual.rutaLocal);
      }
      return null;
    }).filter(Boolean);

    const filesInFolder = fs.readdirSync(manualesFolderPath);

    filesInFolder.forEach((file) => {
      if (!manualFileNamesDB.includes(file)) {
        const filePath = path.join(manualesFolderPath, file);
        fs.unlinkSync(filePath);
        console.log(`Eliminado: ${file}`);
      }
    });

    console.log('Limpieza de manuales completada.');
  } catch (error) {
    console.error('Error durante la limpieza de manuales:', error);
  } finally {
    await prisma.$disconnect();
  }
}

export default cleanManuales;