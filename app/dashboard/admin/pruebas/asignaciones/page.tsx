import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "@/app/lib/prisma";
import AsignacionesPruebasClient from "@/app/components/operaciones-pruebas/AsignacionesPruebasClient";

export const dynamic = "force-dynamic";

export default async function AsignacionesPage() {
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

  // 1. Obtener todos los pruebas activos para el selector
  const pruebas = await prisma.prueba.findMany({
    where: { isActive: true },
    select: {
      id: true,
      title: true
    },
    orderBy: { title: "asc" }
  });

  // 2. Obtener todas las asignaciones de exámenes
  const asignaciones = await prisma.asignacionPrueba.findMany({
    include: {
      prueba: {
        select: {
          title: true
        }
      }
    },
    orderBy: { prueba: { title: "asc" } }
  });

  // 3. Obtener los detalles de los usuarios asignados para enriquecer la visualización
  const userIds = asignaciones
    .filter((a) => a.userId !== null)
    .map((a) => a.userId as number);

  const usersList = await prisma.user.findMany({
    where: { id: { in: userIds } },
    select: {
      id: true,
      nombre: true,
      apellido1: true,
      email: true
    }
  });

  const usersMap: Record<number, { id: number; nombre: string; apellido1: string; email: string }> = {};
  usersList.forEach((user) => {
    usersMap[user.id] = user;
  });

  return (
    <div className="w-full max-w-5xl mx-auto p-4 md:p-6 bg-white/40 rounded-3xl backdrop-blur-md shadow-sm border border-white/20">
      <AsignacionesPruebasClient 
        pruebas={pruebas} 
        asignaciones={asignaciones} 
        users={usersMap} 
      />
    </div>
  );
}
