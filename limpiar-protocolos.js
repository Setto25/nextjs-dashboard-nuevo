import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const prisma = new PrismaClient();
const protocolosFolderPath = path.join(__dirname, 'public', 'uploads', 'protocolos');

async function cleanProtocolos() {
  try {
    const protocolosFromDB = await prisma.protocolo.findMany({
      where: {
        rutaLocal: {
          not: null,
        },
      },
    });

    const protocoloFileNamesDB = protocolosFromDB.map((protocolo) => {
      if (protocolo.rutaLocal) {
        return path.basename(protocolo.rutaLocal);
      }
      return null;
    }).filter(Boolean);

    const filesInFolder = fs.readdirSync(protocolosFolderPath);

    filesInFolder.forEach((file) => {
      if (!protocoloFileNamesDB.includes(file)) {
        const filePath = path.join(protocolosFolderPath, file);
        fs.unlinkSync(filePath);
        console.log(`Eliminado: ${file}`);
      }
    });

    console.log('Limpieza de protocoloscompletada.');
  } catch (error) {
    console.error('Error durante la limpieza de protocolos:', error);
  } finally {
    await prisma.$disconnect();
  }
}

cleanProtocolos();