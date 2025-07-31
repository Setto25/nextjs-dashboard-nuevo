import fs from 'fs/promises';
import path from 'path';
import os from 'os';

function getAppDataPath(appName:any) {
  const platform = os.platform();

  if (platform === 'win32') {
    return path.join(process.env.APPDATA || '', appName);
  } else if (platform === 'darwin') {
    return path.join(process.env.HOME || '', 'Library', 'Application Support', appName);
  } else {
    return path.join(process.env.XDG_DATA_HOME || path.join(process.env.HOME || '', '.local', 'share'), appName);
  }
}

const appName = 'NeoCapNextBackup';
const projectRoot = process.cwd();
const backupDir = getAppDataPath(appName);

// Carpetas a excluir del backup
const excludeDirs = new Set(['node_modules', '.git', '.next']);

async function copyChangedFiles(srcDir: any, destDir:any) {
  await fs.mkdir(destDir, { recursive: true });

  const entries = await fs.readdir(srcDir, { withFileTypes: true });

  for (const entry of entries) {
    if (excludeDirs.has(entry.name)) {
      // Saltar carpetas excluidas
      continue;
    }

    const srcPath = path.join(srcDir, entry.name);
    const destPath = path.join(destDir, entry.name);

    if (entry.isDirectory()) {
      await copyChangedFiles(srcPath, destPath);
    } else {
      let copyFile = false;
      try {
        const [srcStat, destStat] = await Promise.all([
          fs.stat(srcPath),
          fs.stat(destPath)
        ]);
        if (srcStat.mtimeMs > destStat.mtimeMs) {
          copyFile = true;
        }
      } catch {
        // Si no existe en destino, copiar
        copyFile = true;
      }
      if (copyFile) {
        await fs.copyFile(srcPath, destPath);
        console.log(`Archivo copiado o actualizado: ${srcPath} -> ${destPath}`);
      }
    }
  }
}

export async function backup() {
  console.log(`Iniciando backup completo del proyecto en: ${backupDir}`);

  await copyChangedFiles(projectRoot, backupDir);

  console.log('Backup completo finalizado correctamente.');
}

// Para ejecutar inmediatamente si este archivo se corre directamente
if (import.meta.url === `file://${process.argv[1]}`) {
  backup().catch(console.error);
}