  import { PrismaClient } from "@prisma/client";
  import bcrypt from "bcryptjs";

  const prisma = new PrismaClient();

  async function main() {
    const hashedPassword = await bcrypt.hash("admin123", 10);
    
    await prisma.user.upsert({
      where: { email: 'admin@example.com' },
      update: {
        nombre: "Admin",
        apellido1: "Ejemplo",
        apellido2: "Test",
        password: hashedPassword,
        role: "admin",
        rut: "111111111", // Valor válido para el RUT
        createdAt: new Date(), // Fecha válida para evitar nulos
      },
      create: {
        email: "admin@example.com",
        nombre: "Admin",
        apellido1: "Ejemplo",
        apellido2: "Test",
        password: hashedPassword,
        role: "admin",
        rut: "111111111", // Valor válido
        createdAt: new Date(), // Fecha válida
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

    //Función: Crea un usuario admin al ejecutar npx prisma db seed.