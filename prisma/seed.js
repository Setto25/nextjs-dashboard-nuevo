import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import 'dotenv/config';

const prisma = new PrismaClient();

async function main() {
  const adminPassword = process.env.ADMIN_PASSWORD; // Obtener la contraseña de la variable de entorno

  if (!adminPassword) {
    console.error("Error: ADMIN_PASSWORD environment variable is not set.");
    process.exit(1);
  }

  const hashedPassword = await bcrypt.hash(process.env.ADMIN_PASSWORD, 10);

  await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: {
      nombre: "Admin",
      apellido1: "Ejemplo",
      apellido2: "Test",
      password: hashedPassword,
      role: "admin",
      rut: "111111111",
      createdAt: new Date(),
    },
    create: {
      email: "admin@example.com",
      nombre: "Admin",
      apellido1: "Ejemplo",
      apellido2: "Test",
      password: hashedPassword,
      role: "admin",
      rut: "111111111",
      createdAt: new Date(),
    },
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });