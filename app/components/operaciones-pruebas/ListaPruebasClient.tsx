"use client";

import { useState } from "react";
import { toast } from "react-toastify";
import { 
  BookOpen, 
  Clock, 
  CheckCircle, 
  XCircle, 
  Play, 
  RotateCcw, 
  HelpCircle,
  Loader2,
  Calendar,
  ArrowLeft
} from "lucide-react";
import { startQuizAction } from "@/app/actions/quiz";
import ClienteExamen from "./ClienteExamen";

interface IntentoPrueba {
  id: string;
  score: number | null;
  status: string;
  createdAt: Date;
}

interface QuizData {
  id: string;
  title: string;
  description: string | null;
  timeLimitMinutes: number | null;
  limiteIntentos?: number | null;
  intentos: IntentoPrueba[];
}

interface ListaPruebasClientProps {
  pruebasIniciales: QuizData[];
  intentosUsuario: any[];
}

export default function ListaPruebasClient({ pruebasIniciales, intentosUsuario }: ListaPruebasClientProps) {
  const [pruebas, setQuizzes] = useState<QuizData[]>(pruebasIniciales);
  const [examenActivo, setActiveExam] = useState<{
    intentoId: string;
    prueba: {
      id: string;
      title: string;
      description: string | null;
      timeLimitMinutes: number | null;
      preguntas: {
        id: string;
        text: string;
        opciones: {
          id: string;
          text: string;
        }[];
      }[];
    };
  } | null>(null);
  const [idPruebaIniciando, setStartingQuizId] = useState<string | null>(null);
  const [intentoSeleccionadoRevision, setSelectedAttemptForReview] = useState<any | null>(null);

  const manejarInicioPrueba = async (pruebaId: string) => {
    if (idPruebaIniciando) return;
    setStartingQuizId(pruebaId);

    try {
      const result = await startQuizAction(pruebaId);
      if (result.success && result.intentoId && result.prueba) {
        setActiveExam({
          intentoId: result.intentoId,
          prueba: result.prueba,
        });
      } else {
        toast.error(result.error || "No se pudo iniciar la evaluación.");
      }
    } catch (error) {
      console.error(error);
      toast.error("Ocurrió un error inesperado al iniciar la evaluación.");
    } finally {
      setStartingQuizId(null);
    }
  };

  // Si hay un examen activo, renderizamos el componente de examen directamente
  if (examenActivo) {
    return <ClienteExamen intentoId={examenActivo.intentoId} prueba={examenActivo.prueba} />;
  }

  if (intentoSeleccionadoRevision) {
    const capturaIntento = intentoSeleccionadoRevision.snapshot as any;
    const preguntasParaMostrar = (capturaIntento && capturaIntento.preguntas)
      ? capturaIntento.preguntas
      : (intentoSeleccionadoRevision.prueba?.preguntas || []);

    const tituloPrueba = capturaIntento ? capturaIntento.title : (intentoSeleccionadoRevision.prueba?.title || "Evaluación");
    const descPrueba = capturaIntento ? capturaIntento.description : (intentoSeleccionadoRevision.prueba?.description || "");

    return (
      <div className="space-y-6 bg-white p-6 rounded-3xl border border-gray-150 shadow-sm animate-fadeIn">
        <div className="flex flex-col gap-4 border-b border-gray-100 pb-4">
          <button
            onClick={() => setSelectedAttemptForReview(null)}
            className="text-xs font-bold text-gray-500 hover:text-gray-700 transition-colors flex items-center gap-1 w-fit"
          >
            <ArrowLeft className="w-4 h-4" />
            Volver a Evaluaciones
          </button>
          <div>
            <h2 className="text-xl font-extrabold text-gray-800 leading-snug">{tituloPrueba}</h2>
            {descPrueba && <p className="text-gray-500 text-xs mt-1">{descPrueba}</p>}
            <div className="flex items-center gap-3 mt-3 text-xs">
              <span className={`px-2.5 py-0.5 rounded-full font-bold uppercase text-[9px] ${
                intentoSeleccionadoRevision.status === "COMPLETED" ? "bg-emerald-50 text-emerald-700 border border-emerald-100" :
                intentoSeleccionadoRevision.status === "TIMEOUT" ? "bg-rose-50 text-rose-700 border border-rose-100" :
                "bg-amber-50 text-amber-700 border border-amber-100"
              }`}>
                {intentoSeleccionadoRevision.status}
              </span>
              {intentoSeleccionadoRevision.score !== null && (
                <span className={`font-bold ${intentoSeleccionadoRevision.score >= 60 ? "text-emerald-600" : "text-amber-500"}`}>
                  Puntaje: {intentoSeleccionadoRevision.score}% {intentoSeleccionadoRevision.score >= 60 ? "(Aprobado)" : "(Reprobado)"}
                </span>
              )}
              <span className="text-gray-400">
                Fecha: {new Date(intentoSeleccionadoRevision.createdAt).toLocaleDateString("es-CL")}
              </span>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          {preguntasParaMostrar.map((q: any, qIdx: number) => {
            const respuestaUsuario = intentoSeleccionadoRevision.respuestas?.find((ans: any) => ans.preguntaId === q.id);
            return (
              <div key={q.id} className="bg-white p-5 rounded-2xl border border-gray-150 shadow-sm space-y-3">
                <div className="flex items-start gap-2">
                  <span className="font-black text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-lg">
                    P{qIdx + 1}
                  </span>
                  <h4 className="text-xs font-bold text-gray-800 mt-0.5 leading-snug">{q.text}</h4>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs pt-1">
                  {q.opciones.map((opt: any) => {
                    const seleccionadoPorUsuario = respuestaUsuario?.opcionId === opt.id;
                    const esCorrecta = opt.isCorrect;
                    
                    let estiloTarjeta = "border-gray-150 bg-gray-50/50 text-gray-600";
                    let etiqueta = null;

                    if (seleccionadoPorUsuario) {
                      if (esCorrecta) {
                        estiloTarjeta = "border-emerald-500 bg-emerald-50 text-emerald-800 font-semibold";
                        etiqueta = (
                          <span className="inline-flex items-center gap-0.5 text-[9px] font-bold bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded-full ml-auto">
                            <CheckCircle className="w-3 h-3" /> Tu Selección (Correcta)
                          </span>
                        );
                      } else {
                        estiloTarjeta = "border-rose-500 bg-rose-50 text-rose-800 font-semibold";
                        etiqueta = (
                          <span className="inline-flex items-center gap-0.5 text-[9px] font-bold bg-rose-100 text-rose-700 px-1.5 py-0.5 rounded-full ml-auto">
                            <XCircle className="w-3 h-3" /> Tu Selección (Incorrecta)
                          </span>
                        );
                      }
                    } else if (esCorrecta) {
                      estiloTarjeta = "border-emerald-300 bg-emerald-50/20 text-emerald-700 font-semibold";
                      etiqueta = (
                        <span className="inline-flex items-center gap-0.5 text-[9px] font-bold bg-emerald-100/50 text-emerald-600 px-1.5 py-0.5 rounded-full ml-auto">
                          Correcta
                        </span>
                      );
                    }

                    return (
                      <div 
                        key={opt.id} 
                        className={`p-2.5 rounded-xl border flex items-center gap-2 ${estiloTarjeta}`}
                      >
                        <span className="flex-grow">{opt.text}</span>
                        {etiqueta}
                      </div>
                    );
                  })}
                </div>
                
                {!respuestaUsuario && (
                  <p className="text-[10px] text-rose-500 font-bold italic pt-1">
                    * No respondiste esta pregunta.
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div className="w-full space-y-6">
      {/* Encabezado */}
      <div className="bg-white p-6 rounded-2xl border border-gray-150 shadow-sm flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-800 tracking-tight">Evaluaciones de Capacitación</h1>
          <p className="text-gray-500 text-sm mt-1">
            Revisa y responde los exámenes asignados a tu cuenta para medir tu aprendizaje.
          </p>
        </div>
        <div className="flex items-center gap-2 bg-emerald-50 px-4 py-2 rounded-xl text-emerald-800 text-sm font-semibold border border-emerald-100">
          <BookOpen className="w-4 h-4" />
          <span>{pruebas.length} {pruebas.length === 1 ? "Prueba disponible" : "Pruebas disponibles"}</span>
        </div>
      </div>

      {pruebas.length === 0 ? (
        <div className="text-center p-12 bg-white rounded-2xl border border-gray-150 shadow-sm space-y-4">
          <div className="mx-auto w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center text-gray-400">
            <HelpCircle className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-700">No tienes evaluaciones asignadas</h3>
            <p className="text-gray-500 text-sm mt-1">
              Cuando un administrador te asigne una evaluación, aparecerá en esta sección.
            </p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {pruebas.map((prueba) => {
            const ultimoIntento = prueba.intentos[0]; // Ordenado por fecha descendente
            const tieneIntentos = prueba.intentos.length > 0;
            const estaAprobado = ultimoIntento && ultimoIntento.score !== null && ultimoIntento.score >= 60;
            const estaExpirado = ultimoIntento && ultimoIntento.status === "TIMEOUT";
            const limiteAlcanzado = prueba.limiteIntentos !== null && prueba.limiteIntentos !== undefined && prueba.intentos.length >= prueba.limiteIntentos;

            return (
              <div 
                key={prueba.id}
                className="bg-white rounded-2xl border border-gray-150 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-between overflow-hidden"
              >
                {/* Cuerpo de la Tarjeta */}
                <div className="p-6 space-y-4">
                  <div className="flex justify-between items-start gap-4">
                    <h3 className="text-lg font-bold text-gray-800 leading-snug">
                      {prueba.title}
                    </h3>

                    {/* Badge de Estado */}
                    {!tieneIntentos ? (
                      <span className="text-[10px] font-bold uppercase tracking-wider bg-amber-50 text-amber-700 border border-amber-200 px-2.5 py-1 rounded-full">
                        Pendiente
                      </span>
                    ) : estaExpirado ? (
                      <span className="text-[10px] font-bold uppercase tracking-wider bg-rose-50 text-rose-700 border border-rose-200 px-2.5 py-1 rounded-full">
                        Expirado
                      </span>
                    ) : estaAprobado ? (
                      <span className="text-[10px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200 px-2.5 py-1 rounded-full">
                        Aprobado ({ultimoIntento.score}%)
                      </span>
                    ) : (
                      <span className="text-[10px] font-bold uppercase tracking-wider bg-amber-50 text-amber-700 border border-amber-200 px-2.5 py-1 rounded-full">
                        Reprobado ({ultimoIntento.score}%)
                      </span>
                    )}
                  </div>

                  <p className="text-gray-500 text-sm line-clamp-3">
                    {prueba.description || "Sin descripción disponible para esta evaluación."}
                  </p>

                  <div className="flex flex-wrap items-center gap-4 text-xs text-gray-400 pt-2">
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4 text-gray-300" />
                      <span>
                        {prueba.timeLimitMinutes 
                          ? `${prueba.timeLimitMinutes} min de tiempo límite` 
                          : "Sin límite de tiempo"}
                      </span>
                    </div>

                    {prueba.limiteIntentos && (
                      <div className="flex items-center gap-1">
                        <CheckCircle className="w-4 h-4 text-gray-300" />
                        <span>
                          Límite: {prueba.limiteIntentos} {prueba.limiteIntentos === 1 ? 'intento' : 'intentos'}
                        </span>
                      </div>
                    )}

                    {tieneIntentos && (
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4 text-gray-300" />
                        <span>
                          Último intento: {new Date(ultimoIntento.createdAt).toLocaleDateString("es-CL", {
                            day: "2-digit",
                            month: "2-digit",
                            year: "numeric"
                          })}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Pie de la Tarjeta con Botón de Acción */}
                <div className="bg-gray-50/50 px-6 py-4 border-t border-gray-100 flex items-center justify-between">
                  {tieneIntentos ? (
                    <div className="text-xs">
                      <span className="text-gray-400">Intentos realizados: </span>
                      <span className="font-bold text-gray-700">{prueba.intentos.length}</span>
                    </div>
                  ) : (
                    <span className="text-xs text-gray-400">Nunca realizado</span>
                  )}

                  <button
                    onClick={() => manejarInicioPrueba(prueba.id)}
                    disabled={idPruebaIniciando !== null || limiteAlcanzado}
                    className={`py-2 px-4 rounded-xl text-xs font-bold transition-all duration-200 flex items-center gap-1.5 ${
                      idPruebaIniciando === prueba.id || limiteAlcanzado
                        ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                        : estaAprobado
                        ? "bg-white border border-gray-200 hover:bg-gray-50 text-gray-700"
                        : "bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm hover:shadow-md"
                    }`}
                  >
                    {idPruebaIniciando === prueba.id ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        Cargando...
                      </>
                    ) : limiteAlcanzado ? (
                      <>
                        <XCircle className="w-3.5 h-3.5" />
                        Límite Alcanzado
                      </>
                    ) : estaAprobado ? (
                      <>
                        <RotateCcw className="w-3.5 h-3.5" />
                        Repetir
                      </>
                    ) : tieneIntentos ? (
                      <>
                        <RotateCcw className="w-3.5 h-3.5" />
                        Reintentar
                      </>
                    ) : (
                      <>
                        <Play className="w-3.5 h-3.5 fill-current" />
                        Iniciar
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Historial de Evaluaciones */}
      <div className="bg-white p-6 rounded-2xl border border-gray-150 shadow-sm space-y-4">
        <h2 className="text-base font-extrabold text-gray-800 tracking-tight flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-emerald-600" />
          Historial de Evaluaciones Realizadas
        </h2>
        {intentosUsuario.length === 0 ? (
          <p className="text-gray-400 text-xs text-center py-8">Aún no has realizado ninguna evaluación.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-150 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                  <th className="px-6 py-3">Evaluación</th>
                  <th className="px-6 py-3 text-center">Estado</th>
                  <th className="px-6 py-3 text-center">Puntaje</th>
                  <th className="px-6 py-3 text-center">Fecha</th>
                  <th className="px-6 py-3 text-right">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {intentosUsuario.map((intento) => {
                  const capturaIntento = intento.snapshot as any;
                  const title = capturaIntento ? capturaIntento.title : (intento.prueba?.title || "Evaluación");
                  const isDeleted = !intento.prueba || intento.prueba.deletedAt !== null;
                  
                  const estaCompletado = intento.status === "COMPLETED";
                  const estaExpirado = intento.status === "TIMEOUT";

                  return (
                    <tr key={intento.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-6 py-4 font-semibold text-gray-800">
                        {title}
                        {isDeleted && (
                          <span className="ml-2 text-[9px] bg-gray-100 text-gray-500 font-bold px-1.5 py-0.5 rounded-full">
                            Eliminada
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full font-bold uppercase text-[9px] ${
                          estaCompletado ? "bg-emerald-50 text-emerald-700 border border-emerald-100" :
                          estaExpirado ? "bg-rose-50 text-rose-700 border border-rose-100" :
                          "bg-amber-50 text-amber-700 border border-amber-100"
                        }`}>
                          {intento.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center font-bold text-sm">
                        {intento.score !== null ? (
                          <span className={intento.score >= 60 ? "text-emerald-600" : "text-amber-500"}>
                            {intento.score}%
                          </span>
                        ) : "-"}
                      </td>
                      <td className="px-6 py-4 text-center text-gray-500 font-semibold">
                        {new Date(intento.createdAt).toLocaleDateString("es-CL")}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => setSelectedAttemptForReview(intento)}
                          className="px-3 py-1.5 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 font-bold rounded-lg transition-colors text-[10px]"
                        >
                          Revisar Respuestas
                        </button>
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
