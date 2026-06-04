"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { 
  Timer, 
  ChevronLeft, 
  ChevronRight, 
  CheckCircle2, 
  AlertTriangle, 
  BookOpen, 
  Loader2, 
  Award,
  Clock
} from "lucide-react";
import { submitQuizAction } from "@/app/actions/quiz";

interface OpcionPrueba {
  id: string;
  text: string;
}

interface PreguntaPrueba {
  id: string;
  text: string;
  opciones: OpcionPrueba[];
}

interface Prueba {
  id: string;
  title: string;
  description: string | null;
  timeLimitMinutes: number | null;
  preguntas: PreguntaPrueba[];
}

interface ClienteExamenProps {
  intentoId: string;
  prueba: Prueba;
}

export default function ClienteExamen({ intentoId, prueba }: ClienteExamenProps) {
  const router = useRouter();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [respuestas, setAnswers] = useState<Record<string, string>>({});
  const [tiempoRestante, setTiempoRestante] = useState<number | null>(
    prueba.timeLimitMinutes ? prueba.timeLimitMinutes * 60 : null
  );
  const [enviando, setEnviando] = useState(false);
  const [results, setResults] = useState<{
    success: boolean;
    status?: string;
    score?: number;
    correctCount?: number;
    totalQuestions?: number;
    error?: string;
  } | null>(null);

  const hasAutoSubmitted = useRef(false);

  // Timer Effect
  useEffect(() => {
    if (tiempoRestante === null || results !== null) return;

    if (tiempoRestante <= 0) {
      handleAutoSubmit();
      return;
    }

    const timer = setInterval(() => {
      setTiempoRestante((prev) => (prev !== null ? prev - 1 : null));
    }, 1000);

    return () => clearInterval(timer);
  }, [tiempoRestante, results]);

  const handleSelectOption = (preguntaId: string, opcionId: string) => {
    if (results !== null || enviando) return;
    setAnswers((prev) => ({
      ...prev,
      [preguntaId]: opcionId,
    }));
  };

  const formatearTiempo = (segundos: number) => {
    const mins = Math.floor(segundos / 60);
    const secs = segundos % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const getTimerColor = () => {
    if (tiempoRestante === null) return "text-emerald-600 bg-emerald-50";
    if (tiempoRestante < 60) return "text-rose-600 bg-rose-50 border-rose-200 animate-pulse";
    if (tiempoRestante < 180) return "text-amber-600 bg-amber-50 border-amber-200";
    return "text-emerald-600 bg-emerald-50 border-emerald-200";
  };

  const manejarEnvio = async (estaExpirado = false) => {
    if (enviando || results !== null) return;
    setEnviando(true);

    // Formatear respuestas
    const formattedAnswers = Object.entries(respuestas).map(([preguntaId, opcionId]) => ({
      preguntaId,
      opcionId,
    }));

    try {
      const response = await submitQuizAction(intentoId, formattedAnswers);
      setResults(response);

      if (response.success) {
        toast.success("¡Evaluación enviada con éxito!");
      } else {
        if (response.status === "TIMEOUT") {
          toast.error("El tiempo de la prueba ha expirado.");
        } else {
          toast.error(response.error || "Ocurrió un error al enviar las respuestas.");
        }
      }
    } catch (error: any) {
      console.error(error);
      toast.error("Error de red o del servidor al enviar la evaluación.");
    } finally {
      setEnviando(false);
    }
  };

  const handleAutoSubmit = () => {
    if (hasAutoSubmitted.current) return;
    hasAutoSubmitted.current = true;
    manejarEnvio(true);
  };

  const answeredCount = Object.keys(respuestas).length;
  const progressPercent = (answeredCount / prueba.preguntas.length) * 100;
  const preguntaActual = prueba.preguntas[currentIndex];

  // Pantalla de Resultados
  if (results !== null) {
    const estaCompletado = results.status === "COMPLETED";
    const score = results.score ?? 0;
    const isPassed = score >= 60; // Nota de aprobación estándar del 60%

    return (
      <div className="max-w-2xl mx-auto my-8 bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden transform transition-all duration-300">
        <div className="p-8 text-center bg-gradient-to-br from-gray-50 to-gray-100 border-b border-gray-150">
          <div className="flex justify-center mb-6">
            {estaCompletado ? (
              isPassed ? (
                <div className="p-4 bg-emerald-100 rounded-full text-emerald-600 shadow-inner">
                  <Award className="w-16 h-16" />
                </div>
              ) : (
                <div className="p-4 bg-amber-100 rounded-full text-amber-600 shadow-inner">
                  <Award className="w-16 h-16" />
                </div>
              )
            ) : (
              <div className="p-4 bg-rose-100 rounded-full text-rose-600 shadow-inner">
                <Clock className="w-16 h-16" />
              </div>
            )}
          </div>

          <h2 className="text-3xl font-extrabold text-gray-800 tracking-tight mb-2">
            {estaCompletado ? "Evaluación Finalizada" : "Tiempo Expirado"}
          </h2>
          <p className="text-gray-500 font-medium max-w-md mx-auto">
            {estaCompletado 
              ? `Has completado la prueba "${prueba.title}". Tu resultado ha sido calculado correctamente.`
              : "El examen ha excedido el límite de tiempo asignado y se ha enviado automáticamente."}
          </p>
        </div>

        <div className="p-8 space-y-8">
          {/* Puntuación radial / circular */}
          {estaCompletado && (
            <div className="flex flex-col items-center justify-center space-y-2">
              <div className="relative flex items-center justify-center">
                {/* SVG circular progress */}
                <svg className="w-36 h-36 transform -rotate-90">
                  <circle
                    cx="72"
                    cy="72"
                    r="60"
                    stroke="#F3F4F6"
                    strokeWidth="10"
                    fill="transparent"
                  />
                  <circle
                    cx="72"
                    cy="72"
                    r="60"
                    stroke={isPassed ? "#10B981" : "#F59E0B"}
                    strokeWidth="10"
                    fill="transparent"
                    strokeDasharray={377}
                    strokeDashoffset={377 - (377 * score) / 100}
                    strokeLinecap="round"
                    className="transition-all duration-1000 ease-out"
                  />
                </svg>
                <div className="absolute text-center">
                  <span className="text-4xl font-extrabold text-gray-800">
                    {score}%
                  </span>
                </div>
              </div>

              <div className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider ${
                isPassed ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"
              }`}>
                {isPassed ? "Aprobado" : "Reprobado"}
              </div>
            </div>
          )}

          {/* Estadísticas de la Prueba */}
          <div className="grid grid-cols-2 gap-4 bg-gray-50 p-6 rounded-2xl border border-gray-100">
            <div className="text-center border-r border-gray-200">
              <span className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">
                Respuestas Correctas
              </span>
              <span className="text-2xl font-extrabold text-gray-700">
                {results.correctCount ?? 0} / {results.totalQuestions ?? prueba.preguntas.length}
              </span>
            </div>
            <div className="text-center">
              <span className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">
                Estado Final
              </span>
              <span className={`text-xl font-extrabold uppercase ${
                estaCompletado 
                  ? (isPassed ? "text-emerald-600" : "text-amber-500")
                  : "text-rose-600"
              }`}>
                {results.status === "TIMEOUT" ? "TIMEOUT" : (isPassed ? "APROBADO" : "REPROBADO")}
              </span>
            </div>
          </div>

          {/* Botones de acción */}
          <div className="flex gap-4 pt-4">
            <button
              type="button"
              onClick={() => router.push("/dashboard/capacitacion/pruebas")}
              className="flex-1 py-3.5 px-6 bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white font-bold rounded-xl shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-2"
            >
              Volver a Evaluaciones
            </button>
            <button
              type="button"
              onClick={() => router.push("/dashboard")}
              className="flex-1 py-3.5 px-6 bg-white hover:bg-gray-50 border border-gray-200 text-gray-700 font-bold rounded-xl transition-all duration-200 flex items-center justify-center gap-2"
            >
              Ir al Inicio
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto my-6 grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
      {/* Columna Principal (Preguntas y Respuestas) */}
      <div className="lg:col-span-2 space-y-6">
        {/* Encabezado e indicador de progreso */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full uppercase tracking-wider">
              Pregunta {currentIndex + 1} de {prueba.preguntas.length}
            </span>
            <span className="text-xs font-bold text-gray-400">
              Progreso: {Math.round(progressPercent)}%
            </span>
          </div>

          <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
            <div 
              className="bg-gradient-to-r from-emerald-500 to-teal-600 h-full rounded-full transition-all duration-500 ease-out"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* Carta de Pregunta */}
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 space-y-6 min-h-[350px] flex flex-col justify-between">
          <div className="space-y-6">
            <h3 className="text-xl font-bold text-gray-800 leading-snug">
              {preguntaActual.text}
            </h3>

            {/* Alternativas */}
            <div className="space-y-3">
              {preguntaActual.opciones.map((option) => {
                const isSelected = respuestas[preguntaActual.id] === option.id;
                return (
                  <button
                    key={option.id}
                    onClick={() => handleSelectOption(preguntaActual.id, option.id)}
                    className={`w-full text-left p-4 rounded-xl border text-sm font-medium transition-all duration-200 flex items-center justify-between group ${
                      isSelected
                        ? "bg-emerald-50/50 border-emerald-500 text-emerald-800 ring-2 ring-emerald-500/20 shadow-sm"
                        : "bg-white border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50/50 hover:text-gray-900"
                    }`}
                  >
                    <span>{option.text}</span>
                    <div className={`w-5 h-5 rounded-full border flex items-center justify-center transition-all ${
                      isSelected
                        ? "border-emerald-500 bg-emerald-500 text-white"
                        : "border-gray-300 group-hover:border-gray-400"
                    }`}>
                      {isSelected && <CheckCircle2 className="w-3.5 h-3.5" />}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Navegación inferior */}
          <div className="flex justify-between items-center pt-6 border-t border-gray-100 mt-8">
            <button
              onClick={() => setCurrentIndex((prev) => Math.max(0, prev - 1))}
              disabled={currentIndex === 0}
              className="py-2.5 px-4 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all font-semibold text-xs flex items-center gap-2"
            >
              <ChevronLeft className="w-4 h-4" />
              Anterior
            </button>

            {currentIndex < prueba.preguntas.length - 1 ? (
              <button
                onClick={() => setCurrentIndex((prev) => Math.min(prueba.preguntas.length - 1, prev + 1))}
                className="py-2.5 px-4 bg-gray-800 text-white rounded-xl hover:bg-gray-900 transition-all font-semibold text-xs flex items-center gap-2"
              >
                Siguiente
                <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={() => manejarEnvio(false)}
                disabled={enviando || answeredCount < prueba.preguntas.length}
                className={`py-2.5 px-5 text-white font-bold rounded-xl transition-all shadow-md text-xs flex items-center gap-2 ${
                  answeredCount < prueba.preguntas.length
                    ? "bg-gray-300 cursor-not-allowed shadow-none"
                    : "bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800"
                }`}
              >
                {enviando ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Enviando...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    Terminar Examen
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Columna Lateral (Información de la prueba y Timer) */}
      <div className="space-y-6">
        {/* Tarjeta de Info y Temporizador */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-6">
          <h2 className="text-lg font-bold text-gray-800 border-b border-gray-100 pb-3 flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-emerald-600" />
            {prueba.title}
          </h2>

          {/* Temporizador */}
          {tiempoRestante !== null ? (
            <div className={`p-4 rounded-xl border flex items-center gap-4 transition-all duration-300 ${getTimerColor()}`}>
              <Timer className="w-6 h-6 flex-shrink-0" />
              <div>
                <span className="block text-[10px] font-bold uppercase tracking-wider opacity-70">
                  Tiempo Restante
                </span>
                <span className="text-2xl font-black font-mono">
                  {formatearTiempo(tiempoRestante)}
                </span>
              </div>
            </div>
          ) : (
            <div className="p-4 rounded-xl border border-gray-200 bg-gray-50 flex items-center gap-4 text-gray-500">
              <Clock className="w-6 h-6" />
              <div>
                <span className="block text-[10px] font-bold uppercase tracking-wider">
                  Tiempo Límite
                </span>
                <span className="text-sm font-bold">
                  Sin límite de tiempo
                </span>
              </div>
            </div>
          )}

          {/* Resumen de Preguntas / Estado de Respuestas */}
          <div className="space-y-3">
            <span className="block text-xs font-bold text-gray-400 uppercase tracking-wider">
              Estado de Respuestas
            </span>
            <div className="grid grid-cols-5 gap-2">
              {prueba.preguntas.map((q, idx) => {
                const isAnswered = respuestas[q.id] !== undefined;
                const isCurrent = currentIndex === idx;
                return (
                  <button
                    key={q.id}
                    onClick={() => setCurrentIndex(idx)}
                    className={`h-10 rounded-lg text-xs font-bold border transition-all flex items-center justify-center ${
                      isCurrent
                        ? "border-emerald-600 bg-emerald-50 text-emerald-700 font-extrabold ring-2 ring-emerald-500/25"
                        : isAnswered
                        ? "bg-gray-100 border-gray-200 text-gray-700 font-medium"
                        : "bg-white border-gray-200 text-gray-400 hover:border-gray-300"
                    }`}
                  >
                    {idx + 1}
                  </button>
                );
              })}
            </div>
            {answeredCount < prueba.preguntas.length && (
              <div className="flex items-center gap-2 text-amber-600 bg-amber-50 border border-amber-100 p-3 rounded-lg text-xs font-medium mt-4">
                <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                <span>Quedan preguntas pendientes por responder.</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
