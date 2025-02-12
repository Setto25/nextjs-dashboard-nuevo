// app/api/users/route.ts
import { NextResponse, NextRequest } from "next/server";
import { PrismaClient } from "@prisma/client";

import bcrypt from "bcryptjs";


const prisma = new PrismaClient();


export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const termino = searchParams.get('q') || '';
    const tipo = searchParams.get('tipo') || '';

    console.log('🔍 Buscando termino:', termino);
    console.log('🔍 Buscando tipo:', tipo);

    let parametrosBusqueda= {};  //let determina que la variable solo se puede usar dentro deel bloque en que se encuentra, ademas permite reasignar valores a la variable, no asi const. parametrosBusquedaes un objeto que se usa para buscar en la base de datos, almacena una clave y un valor.

    switch (tipo) {
      case 'rut':
        parametrosBusqueda= { rut: { contains: termino } }; // aqui parametrosBusquedaalmacena la clave titulo y el valor que contiene termino
        break;
      case 'nombre':
        parametrosBusqueda= { nombre: { contains: termino } }; // aqui parametrosBusquedaalmacena la clave titulo y el valor que contiene termino
        break;
      case 'apellido1':
        parametrosBusqueda= { apellido1: { contains: termino } };
        break;
        case 'apellido2':
          parametrosBusqueda= { apellido2: { contains: termino } };
          break;
    /*  case 'email':
        parametrosBusqueda= { email: { contains: termino } };
        break;*/
        case 'role':
          parametrosBusqueda= { role: { contains: termino } };
          break;
      case 'todos':
        parametrosBusqueda= { //aqui parametrosBusquedaalmacena un objeto con la clave OR y el valor que contiene un arreglo con los valores de las claves categorias, descripcion y titulo.
          OR: [ // or para buscar en cualquiera d elas categorias
            { nombre: { contains: termino } },
            { apellido1: { contains: termino } },
            { apellido2: { contains: termino } },
            { rut: { contains: termino } },
            { role: { contains: termino } },
          ]
        };
        break;

      case '':
        parametrosBusqueda= {};
        break;


      default:
        parametrosBusqueda= {};
    }

    console.log("RESULTADO SWITCH", parametrosBusqueda)

    const usuarios = await prisma.user.findMany({
      where: parametrosBusqueda,
    });

    return NextResponse.json(usuarios);

  } catch (error) {
    console.error('❌ Error:', error);
    return NextResponse.json(
      { message: "Error al buscar usuarios" },
      { status: 500 }
    );
  }
}




////////////////////////////////////




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