import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "@/app/lib/prisma";
import { unstable_cache } from "next/cache";
import AdminPruebasDashboard from "@/app/components/Quizs/AdminPruebasDashboard";

export const dynamic = "force-dynamic";

// Envolver las consultas de base de datos en unstable_cache por 60 segundos.
const getCachedQuizStats = unstable_cache(
  async () => {
    // 1. Obtener todos los pruebas con su cantidad de preguntas
    const pruebas = await prisma.prueba.findMany({
      include: {
        _count: {
          select: { preguntas: true }
        }
      }
    });

    // 2. Obtener la cantidad de intentos e promedio de puntuación por prueba
    const groupStats = await prisma.intentoPrueba.groupBy({
      by: ["pruebaId"],
      _count: {
        id: true
      },
      _avg: {
        score: true
      }
    });

    // 3. Obtener el desglose de estados por prueba
    const statusStats = await prisma.intentoPrueba.groupBy({
      by: ["pruebaId", "status"],
      _count: {
        id: true
      }
    });

    // Mapear los datos de Prisma agregados a nuestro formato de UI
    return pruebas.map((q) => {
      const gStat = groupStats.find((g) => g.pruebaId === q.id);
      
      const qStatus = statusStats.filter((s) => s.pruebaId === q.id);
      const completedCount = qStatus.find((s) => s.status === "COMPLETED")?._count.id || 0;
      const timeoutCount = qStatus.find((s) => s.status === "TIMEOUT")?._count.id || 0;
      const inProgressCount = qStatus.find((s) => s.status === "IN_PROGRESS")?._count.id || 0;

      return {
        id: q.id,
        title: q.title,
        description: q.description,
        timeLimitMinutes: q.timeLimitMinutes,
        isActive: q.isActive,
        preguntaCount: q._count.preguntas,
        attemptCount: gStat?._count.id || 0,
        averageScore: gStat?._avg.score || 0,
        completedCount,
        timeoutCount,
        inProgressCount
      };
    });
  },
  ["admin-prueba-statistics-v2"],
  {
    revalidate: 60, // Caché de 60 segundos
    tags: ["prueba-stats"]
  }
);

export default async function AdminResultadosPage() {
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

  const stats = await getCachedQuizStats();

  return (
    <div className="w-full max-w-5xl mx-auto p-4 md:p-6 bg-white/40 rounded-3xl backdrop-blur-md shadow-sm border border-white/20">
      <AdminPruebasDashboard stats={stats} />
    </div>
  );
}
