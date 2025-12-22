import { defineConfig } from 'prisma/config';
import * as dotenv from 'dotenv';
import path from 'path';

// 1. Forzamos la carga del archivo .env desde la carpeta actual
dotenv.config({ path: path.join(process.cwd(), '.env') });

export default defineConfig({
  schema: "prisma/schema.prisma",
  datasource: {
    // 2. Ahora sí, process.env tendrá el valor real
    url: process.env.DATABASE_URL,
  },
});