"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { 
  ClipboardList, 
  Plus, 
  Loader2, 
  HelpCircle,
  Eye,
  CheckCircle,
  XCircle,
  Clock
} from "lucide-react";
import { createDummyQuizAction } from "@/app/actions/quiz";

interface PruebaItem {
  id: string;
  title: string;
  description: string | null;
  timeLimitMinutes: number | null;
  isActive: boolean;
  preguntaCount: number;
}

interface GestorPruebasClientProps {
  pruebas: PruebaItem[];
}

export default function GestorPruebasClient({ pruebas }: GestorPruebasClientProps) {
  const router = useRouter();
  const [creandoDemo, setCreandoDemo] = useState(false);

  const manejarCrearPruebaDemo = async () => {
    if (creandoDemo) return;
    setCreandoDemo(true);

    try {
      const result = await createDummyQuizAction();
      if (result.success) {
        toast.success("¡Examen de prueba sembrado con éxito!");
        router.refresh();
      } else {
        toast.error(result.error || "No se pudo crear la evaluación.");
      }
    } catch (error) {
      console.error(error);
      toast.error("Ocurrió un error inesperado al sembrar la evaluación.");
    } finally {
      setCreandoDemo(false);
    }
  };

  return (
    <div className="w-full space-y-6">
      {/* Encabezado */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-gray-100 pb-5">
        <div>
          <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
            <ClipboardList className="w-5 h-5 text-emerald-600" />
            Gestión de Evaluaciones
          </h2>
          <p className="text-gray-500 text-xs mt-1">
            Visualiza y crea exámenes para los usuarios del sistema.
          </p>
        </div>
        <button
          onClick={manejarCrearPruebaDemo}
          disabled={creandoDemo}
          className="bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white py-2 px-4 rounded-xl text-xs font-bold shadow-md hover:shadow-lg transition-all duration-200 flex items-center gap-1.5 self-start md:self-auto"
        >
          {creandoDemo ? (
            <>
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              Sembrando...
            </>
          ) : (
            <>
              <Plus className="w-3.5 h-3.5" />
              Sembrar Examen de Prueba
            </>
          )}
        </button>
      </div>

      {pruebas.length === 0 ? (
        <div className="text-center p-12 bg-white rounded-2xl border border-gray-150 shadow-sm space-y-4">
          <div className="mx-auto w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center text-gray-400">
            <HelpCircle className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-gray-700">No hay evaluaciones creadas</h3>
            <p className="text-gray-500 text-xs mt-1">
              Presiona el botón "Sembrar Examen de Prueba" para inicializar una evaluación de prueba en la base de datos.
            </p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {pruebas.map((prueba) => (
            <div 
              key={prueba.id}
              className="bg-white rounded-2xl border border-gray-150 shadow-sm p-6 flex flex-col justify-between hover:shadow-md transition-all duration-300"
            >
              <div className="space-y-4">
                <div className="flex justify-between items-start gap-4">
                  <h3 className="text-base font-bold text-gray-800 leading-snug">
                    {prueba.title}
                  </h3>
                  <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full flex items-center gap-1 ${
                    prueba.isActive 
                      ? "bg-emerald-50 text-emerald-700 border border-emerald-200" 
                      : "bg-gray-50 text-gray-500 border border-gray-200"
                  }`}>
                    {prueba.isActive ? (
                      <>
                        <CheckCircle className="w-3 h-3" />
                        Activo
                      </>
                    ) : (
                      <>
                        <XCircle className="w-3 h-3" />
                        Inactivo
                      </>
                    )}
                  </span>
                </div>

                <p className="text-gray-500 text-xs line-clamp-3">
                  {prueba.description || "Sin descripción disponible para esta evaluación."}
                </p>

                <div className="flex flex-wrap items-center gap-4 text-[11px] text-gray-400 pt-2">
                  <div className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-gray-300" />
                    <span>
                      {prueba.timeLimitMinutes 
                        ? `${prueba.timeLimitMinutes} min de tiempo límite` 
                        : "Sin límite de tiempo"}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <ClipboardList className="w-3.5 h-3.5 text-gray-300" />
                    <span>
                      {prueba.preguntaCount} {prueba.preguntaCount === 1 ? "pregunta" : "preguntas"}
                    </span>
                  </div>
                </div>
              </div>

              <div className="border-t border-gray-100 mt-5 pt-4 flex items-center justify-between text-xs text-gray-400">
                <span>ID: {prueba.id}</span>
                <span className="font-semibold text-emerald-600 hover:text-emerald-700 transition-colors flex items-center gap-1 cursor-pointer">
                  <Eye className="w-3.5 h-3.5" />
                  Ver Preguntas
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
