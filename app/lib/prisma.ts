import { PrismaClient } from '@prisma/client'
import { PrismaNeon } from '@prisma/adapter-neon'
import dotenv from 'dotenv'


const prismaClientSingleton = () => {
  const url = process.env.DATABASE_URL

  // Si no hay URL (común durante el 'npm run build' de Vercel), 
  // devolvemos un cliente básico para que el build no se rompa.
  if (!url || url === 'undefined') {
    return new PrismaClient()
  }

  // Si hay URL, creamos el adaptador de Neon correctamente
const adapter = new PrismaNeon({ connectionString: url })
  return new PrismaClient({ adapter })
}
  
dotenv.config()
const connectionString = `${process.env.DATABASE_URL}`


export const prisma = prismaClientSingleton()
