import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "@/app/lib/prisma";
import ListaPruebasClient from "@/app/components/operaciones-pruebas/ListaPruebasClient";

export const dynamic = "force-dynamic";

export default async function PruebasPage() {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get("session");

  if (!sessionCookie) {
    redirect("/");
  }

  let session: { id: number; email: string; role: string };
  try {
    session = JSON.parse(sessionCookie.value);
  } catch (e) {
    redirect("/");
  }

  // Obtener pruebas donde hay una asignación para el usuario actual (por su ID o por su rol)
  const pruebas = await prisma.prueba.findMany({
    where: {
      deletedAt: null,
      isActive: true,
      asignaciones: {
        some: {
          OR: [
            { userId: session.id },
            { role: { equals: session.role, mode: "insensitive" } }
          ]
        }
      }
    },
    select: {
      id: true,
      title: true,
      description: true,
      timeLimitMinutes: true,
      limiteIntentos: true,
      intentos: {
        where: { userId: session.id },
        select: {
          id: true,
          score: true,
          status: true,
          createdAt: true
        },
        orderBy: { createdAt: "desc" }
      }
    }
  });

  // Obtener todo el historial de intentos del usuario con sus respuestas
  const userAttempts = await prisma.intentoPrueba.findMany({
    where: { userId: session.id },
    include: {
      respuestas: true,
      prueba: {
        include: {
          preguntas: {
            include: {
              opciones: true
            }
          }
        }
      }
    },
    orderBy: { createdAt: "desc" }
  });

  return (
    <div className="w-full max-w-5xl mx-auto p-4 md:p-6 bg-white/40 rounded-3xl backdrop-blur-md shadow-sm border border-white/20">
      <ListaPruebasClient pruebasIniciales={pruebas} intentosUsuario={userAttempts as any[]} />
    </div>
  );
}
