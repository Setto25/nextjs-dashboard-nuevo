import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const prisma = new PrismaClient();
const documentosFolderPath = path.join(__dirname, 'public', 'uploads', 'documentos');

async function cleanDocumentos() {
  try {
    const documentosFromDB = await prisma.documento.findMany({
      where: {
        rutaLocal: {
          not: null,
        },
      },
    });

    const documentoFileNamesDB = documentosFromDB.map((documento) => {
      if (documento.rutaLocal) {
        return path.basename(documento.rutaLocal);
      }
      return null;
    }).filter(Boolean);

    const filesInFolder = fs.readdirSync(documentosFolderPath);

    filesInFolder.forEach((file) => {
      if (!documentoFileNamesDB.includes(file)) {
        const filePath = path.join(documentosFolderPath, file);
        fs.unlinkSync(filePath);
        console.log(`Eliminado: ${file}`);
      }
    });

    console.log('Limpieza de documentos completada.');
  } catch (error) {
    console.error('Error durante la limpieza de documentos:', error);
  } finally {
    await prisma.$disconnect();
  }
}

cleanDocumentos();