import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/app/lib/prisma";
import { 
  ArrowLeft, 
  HelpCircle, 
  Clock, 
  CheckCircle, 
  Loader2, 
  User, 
  Calendar,
  Award
} from "lucide-react";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ pruebaId: string }>;
}

export default async function QuizDetailResultsPage({ params }: PageProps) {
  const { pruebaId } = await params;

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

  // 1. Obtener detalles de la evaluación
  const prueba = await prisma.prueba.findUnique({
    where: { id: pruebaId },
    select: {
      title: true,
      description: true,
      timeLimitMinutes: true
    }
  });

  if (!prueba) {
    return (
      <div className="text-center p-10 bg-gray-50 border border-gray-200 rounded-2xl max-w-xl mx-auto my-12 text-gray-700">
        <h2 className="text-xl font-bold">Evaluación No Encontrada</h2>
        <p className="text-sm mt-2">
          La evaluación con el ID solicitado no existe en la base de datos.
        </p>
        <Link 
          href="/dashboard/admin/pruebas/resultados"
          className="mt-4 inline-flex items-center gap-2 text-emerald-600 hover:text-emerald-700 font-bold"
        >
          <ArrowLeft className="w-4 h-4" /> Volver a Resultados
        </Link>
      </div>
    );
  }

  // 2. Obtener intentos para este examen
  const intentos = await prisma.intentoPrueba.findMany({
    where: { pruebaId },
    orderBy: { createdAt: "desc" }
  });

  // 3. Obtener detalles de los usuarios en una sola consulta
  const userIds = intentos.map((a) => a.userId);
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
  usersList.forEach((u) => {
    usersMap[u.id] = u;
  });

  // Calcular agregados rápidos para este examen
  const completedAttempts = intentos.filter((a) => a.status === "COMPLETED");
  const averageScore = completedAttempts.length > 0 
    ? completedAttempts.reduce((acc, curr) => acc + (curr.score || 0), 0) / completedAttempts.length 
    : 0;

  return (
    <div className="w-full max-w-5xl mx-auto p-4 md:p-6 bg-white/40 rounded-3xl backdrop-blur-md shadow-sm border border-white/20 space-y-6">
      {/* Cabecera */}
      <div className="flex flex-col gap-4 border-b border-gray-100 pb-5">
        <Link 
          href="/dashboard/admin/pruebas/resultados"
          className="text-xs font-bold text-gray-500 hover:text-gray-700 transition-colors flex items-center gap-1.5 w-fit"
        >
          <ArrowLeft className="w-4 h-4" />
          Volver a Resultados
        </Link>
        <div>
          <h2 className="text-xl font-bold text-gray-800">
            Detalle de Resultados: {prueba.title}
          </h2>
          <p className="text-gray-500 text-xs mt-1">
            {prueba.description || "Sin descripción disponible para esta evaluación."}
          </p>
        </div>
      </div>

      {/* Tarjetas KPI Rápidas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-5 rounded-2xl border border-gray-150 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-emerald-50 rounded-xl text-emerald-600">
            <CheckCircle className="w-5 h-5" />
          </div>
          <div>
            <span className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider">
              Intentos Totales
            </span>
            <span className="text-xl font-black text-gray-800">{intentos.length}</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-150 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-amber-50 rounded-xl text-amber-600">
            <Award className="w-5 h-5" />
          </div>
          <div>
            <span className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider">
              Puntuación Promedio
            </span>
            <span className="text-xl font-black text-gray-800">
              {averageScore.toFixed(1)}%
            </span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-150 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-rose-50 rounded-xl text-rose-600">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <span className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider">
              Tiempo Límite
            </span>
            <span className="text-xl font-black text-gray-800">
              {prueba.timeLimitMinutes ? `${prueba.timeLimitMinutes} min` : "Sin límite"}
            </span>
          </div>
        </div>
      </div>

      {/* Listado de Intentos */}
      <div className="bg-white rounded-2xl border border-gray-150 shadow-sm overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-150">
          <h3 className="text-base font-bold text-gray-800">
            Intentos Realizados
          </h3>
        </div>

        {intentos.length === 0 ? (
          <div className="text-center py-12 space-y-4">
            <HelpCircle className="mx-auto w-10 h-10 text-gray-300" />
            <p className="text-gray-500 text-xs">Aún ningún usuario ha realizado esta evaluación.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-150 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                  <th className="px-6 py-4">Usuario</th>
                  <th className="px-6 py-4 text-center">Estado</th>
                  <th className="px-6 py-4 text-center">Puntaje</th>
                  <th className="px-6 py-4 text-right">Fecha y Hora</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-xs">
                {intentos.map((intento) => {
                  const user = usersMap[intento.userId];
                  const isCompleted = intento.status === "COMPLETED";
                  const isTimeout = intento.status === "TIMEOUT";

                  return (
                    <tr key={intento.id} className="hover:bg-gray-50/50">
                      <td className="px-6 py-4">
                        {user ? (
                          <div>
                            <span className="font-bold text-gray-800 block">
                              {user.nombre} {user.apellido1}
                            </span>
                            <span className="text-[10px] text-gray-400 mt-0.5 block">
                              {user.email} (ID: {user.id})
                            </span>
                          </div>
                        ) : (
                          <span className="text-gray-400 italic">Usuario no encontrado (ID: {intento.userId})</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full font-bold uppercase text-[9px] ${
                          isCompleted
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-100"
                            : isTimeout
                            ? "bg-rose-50 text-rose-700 border border-rose-100 animate-pulse"
                            : "bg-amber-50 text-amber-700 border border-amber-100"
                        }`}>
                          {isCompleted ? (
                            <CheckCircle className="w-3 h-3" />
                          ) : isTimeout ? (
                            <Clock className="w-3 h-3" />
                          ) : (
                            <Loader2 className="w-3 h-3 animate-spin" />
                          )}
                          {intento.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center font-bold text-sm">
                        {intento.score !== null ? (
                          <span className={intento.score >= 60 ? "text-emerald-600" : "text-amber-500"}>
                            {intento.score}%
                          </span>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right text-gray-500 font-semibold">
                        <div className="flex flex-col items-end">
                          <span className="flex items-center gap-1 justify-end">
                            <Calendar className="w-3.5 h-3.5 text-gray-300" />
                            {new Date(intento.createdAt).toLocaleDateString("es-CL", {
                              day: "2-digit",
                              month: "2-digit",
                              year: "numeric"
                            })}
                          </span>
                          <span className="text-[10px] text-gray-400 mt-0.5">
                            {new Date(intento.createdAt).toLocaleTimeString("es-CL", {
                              hour: "2-digit",
                              minute: "2-digit"
                            })}
                          </span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
