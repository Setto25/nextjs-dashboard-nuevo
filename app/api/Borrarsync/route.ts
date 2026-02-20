import { NextResponse } from 'next/server'
import path from 'path'
import { syncBackupPublicAndDb } from 'app/scripts/sync/sync'

const projectRoot = process.cwd()

// Obtener ruta AppData en Windows o fallback
const appDataPath = process.env.APPDATA || path.join(process.env.HOME || '', '.config')
const backupRoot = path.join(appDataPath, 'NeoCapNextBackup')

export async function POST() {
  try {
    await syncBackupPublicAndDb(projectRoot, backupRoot)
    return NextResponse.json({ message: 'Backup sincronizado correctamente' })
  } catch (error: any) {
    console.error('Error haciendo backup:', error)
    return NextResponse.json({ error: error.message || 'Error inesperado' }, { status: 500 })
  }
}