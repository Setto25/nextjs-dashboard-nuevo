// app/api/autenticacion/registro/route.ts
import { NextResponse, NextRequest } from "next/server";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
//import { formatRut } from "@/utils/rut";

const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
  try {
    const { rut, nombre, apellido1, apellido2, email, password, role } = await req.json();

    // Validar y formatear RUT
   // const formattedRut = formatRut(rut);

    // Verificar si el RUT ya está registrado
    const existingUser = await prisma.user.findUnique({ where: { rut } });
    if (existingUser) {
      return NextResponse.json({ error: "RUT ya registrado" }, { status: 400 });
    }

    // Hashear contraseña
    const hashedPassword = bcrypt.hashSync(password, 10);

    // Crear usuario
    const newUser = await prisma.user.create({
      data: {
        rut,   
        nombre,
        apellido1,
        apellido2,
        email,
        password: hashedPassword,
        role,
      },
    });

    return NextResponse.json({ success: true, user: newUser }, { status: 201 });

  } catch (error: any) {
    console.error('Error al registra usuario', error);
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}