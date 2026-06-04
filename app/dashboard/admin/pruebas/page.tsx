import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "@/app/lib/prisma";
import GestorPruebasClient from "@/app/components/operaciones-pruebas/GestorPruebasClient";

export const dynamic = "force-dynamic";

export default async function AdminPruebasPage() {
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

  // Protección de Rol
  const allowedRoles = ["admin", "super_admin"];
  if (!allowedRoles.includes(session.role.toLowerCase())) {
    return (
      <div className="text-center p-10 bg-rose-50 border border-rose-200 rounded-2xl max-w-xl mx-auto my-12 text-rose-800">
        <h2 className="text-xl font-bold">Acceso Denegado</h2>
        <p className="text-sm mt-2">
          No tienes permisos de administrador para visualizar esta sección.
        </p>
      </div>
    );
  }

  // Cargar exámenes con conteo de preguntas
  const pruebas = await prisma.prueba.findMany({
    include: {
      _count: {
        select: { preguntas: true }
      }
    },
    orderBy: { createdAt: "desc" }
  });

  const formattedQuizzes = pruebas.map((q) => ({
    id: q.id,
    title: q.title,
    description: q.description,
    timeLimitMinutes: q.timeLimitMinutes,
    isActive: q.isActive,
    preguntaCount: q._count.preguntas
  }));

  return (
    <div className="w-full max-w-5xl mx-auto p-4 md:p-6 bg-white/40 rounded-3xl backdrop-blur-md shadow-sm border border-white/20">
      <GestorPruebasClient pruebas={formattedQuizzes} />
    </div>
  );
}
