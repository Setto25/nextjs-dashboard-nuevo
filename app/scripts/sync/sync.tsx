import fs from 'fs/promises'
import path from 'path'

async function syncBackupTotal(
  srcDir: string,
  destDir: string,
  excludeDirs = new Set<string>()
) {
  // Crear destino si no existe
  await fs.mkdir(destDir, { recursive: true })

  // Leer contenido de origen y destino
  const [srcEntries, destEntries] = await Promise.all([
    fs.readdir(srcDir, { withFileTypes: true }).catch(() => []),
    fs.readdir(destDir, { withFileTypes: true }).catch(() => []),
  ])

  console.log(`Sincronizando:\n  ORIGEN: ${srcDir}\n  DESTINO: ${destDir}`)
  console.log(`  Archivos carpeta origen: ${srcEntries.map(e => e.name).join(', ')}`)
  console.log(`  Archivos carpeta destino: ${destEntries.map(e => e.name).join(', ')}`)

  const srcNames = new Set(srcEntries.map(e => e.name))

  // Eliminar del destino archivos/carpetas que no están en el origen
  for (const destEntry of destEntries) {
    if (!srcNames.has(destEntry.name)) {
      if (excludeDirs.has(destEntry.name)) continue
      const destPath = path.join(destDir, destEntry.name)
      await fs.rm(destPath, { recursive: true, force: true })
      console.log(`  Eliminado del backup: ${destPath}`)
    }
  }

  // Copiar/actualizar archivos y carpetas del origen al destino
  for (const srcEntry of srcEntries) {
    if (excludeDirs.has(srcEntry.name)) continue

    const srcPath = path.join(srcDir, srcEntry.name)
    const destPath = path.join(destDir, srcEntry.name)

    if (srcEntry.isDirectory()) {
      // Recursividad para directorios
      await syncBackupTotal(srcPath, destPath, excludeDirs)
      // Después de sincronizar, comprobar si la carpeta destino quedó vacía y eliminarla
      const destInnerEntries = await fs.readdir(destPath).catch(() => [])
      if (destInnerEntries.length === 0) {
        await fs.rmdir(destPath)
        console.log(`  Carpeta vacía eliminada del backup: ${destPath}`)
      }
    } else {
      let shouldCopy = false
      try {
        const [srcStat, destStat] = await Promise.all([
          fs.stat(srcPath),
          fs.stat(destPath),
        ])
        // Copiar si origen es más nuevo
        if (srcStat.mtimeMs > destStat.mtimeMs) shouldCopy = true
      } catch {
        // Si no existe destino copiar
        shouldCopy = true
      }

      if (shouldCopy) {
        await fs.copyFile(srcPath, destPath)
        console.log(`  Copiado o actualizado: ${srcPath}`)
      }
    }
  }
}

export async function syncBackupPublicAndDb(
  projectRoot: string,
  backupRoot: string
) {
  const publicSrc = path.join(projectRoot, 'public')
  const publicDest = path.join(backupRoot, 'public')

  const prismaDbSrc = path.join(projectRoot, 'prisma', 'dev.db')
  const prismaDbDestDir = path.join(backupRoot, 'prisma')
  const prismaDbDest = path.join(prismaDbDestDir, 'dev.db')

  // Sincronizar carpeta public completamente (copiar, actualizar y eliminar sobrantes)
  await syncBackupTotal(publicSrc, publicDest, new Set())

  // Copiar archivo base de datos SQLite si existe
  try {
    await fs.mkdir(prismaDbDestDir, { recursive: true })
    await fs.copyFile(prismaDbSrc, prismaDbDest)
    console.log(`Backup base de datos SQLite copiado a: ${prismaDbDest}`)
  } catch (error: any) {
    if (error.code === 'ENOENT') {
      console.log('Archivo SQLite no encontrado, omitiendo backup DB')
    } else {
      throw error
    }
  }
}
