import { PrismaClient } from '@prisma/client'
import { Pool, neonConfig } from '@neondatabase/serverless' // Cambiado pool -> Pool
import { PrismaNeon } from '@prisma/adapter-neon'
import ws from 'ws'

// Configuración para que funcione en Node.js localmente
neonConfig.webSocketConstructor = ws

neonConfig.webSocketConstructor = ws

const prismaClientSingleton = () => {
  const url = process.env.DATABASE_URL
  
  // Si esto falla aquí, el console.log te avisará antes del error de Prisma
  if (!url) {
    throw new Error("❌ DATABASE_URL no encontrada en el Singleton");
  }

  const connectionPool = new Pool({ connectionString: url })
  const adapter = new PrismaNeon(connectionPool as any)

  // IMPORTANTE: Asegúrate de pasar el adapter aquí
  return new PrismaClient({ 
    adapter,
    log: ['query', 'error', 'warn'] 
  })
}
declare const globalThis: {
  prismaGlobal: ReturnType<typeof prismaClientSingleton>;
} & typeof global;

const prisma = globalThis.prismaGlobal ?? prismaClientSingleton()

export default prisma

if (process.env.NODE_ENV !== 'production') globalThis.prismaGlobal = prisma