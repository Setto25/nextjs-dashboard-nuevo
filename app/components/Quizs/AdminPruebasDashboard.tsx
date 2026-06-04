"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { 
  BarChart3, 
  Users, 
  Clock, 
  Plus, 
  Loader2, 
  TrendingUp, 
  CheckCircle2, 
  XCircle,
  HelpCircle,
  Activity
} from "lucide-react";
import { createDummyQuizAction } from "@/app/actions/quiz";

interface PruebaStat {
  id: string;
  title: string;
  description: string | null;
  timeLimitMinutes: number | null;
  isActive: boolean;
  preguntaCount: number;
  attemptCount: number;
  averageScore: number;
  completedCount: number;
  timeoutCount: number;
  inProgressCount: number;
}

interface AdminPruebasDashboardProps {
  stats: PruebaStat[];
}

export default function AdminPruebasDashboard({ stats }: AdminPruebasDashboardProps) {
  const router = useRouter();
  const [creandoDemo, setCreandoDemo] = useState(false);

  const manejarCrearPruebaDemo = async () => {
    if (creandoDemo) return;
    setCreandoDemo(true);

    try {
      const result = await createDummyQuizAction();
      if (result.success) {
        toast.success("¡Evaluación de prueba creada correctamente!");
        router.refresh(); // Refrescar los datos del servidor
      } else {
        toast.error(result.error || "No se pudo crear la evaluación.");
      }
    } catch (error) {
      console.error(error);
      toast.error("Ocurrió un error inesperado al crear la evaluación.");
    } finally {
      setCreandoDemo(false);
    }
  };

  // Calcular agregados generales
  const totalQuizzes = stats.length;
  const totalAttempts = stats.reduce((acc, curr) => acc + curr.attemptCount, 0);
  const totalCompleted = stats.reduce((acc, curr) => acc + curr.completedCount, 0);
  const totalTimeout = stats.reduce((acc, curr) => acc + curr.timeoutCount, 0);
  
  // Promedio ponderado de puntuaciones
  const weightedScoreSum = stats.reduce((acc, curr) => acc + (curr.averageScore * curr.attemptCount), 0);
  const averageOverallScore = totalAttempts > 0 ? (weightedScoreSum / totalAttempts) : 0;

  return (
    <div className="w-full space-y-8">
      {/* Encabezado */}
      <div className="bg-white p-6 rounded-2xl border border-gray-150 shadow-sm flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-800 tracking-tight flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-emerald-600" />
            Panel de Evaluaciones (Admin)
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Visualiza resúmenes de rendimiento y gestiona los exámenes cargados en el sistema.
          </p>
        </div>
        <button
          onClick={manejarCrearPruebaDemo}
          disabled={creandoDemo}
          className="bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white py-2.5 px-4 rounded-xl text-xs font-bold shadow-md hover:shadow-lg transition-all duration-200 flex items-center gap-2"
        >
          {creandoDemo ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Creando evaluación...
            </>
          ) : (
            <>
              <Plus className="w-4 h-4" />
              Sembrar Examen de Prueba
            </>
          )}
        </button>
      </div>

      {/* Tarjetas KPI */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-gray-150 shadow-sm flex items-center gap-4">
          <div className="p-3.5 bg-emerald-50 rounded-xl text-emerald-600">
            <HelpCircle className="w-6 h-6" />
          </div>
          <div>
            <span className="block text-xs font-bold text-gray-400 uppercase tracking-wider">
              Exámenes
            </span>
            <span className="text-2xl font-black text-gray-800">{totalQuizzes}</span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-gray-150 shadow-sm flex items-center gap-4">
          <div className="p-3.5 bg-sky-50 rounded-xl text-sky-600">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <span className="block text-xs font-bold text-gray-400 uppercase tracking-wider">
              Intentos Totales
            </span>
            <span className="text-2xl font-black text-gray-800">{totalAttempts}</span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-gray-150 shadow-sm flex items-center gap-4">
          <div className="p-3.5 bg-amber-50 rounded-xl text-amber-600">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <span className="block text-xs font-bold text-gray-400 uppercase tracking-wider">
              Promedio General
            </span>
            <span className="text-2xl font-black text-gray-800">
              {averageOverallScore.toFixed(1)}%
            </span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-gray-150 shadow-sm flex items-center gap-4">
          <div className="p-3.5 bg-rose-50 rounded-xl text-rose-600">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <span className="block text-xs font-bold text-gray-400 uppercase tracking-wider">
              Expirados (Timeout)
            </span>
            <span className="text-2xl font-black text-gray-800">{totalTimeout}</span>
          </div>
        </div>
      </div>

      {/* Tabla/Lista de Exámenes */}
      <div className="bg-white rounded-2xl border border-gray-150 shadow-sm overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-150 flex items-center justify-between">
          <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
            <Activity className="w-5 h-5 text-gray-400" />
            Rendimiento por Evaluación
          </h3>
          <span className="text-xs bg-gray-100 text-gray-600 px-2.5 py-1 rounded-full font-semibold">
            Neon Free Tier Optimizado
          </span>
        </div>

        {stats.length === 0 ? (
          <div className="text-center p-12 space-y-4">
            <HelpCircle className="mx-auto w-12 h-12 text-gray-300" />
            <div className="max-w-xs mx-auto">
              <h4 className="text-gray-700 font-bold">No hay evaluaciones</h4>
              <p className="text-gray-500 text-xs mt-1">
                Haz clic en "Sembrar Examen de Prueba" arriba para generar datos de prueba y visualizar estadísticas.
              </p>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-150 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                  <th className="px-6 py-4">Evaluación</th>
                  <th className="px-6 py-4">Preguntas</th>
                  <th className="px-6 py-4">Intentos</th>
                  <th className="px-6 py-4 text-center">Estados (C / T / P)</th>
                  <th className="px-6 py-4 text-right">Nota Promedio</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-sm">
                {stats.map((prueba) => (
                  <tr 
                    key={prueba.id} 
                    className="hover:bg-gray-50/55 transition-colors cursor-pointer"
                    onClick={() => router.push(`/dashboard/admin/pruebas/resultados/${prueba.id}`)}
                  >
                    <td className="px-6 py-4">
                      <div>
                        <span className="font-bold text-gray-800 block">{prueba.title}</span>
                        <span className="text-xs text-gray-400 line-clamp-1 mt-0.5">
                          {prueba.description || "Sin descripción"}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-500 font-semibold">
                      {prueba.preguntaCount} {prueba.preguntaCount === 1 ? "pregunta" : "preguntas"}
                    </td>
                    <td className="px-6 py-4 text-gray-700 font-bold">
                      {prueba.attemptCount}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center gap-4 text-xs font-semibold">
                        <span className="flex items-center gap-1 text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md" title="Completados">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          {prueba.completedCount}
                        </span>
                        <span className="flex items-center gap-1 text-rose-600 bg-rose-50 px-2 py-0.5 rounded-md" title="Expirados (Timeout)">
                          <Clock className="w-3.5 h-3.5" />
                          {prueba.timeoutCount}
                        </span>
                        <span className="flex items-center gap-1 text-amber-600 bg-amber-50 px-2 py-0.5 rounded-md" title="En Progreso">
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          {prueba.inProgressCount}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right font-black">
                      <span className={prueba.averageScore >= 60 ? "text-emerald-600" : "text-amber-500"}>
                        {prueba.averageScore.toFixed(1)}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
