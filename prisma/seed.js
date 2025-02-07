import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const hashedPassword = await bcrypt.hash("admin123", 10);
  
  await prisma.user.upsert({
    where: { email: 'admin@example.com' }, // Busca el usuario por email  
    update: {  
      nombre: "Admin",  
      apellido1: "Ejemplo",  
      apellido2: "Test",  
      password: "$2a$10$H8HIPGjLn7NxKAlO7fmdLOC7RXz7Ux3LTzqgF2kxthBUQsGP9kHMe",  
      role: "admin",  
    },  
    create: {  
      email: "admin@example.com",  
      nombre: "Admin",  
      apellido1: "Ejemplo",  
      apellido2: "Test",  
      password: "$2a$10$H8HIPGjLn7NxKAlO7fmdLOC7RXz7Ux3LTzqgF2kxthBUQsGP9kHMe",  
      role: "admin",  
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