"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { 
  ClipboardList, 
  UserPlus, 
  BarChart3, 
  Plus, 
  Trash2, 
  Loader2, 
  Shield, 
  User, 
  Clock, 
  ArrowLeft, 
  CheckCircle, 
  XCircle, 
  Award, 
  Activity, 
  HelpCircle,
  PlusCircle,
  BookOpen,
  Calendar,
  CheckSquare,
  Pencil,
  RotateCcw,
  ChevronDown,
  ChevronRight
} from "lucide-react";
import { 
  getAdminQuizDataAction, 
  getQuizAttemptsAction,
  createTemaAction,
  createQuestionAction,
  createQuizWithQuestionsAction,
  updateQuizAction,
  assignQuizAction, 
  assignQuizToUsersAction,
  revokeQuizAssignmentAction,
  createDummyQuizAction,
  deleteQuestionAction,
  deleteQuizAction,
  restoreQuizAction,
  updateQuestionAction
} from "@/app/actions/quiz";

// Interfaces
interface OpcionPrueba {
  id: string;
  text: string;
  isCorrect: boolean;
}

interface QuestionItem {
  id: string;
  text: string;
  pruebaTitle?: string | null;
  quizTitles?: string[];
  temaId?: number | null;
  temaName?: string | null;
  opciones: OpcionPrueba[];
}

interface TemaItem {
  id: number;
  tema: string;
}

interface PruebaItem {
  id: string;
  title: string;
  isActive: boolean;
  description: string;
  timeLimitMinutes: number | null;
  limiteIntentos?: number | null;
  preguntaIds?: string[];
}

interface DeletedQuizItem {
  id: string;
  title: string;
  isActive: boolean;
  description: string;
  timeLimitMinutes: number | null;
  preguntaCount: number;
  deletedAt: string | Date | null;
}

interface Assignment {
  id: string;
  pruebaId: string;
  userId: number | null;
  role: string | null;
  prueba: {
    title: string;
  };
}

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

interface UserMapItem {
  id: number;
  nombre: string;
  apellido1: string;
  email: string;
}

interface AllUserItem {
  id: number;
  nombre: string;
  apellido1: string;
  email: string;
  role: string;
}

export default function GestionEvaluaciones() {
  const router = useRouter();
  const [activeSubTab, setActiveSubTab] = useState<"gestion" | "asignaciones" | "resultados">("gestion");
  const [loading, setLoading] = useState(true);

  // Datos globales de admin
  const [pruebas, setQuizzes] = useState<PruebaItem[]>([]);
  const [deletedQuizzes, setDeletedQuizzes] = useState<DeletedQuizItem[]>([]);
  const [preguntas, setQuestions] = useState<QuestionItem[]>([]);
  const [temas, setTemas] = useState<TemaItem[]>([]);
  const [asignaciones, setAssignments] = useState<Assignment[]>([]);
  const [usersMap, setUsersMap] = useState<Record<number, UserMapItem>>({});
  const [quizStats, setQuizStats] = useState<PruebaStat[]>([]);
  const [allUsers, setAllUsers] = useState<AllUserItem[]>([]);

  // Estados de búsqueda, filtrado y edición de preguntas
  const [searchQuestionText, setSearchQuestionText] = useState("");
  const [filterQuestionTemaId, setFilterQuestionTemaId] = useState("all");
  const [editingQuestionId, setEditingQuestionId] = useState<string | null>(null);

  // Estados para secciones colapsables y buscador de pruebas
  const [isQuizzesExpanded, setIsQuizzesExpanded] = useState(true);
  const [isQuestionsExpanded, setIsQuestionsExpanded] = useState(true);
  const [isTrashExpanded, setIsTrashExpanded] = useState(false);
  const [searchQuizText, setSearchQuizText] = useState("");

  // Estado del creador de examen de prueba
  const [isSeeding, setIsSeeding] = useState(false);

  // Estados: Formulario de Crear Tema
  const [newTemaName, setNewTemaName] = useState("");
  const [isCreatingTema, setIsCreatingTema] = useState(false);

  // Estados: Formulario de Crear Pregunta
  const [targetTemaId, setTargetTemaId] = useState("");
  const [questionText, setQuestionText] = useState("");
  const [alternatives, setAlternatives] = useState<string[]>(["", "", "", ""]);
  const [correctAlternativeIdx, setCorrectAlternativeIdx] = useState<number>(0);
  const [isCreatingQuestion, setIsCreatingQuestion] = useState(false);

  // Estados: Formulario de Crear Prueba
  const [newQuizTitle, setNewQuizTitle] = useState("");
  const [newQuizDesc, setNewQuizDesc] = useState("");
  const [newQuizTimeLimit, setNewQuizTimeLimit] = useState("");
  const [newQuizLimiteIntentos, setNewQuizLimiteIntentos] = useState("");
  const [filterTemaId, setFilterTemaId] = useState<string>("all");
  const [selectedQuestions, setSelectedQuestions] = useState<string[]>([]);
  const [isCreatingQuiz, setIsCreatingQuiz] = useState(false);
  const [creatorFormMode, setCreatorFormMode] = useState<"none" | "prueba" | "question" | "tema" | "edit_quiz">("none");
  const [editQuizId, setEditQuizId] = useState("");

  // Estados: Panel de Asignaciones
  const [selectedQuizIdAssign, setSelectedQuizIdAssign] = useState("");
  const [assignType, setAssignType] = useState<"role" | "user">("role");
  const [roleName, setRoleName] = useState("");
  const [selectedUserIds, setSelectedUserIds] = useState<number[]>([]);
  const [userSearchText, setUserSearchText] = useState("");
  const [isAssigning, setIsAssigning] = useState(false);
  const [revokingId, setRevokingId] = useState<string | null>(null);

  // Estados: Detalle de Resultados de examen
  const [selectedQuizIdForDetail, setSelectedQuizIdForDetail] = useState<string | null>(null);
  const [selectedQuizTitle, setSelectedQuizTitle] = useState("");
  const [selectedQuizDesc, setSelectedQuizDesc] = useState("");
  const [selectedQuizTimeLimit, setSelectedQuizTimeLimit] = useState<number | null>(null);
  const [attemptsDetail, setAttemptsDetail] = useState<any[]>([]);
  const [detailUsersMap, setDetailUsersMap] = useState<Record<number, UserMapItem>>({});
  const [loadingAttempts, setLoadingAttempts] = useState(false);
  const [selectedAttemptForDetail, setSelectedAttemptForDetail] = useState<any | null>(null);
  const [detailQuizStructure, setDetailQuizStructure] = useState<any | null>(null);

  // Cargar datos
  const loadAdminQuizData = async () => {
    setLoading(true);
    try {
      const res = await getAdminQuizDataAction();
      if (res.success) {
        setQuizzes(res.pruebas || []);
        setDeletedQuizzes((res as any).deletedQuizzes || []);
        setQuestions(res.preguntas || []);
        setTemas(res.temas || []);
        setAssignments(res.asignaciones || []);
        setUsersMap(res.usersMap || {});
        setQuizStats(res.quizStats || []);
        setAllUsers((res as any).allUsers || []);
      } else {
        toast.error(res.error || "No se pudieron cargar los datos.");
      }
    } catch (error) {
      console.error(error);
      toast.error("Error al conectar con el servidor.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAdminQuizData();
  }, []);

  // Sembrar dummy prueba
  const handleCreateDummyQuiz = async () => {
    if (isSeeding) return;
    setIsSeeding(true);
    try {
      const result = await createDummyQuizAction();
      if (result.success) {
        toast.success("¡Examen de prueba sembrado!");
        await loadAdminQuizData();
      } else {
        toast.error(result.error || "No se pudo crear.");
      }
    } catch (error) {
      console.error(error);
      toast.error("Error al sembrar.");
    } finally {
      setIsSeeding(false);
    }
  };

  // Crear Tema
  const handleCreateTemaSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTemaName.trim()) {
      toast.error("El nombre del tema es obligatorio.");
      return;
    }

    setIsCreatingTema(true);
    try {
      const res = await createTemaAction(newTemaName);
      if (res.success) {
        toast.success("¡Tema creado con éxito!");
        setNewTemaName("");
        setCreatorFormMode("none");
        await loadAdminQuizData();
      } else {
        toast.error(res.error || "Error al crear el tema.");
      }
    } catch (error) {
      console.error(error);
      toast.error("Error al enviar el tema.");
    } finally {
      setIsCreatingTema(false);
    }
  };

  // Crear / Editar Pregunta
  const handleCreateQuestionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetTemaId) {
      toast.error("Por favor, selecciona un tema.");
      return;
    }
    if (!questionText.trim()) {
      toast.error("El texto de la pregunta es obligatorio.");
      return;
    }

    const filteredAlts = alternatives.map(a => a.trim()).filter(Boolean);
    if (filteredAlts.length < 2) {
      toast.error("Debe ingresar al menos 2 alternativas.");
      return;
    }

    setIsCreatingQuestion(true);
    try {
      const optionsPayload = alternatives.map((alt, idx) => ({
        text: alt.trim(),
        isCorrect: idx === correctAlternativeIdx
      })).filter(o => o.text !== "");

      let res;
      if (editingQuestionId) {
        res = await updateQuestionAction(editingQuestionId, Number(targetTemaId), questionText, optionsPayload);
      } else {
        res = await createQuestionAction(Number(targetTemaId), questionText, optionsPayload);
      }

      if (res.success) {
        toast.success(editingQuestionId ? "¡Pregunta actualizada con éxito!" : "¡Pregunta creada con éxito!");
        setQuestionText("");
        setAlternatives(["", "", "", ""]);
        setCorrectAlternativeIdx(0);
        setTargetTemaId("");
        setEditingQuestionId(null);
        setCreatorFormMode("none");
        await loadAdminQuizData();
      } else {
        toast.error(res.error || "Error al guardar la pregunta.");
      }
    } catch (error) {
      console.error(error);
      toast.error("Error al enviar la pregunta.");
    } finally {
      setIsCreatingQuestion(false);
    }
  };

  const handleStartEditQuestion = (question: QuestionItem) => {
    setEditingQuestionId(question.id);
    setQuestionText(question.text);
    setTargetTemaId(question.temaId ? question.temaId.toString() : "");
    
    const alts = ["", "", "", ""];
    let correctIdx = 0;
    question.opciones.forEach((opt, idx) => {
      if (idx < 4) {
        alts[idx] = opt.text;
        if (opt.isCorrect) {
          correctIdx = idx;
        }
      }
    });
    setAlternatives(alts);
    setCorrectAlternativeIdx(correctIdx);
    setCreatorFormMode("question");
  };

  const handleRestoreQuiz = async (pruebaId: string) => {
    try {
      const res = await restoreQuizAction(pruebaId);
      if (res.success) {
        toast.success("¡Prueba reintegrada correctamente!");
        await loadAdminQuizData();
      } else {
        toast.error(res.error || "No se pudo reintegrar la prueba.");
      }
    } catch (error) {
      console.error(error);
      toast.error("Error al restaurar.");
    }
  };

  // Crear Prueba (Copiar Preguntas)
  const handleCreateQuizSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newQuizTitle.trim()) {
      toast.error("El título es obligatorio.");
      return;
    }

    setIsCreatingQuiz(true);
    try {
      const timeLimit = newQuizTimeLimit ? Number(newQuizTimeLimit) : null;
      const limitIntentos = newQuizLimiteIntentos ? Number(newQuizLimiteIntentos) : null;
      const res = await createQuizWithQuestionsAction(
        newQuizTitle,
        newQuizDesc || null,
        timeLimit,
        selectedQuestions,
        limitIntentos
      );

      if (res.success) {
        toast.success("¡Evaluación creada con éxito!");
        setNewQuizTitle("");
        setNewQuizDesc("");
        setNewQuizTimeLimit("");
        setNewQuizLimiteIntentos("");
        setSelectedQuestions([]);
        setCreatorFormMode("none");
        await loadAdminQuizData();
      } else {
        toast.error(res.error || "Error al crear la evaluación.");
      }
    } catch (error) {
      console.error(error);
      toast.error("Error de servidor al crear la evaluación.");
    } finally {
      setIsCreatingQuiz(false);
    }
  };

  // Cargar datos para iniciar edición de examen
  const handleStartEditQuiz = (pruebaId: string) => {
    const prueba = pruebas.find((q) => q.id === pruebaId);
    if (!prueba) return;
    setEditQuizId(prueba.id);
    setNewQuizTitle(prueba.title);
    setNewQuizDesc(prueba.description || "");
    setNewQuizTimeLimit(prueba.timeLimitMinutes ? prueba.timeLimitMinutes.toString() : "");
    setNewQuizLimiteIntentos(prueba.limiteIntentos ? prueba.limiteIntentos.toString() : "");
    setSelectedQuestions(prueba.preguntaIds || []);
    setFilterTemaId("all");
    setCreatorFormMode("edit_quiz");
  };

  // Guardar edición de examen
  const handleEditQuizSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newQuizTitle.trim()) {
      toast.error("El título es obligatorio.");
      return;
    }

    setIsCreatingQuiz(true);
    try {
      const timeLimit = newQuizTimeLimit ? Number(newQuizTimeLimit) : null;
      const limitIntentos = newQuizLimiteIntentos ? Number(newQuizLimiteIntentos) : null;
      const res = await updateQuizAction(
        editQuizId,
        newQuizTitle,
        newQuizDesc || null,
        timeLimit,
        selectedQuestions,
        limitIntentos
      );

      if (res.success) {
        toast.success("¡Evaluación actualizada con éxito!");
        setNewQuizTitle("");
        setNewQuizDesc("");
        setNewQuizTimeLimit("");
        setNewQuizLimiteIntentos("");
        setSelectedQuestions([]);
        setEditQuizId("");
        setCreatorFormMode("none");
        await loadAdminQuizData();
      } else {
        toast.error(res.error || "Error al actualizar la evaluación.");
      }
    } catch (error) {
      console.error(error);
      toast.error("Error de servidor al actualizar la evaluación.");
    } finally {
      setIsCreatingQuiz(false);
    }
  };

  // Crear Asignación por Rol
  const handleAssignRoleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedQuizIdAssign) { toast.error("Seleccione un examen."); return; }
    if (!roleName) { toast.error("Seleccione un rol."); return; }
    setIsAssigning(true);
    try {
      const res = await assignQuizAction(selectedQuizIdAssign, roleName, undefined);
      if (res.success) {
        toast.success("¡Evaluación asignada al rol!");
        setSelectedQuizIdAssign("");
        setRoleName("");
        await loadAdminQuizData();
      } else {
        toast.error(res.error || "Error al asignar.");
      }
    } catch (error) {
      console.error(error);
      toast.error("Error al guardar la asignación.");
    } finally {
      setIsAssigning(false);
    }
  };

  // Crear Asignación por Usuarios (multi-select)
  const handleAssignUsersSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedQuizIdAssign) { toast.error("Seleccione un examen."); return; }
    if (selectedUserIds.length === 0) { toast.error("Seleccione al menos un usuario."); return; }
    setIsAssigning(true);
    try {
      const res = await assignQuizToUsersAction(selectedQuizIdAssign, selectedUserIds);
      if (res.success) {
        const skipped = (res as any).skipped || 0;
        const assigned = (res as any).assigned || 0;
        toast.success(`¡${assigned} usuario(s) asignados!${skipped > 0 ? ` (${skipped} ya tenían acceso)` : ""}`);
        setSelectedQuizIdAssign("");
        setSelectedUserIds([]);
        setUserSearchText("");
        await loadAdminQuizData();
      } else {
        toast.error(res.error || "Error al asignar.");
      }
    } catch (error) {
      console.error(error);
      toast.error("Error al guardar las asignaciones.");
    } finally {
      setIsAssigning(false);
    }
  };

  // Revocar Asignación
  const handleRevokeAssignment = async (id: string) => {
    if (revokingId) return;
    setRevokingId(id);
    try {
      const res = await revokeQuizAssignmentAction(id);
      if (res.success) {
        toast.success("Asignación revocada.");
        await loadAdminQuizData();
      } else {
        toast.error(res.error || "No se pudo revocar.");
      }
    } catch (error) {
      console.error(error);
      toast.error("Error al revocar.");
    } finally {
      setRevokingId(null);
    }
  };

  // Cargar intentos de un examen
  const handleViewQuizDetail = async (pruebaId: string, title: string, desc: string | null, limit: number | null) => {
    setLoadingAttempts(true);
    setSelectedQuizIdForDetail(pruebaId);
    setSelectedQuizTitle(title);
    setSelectedQuizDesc(desc || "");
    setSelectedQuizTimeLimit(limit);
    setSelectedAttemptForDetail(null); // Reset single intento drill-down
    try {
      const res = await getQuizAttemptsAction(pruebaId);
      if (res.success) {
        setAttemptsDetail(res.intentos || []);
        setDetailUsersMap(res.usersMap || {});
        setDetailQuizStructure(res.prueba || null);
      } else {
        toast.error(res.error || "Error al cargar los intentos.");
      }
    } catch (error) {
      console.error(error);
      toast.error("Error al conectar con la base de datos.");
    } finally {
      setLoadingAttempts(false);
    }
  };

  // Eliminar Pregunta
  const handleDeleteQuestion = async (preguntaId: string) => {
    if (!confirm("¿Está seguro de que desea eliminar esta pregunta del banco? Esta acción es permanente.")) {
      return;
    }
    try {
      const res = await deleteQuestionAction(preguntaId);
      if (res.success) {
        toast.success("Pregunta eliminada correctamente.");
        await loadAdminQuizData();
      } else {
        toast.error(res.error || "No se pudo eliminar la pregunta.");
      }
    } catch (error) {
      console.error(error);
      toast.error("Error al procesar la eliminación.");
    }
  };

  // Eliminar Examen
  const handleDeleteQuiz = async (pruebaId: string) => {
    if (!confirm("¿Está seguro de que desea eliminar este examen? Las preguntas asociadas no se borrarán, volverán a estar disponibles en el banco.")) {
      return;
    }
    try {
      const res = await deleteQuizAction(pruebaId);
      if (res.success) {
        toast.success("Examen eliminado correctamente.");
        await loadAdminQuizData();
      } else {
        toast.error(res.error || "No se pudo eliminar el examen.");
      }
    } catch (error) {
      console.error(error);
      toast.error("Error al procesar la eliminación.");
    }
  };

  const toggleSelectQuestion = (qId: string) => {
    setSelectedQuestions(prev => 
      prev.includes(qId) ? prev.filter(id => id !== qId) : [...prev, qId]
    );
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-20 text-gray-500 space-y-4">
        <Loader2 className="w-10 h-10 animate-spin text-emerald-600" />
        <span className="text-sm font-semibold">Cargando módulo de evaluaciones...</span>
      </div>
    );
  }

  // Renderizador de Sub-tabs
  return (
    <div className="w-full space-y-6">
      {/* Sub-Navegación por Pestañas */}
      <div className="flex border-b border-gray-150 overflow-visible">
        <ul className="flex text-xs font-semibold text-center whitespace-nowrap overflow-visible">
          <li className="mr-2 relative group">
            <button
              onClick={() => { setActiveSubTab("gestion"); setSelectedQuizIdForDetail(null); }}
              className={`inline-flex items-center justify-center px-4 py-3 border-b-2 rounded-t-lg gap-2 uppercase tracking-wider font-bold transition-all ${
                activeSubTab === "gestion"
                  ? "border-emerald-500 text-emerald-600 bg-emerald-50/10"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              <ClipboardList className="w-4 h-4" />
              Gestión de Pruebas
            </button>
            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-48 hidden group-hover:flex flex-col items-center bg-gray-900/90 text-white text-[10px] p-2.5 rounded-xl backdrop-blur-md border border-white/10 shadow-lg text-center z-30 transition-all pointer-events-none whitespace-normal">
              <span>Crea, edita, configura y gestiona las pruebas y sus preguntas</span>
              <div className="w-2.5 h-2.5 bg-gray-900/90 rotate-45 -mt-1 transform translate-y-1.5 border-r border-b border-white/10"></div>
            </div>
          </li>
          <li className="mr-2 relative group">
            <button
              onClick={() => { setActiveSubTab("asignaciones"); setSelectedQuizIdForDetail(null); }}
              className={`inline-flex items-center justify-center px-4 py-3 border-b-2 rounded-t-lg gap-2 uppercase tracking-wider font-bold transition-all ${
                activeSubTab === "asignaciones"
                  ? "border-emerald-500 text-emerald-600 bg-emerald-50/10"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              <UserPlus className="w-4 h-4" />
              Asignaciones
            </button>
            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-48 hidden group-hover:flex flex-col items-center bg-gray-900/90 text-white text-[10px] p-2.5 rounded-xl backdrop-blur-md border border-white/10 shadow-lg text-center z-30 transition-all pointer-events-none whitespace-normal">
              <span>Asigna y programa evaluaciones para los usuarios de la plataforma</span>
              <div className="w-2.5 h-2.5 bg-gray-900/90 rotate-45 -mt-1 transform translate-y-1.5 border-r border-b border-white/10"></div>
            </div>
          </li>
          <li className="mr-2 relative group">
            <button
              onClick={() => { setActiveSubTab("resultados"); setSelectedQuizIdForDetail(null); }}
              className={`inline-flex items-center justify-center px-4 py-3 border-b-2 rounded-t-lg gap-2 uppercase tracking-wider font-bold transition-all ${
                activeSubTab === "resultados"
                  ? "border-emerald-500 text-emerald-600 bg-emerald-50/10"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              <BarChart3 className="w-4 h-4" />
              Resultados
            </button>
            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-48 hidden group-hover:flex flex-col items-center bg-gray-900/90 text-white text-[10px] p-2.5 rounded-xl backdrop-blur-md border border-white/10 shadow-lg text-center z-30 transition-all pointer-events-none whitespace-normal">
              <span>Revisa las calificaciones, respuestas e intentos de los alumnos</span>
              <div className="w-2.5 h-2.5 bg-gray-900/90 rotate-45 -mt-1 transform translate-y-1.5 border-r border-b border-white/10"></div>
            </div>
          </li>
        </ul>
      </div>

      {/* RENDER CONTENIDO */}
      {activeSubTab === "gestion" && (
        <div className="space-y-6">
          {/* Encabezado e Inicializadores */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-gray-100 pb-4">
            <div>
              <h3 className="text-base font-bold text-gray-800">Editor de Evaluaciones</h3>
              <p className="text-gray-500 text-xs mt-0.5">Permite crear exámenes y estructurar sus preguntas.</p>
            </div>
            <div className="flex flex-wrap gap-2">
              {/* Crear Tema */}
              <div className="relative group">
                <button
                  onClick={() => { setEditingQuestionId(null); setCreatorFormMode(prev => prev === "tema" ? "none" : "tema"); }}
                  className="bg-teal-400 hover:bg-teal-500 text-white py-2 px-4 rounded-xl text-xs font-bold shadow-sm transition-all flex items-center gap-1.5 cursor-pointer border-none"
                >
                  <Plus className="w-4 h-4" />
                  Crear Tema
                </button>
                {/* Tooltip */}
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-48 hidden group-hover:flex flex-col items-center bg-gray-900/90 text-white text-[10px] p-2.5 rounded-xl backdrop-blur-md border border-white/10 shadow-lg text-center z-30 transition-all pointer-events-none">
                  <span>Crea un nuevo tema o tópico (ej. Soporte Respiratorio) para organizar tus preguntas.</span>
                  <div className="w-2.5 h-2.5 bg-gray-900/90 rotate-45 -mt-1 transform translate-y-1.5 border-r border-b border-white/10"></div>
                </div>
              </div>

              {/* Crear Pregunta */}
              <div className="relative group">
                <button
                  onClick={() => {
                    setEditingQuestionId(null);
                    setQuestionText("");
                    setAlternatives(["", "", "", ""]);
                    setCorrectAlternativeIdx(0);
                    setTargetTemaId("");
                    setCreatorFormMode(prev => prev === "question" ? "none" : "question");
                  }}
                  className="bg-teal-500 hover:bg-teal-600 text-white py-2 px-4 rounded-xl text-xs font-bold shadow-sm transition-all flex items-center gap-1.5 cursor-pointer border-none"
                >
                  <PlusCircle className="w-4 h-4" />
                  Crear Pregunta
                </button>
                {/* Tooltip */}
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-48 hidden group-hover:flex flex-col items-center bg-gray-900/90 text-white text-[10px] p-2.5 rounded-xl backdrop-blur-md border border-white/10 shadow-lg text-center z-30 transition-all pointer-events-none">
                  <span>Crea preguntas con alternativas y marca la respuesta correcta para guardarlas en el banco global.</span>
                  <div className="w-2.5 h-2.5 bg-gray-900/90 rotate-45 -mt-1 transform translate-y-1.5 border-r border-b border-white/10"></div>
                </div>
              </div>

              {/* Crear Prueba */}
              <div className="relative group">
                <button
                  onClick={() => {
                    setNewQuizTitle("");
                    setNewQuizDesc("");
                    setNewQuizTimeLimit("");
                    setSelectedQuestions([]);
                    setCreatorFormMode(prev => prev === "prueba" ? "none" : "prueba");
                  }}
                  className="bg-teal-600 hover:bg-teal-700 text-white py-2 px-4 rounded-xl text-xs font-bold shadow-sm transition-all flex items-center gap-1.5 cursor-pointer border-none"
                >
                  <Plus className="w-4 h-4" />
                  Crear Prueba
                </button>
                {/* Tooltip */}
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-48 hidden group-hover:flex flex-col items-center bg-gray-900/90 text-white text-[10px] p-2.5 rounded-xl backdrop-blur-md border border-white/10 shadow-lg text-center z-30 transition-all pointer-events-none">
                  <span>Crea una evaluación seleccionando y vinculando preguntas existentes desde tu banco global.</span>
                  <div className="w-2.5 h-2.5 bg-gray-900/90 rotate-45 -mt-1 transform translate-y-1.5 border-r border-b border-white/10"></div>
                </div>
              </div>

              {process.env.NODE_ENV !== 'production' && (
                <div className="relative group">
                  <button
                    onClick={handleCreateDummyQuiz}
                    disabled={isSeeding}
                    className="bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 py-2 px-4 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    {isSeeding ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Activity className="w-3.5 h-3.5" />}
                    Sembrar Demo
                  </button>
                  {/* Tooltip */}
                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-48 hidden group-hover:flex flex-col items-center bg-gray-900/90 text-white text-[10px] p-2.5 rounded-xl backdrop-blur-md border border-white/10 shadow-lg text-center z-30 transition-all pointer-events-none">
                    <span>Siembra una prueba demo prediseñada con preguntas y respuestas para probar el sistema rápido.</span>
                    <div className="w-2.5 h-2.5 bg-gray-900/90 rotate-45 -mt-1 transform translate-y-1.5 border-r border-b border-white/10"></div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* RENDER FORMULARIOS FLOTANTES / SECCIONES */}
          {creatorFormMode === "tema" && (
            <div className="bg-white p-6 rounded-2xl border border-gray-150 shadow-sm space-y-4 animate-fadeIn max-w-xl">
              <h4 className="text-sm font-bold text-gray-800 flex items-center gap-1.5">
                <BookOpen className="w-4 h-4 text-teal-600" />
                Crear Tema de Evaluación
              </h4>
              <form onSubmit={handleCreateTemaSubmit} className="space-y-4 text-xs">
                <div className="space-y-1">
                  <label className="block font-bold text-gray-500 uppercase tracking-wider">
                    Nombre del Tema:
                  </label>
                  <input
                    type="text"
                    value={newTemaName}
                    onChange={(e) => setNewTemaName(e.target.value)}
                    required
                    placeholder="Ej. Soporte Respiratorio, Accesos Vasculares..."
                    className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white text-xs"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isCreatingTema}
                  className="w-full py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl transition-all flex items-center justify-center gap-2"
                >
                  {isCreatingTema ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                  Guardar Tema
                </button>
              </form>
            </div>
          )}

          {creatorFormMode === "question" && (
            <div className="bg-white p-6 rounded-2xl border border-gray-150 shadow-sm space-y-4 animate-fadeIn max-w-xl">
              <h4 className="text-sm font-bold text-gray-800 flex items-center gap-1.5">
                <PlusCircle className="w-4 h-4 text-teal-600" />
                {editingQuestionId ? "Editar Pregunta del Banco" : "Crear Pregunta Independiente (Banco)"}
              </h4>
              <form onSubmit={handleCreateQuestionSubmit} className="space-y-4 text-xs">
                {/* Seleccionar Tema */}
                <div className="space-y-1">
                  <label className="block font-bold text-gray-500 uppercase tracking-wider">
                    Tema de la Pregunta:
                  </label>
                  <select
                    value={targetTemaId}
                    onChange={(e) => setTargetTemaId(e.target.value)}
                    required
                    className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white text-xs"
                  >
                    <option value="" disabled>Seleccione tema...</option>
                    {temas.map(t => (
                      <option key={t.id} value={t.id}>{t.tema}</option>
                    ))}
                  </select>
                </div>

                {/* Enunciado */}
                <div className="space-y-1">
                  <label className="block font-bold text-gray-500 uppercase tracking-wider">
                    Enunciado de la Pregunta:
                  </label>
                  <input
                    type="text"
                    value={questionText}
                    onChange={(e) => setQuestionText(e.target.value)}
                    required
                    placeholder="Escriba la pregunta..."
                    className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white text-xs"
                  />
                </div>

                {/* Alternativas */}
                <div className="space-y-2">
                  <label className="block font-bold text-gray-500 uppercase tracking-wider">
                    Alternativas:
                  </label>
                  {alternatives.map((alt, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="correctAlternative"
                        checked={correctAlternativeIdx === idx}
                        onChange={() => setCorrectAlternativeIdx(idx)}
                        className="text-emerald-600 focus:ring-emerald-500"
                        title="Marcar como correcta"
                      />
                      <input
                        type="text"
                        value={alt}
                        onChange={(e) => {
                          const copy = [...alternatives];
                          copy[idx] = e.target.value;
                          setAlternatives(copy);
                        }}
                        required={idx < 2} // Al menos 2 son obligatorias
                        placeholder={`Alternativa ${idx + 1} ${idx >= 2 ? '(Opcional)' : ''}`}
                        className="w-full p-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-xs"
                      />
                    </div>
                  ))}
                  <div className="bg-amber-50 border border-amber-200 text-amber-700 p-2.5 rounded-lg flex items-center gap-2">
                    <HelpCircle className="w-4 h-4 flex-shrink-0" />
                    <p className="text-[11px] font-semibold">
                      El botón circular izquierdo indica cuál es la alternativa correcta.
                    </p>
                  </div>
                </div>

                {/* Botón */}
                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setCreatorFormMode("none")}
                    className="w-1/3 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl transition-all cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={isCreatingQuestion}
                    className="w-2/3 py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    {isCreatingQuestion ? <Loader2 className="w-4 h-4 animate-spin" /> : <PlusCircle className="w-4 h-4" />}
                    {editingQuestionId ? "Guardar Cambios" : "Guardar Pregunta"}
                  </button>
                </div>
              </form>
            </div>
          )}

          {creatorFormMode === "prueba" && (
            <div className="bg-white p-6 rounded-2xl border border-gray-150 shadow-sm space-y-4 animate-fadeIn max-w-2xl">
              <h4 className="text-sm font-bold text-gray-800 flex items-center gap-1.5">
                <BookOpen className="w-4 h-4 text-emerald-600" />
                Crear Evaluación Personalizada (Asignando del Banco)
              </h4>
              <form onSubmit={handleCreateQuizSubmit} className="space-y-4 text-xs">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    {/* Título */}
                    <div className="space-y-1">
                      <label className="block font-bold text-gray-500 uppercase tracking-wider">
                        Título:
                      </label>
                      <input
                        type="text"
                        value={newQuizTitle}
                        onChange={(e) => setNewQuizTitle(e.target.value)}
                        required
                        placeholder="Ej. Examen de Inducción"
                        className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white text-xs"
                      />
                    </div>

                    {/* Descripción */}
                    <div className="space-y-1">
                      <label className="block font-bold text-gray-500 uppercase tracking-wider">
                        Descripción:
                      </label>
                      <textarea
                        value={newQuizDesc}
                        onChange={(e) => setNewQuizDesc(e.target.value)}
                        placeholder="Descripción opcional..."
                        rows={3}
                        className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white text-xs resize-none"
                      />
                    </div>

                    {/* Tiempo límite */}
                    <div className="space-y-1">
                      <label className="block font-bold text-gray-500 uppercase tracking-wider">
                        Límite de Tiempo (Minutos):
                      </label>
                      <input
                        type="number"
                        placeholder="Ej. 15 (Dejar vacío para ilimitado)"
                        value={newQuizTimeLimit}
                        onChange={(e) => setNewQuizTimeLimit(e.target.value)}
                        className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white text-xs"
                      />
                    </div>
                    {/* Límite de intentos */}
                    <div className="space-y-1">
                      <label className="block font-bold text-gray-500 uppercase tracking-wider">
                        Límite de Intentos:
                      </label>
                      <input
                        type="number"
                        placeholder="Ej. 1 (Dejar vacío para ilimitado)"
                        value={newQuizLimiteIntentos}
                        onChange={(e) => setNewQuizLimiteIntentos(e.target.value)}
                        className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white text-xs"
                      />
                    </div>
                  </div>

                  {/* Banco de preguntas con Checkboxes */}
                  <div className="space-y-2 flex flex-col h-full">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                      <label className="block font-bold text-gray-500 uppercase tracking-wider">
                        Preguntas del Banco:
                      </label>
                      <select
                        value={filterTemaId}
                        onChange={(e) => setFilterTemaId(e.target.value)}
                        className="p-1 bg-white border border-gray-200 rounded-lg text-[10px] focus:outline-none"
                      >
                        <option value="all">Todos los Temas</option>
                        {temas.map(t => (
                          <option key={t.id} value={t.id.toString()}>{t.tema}</option>
                        ))}
                      </select>
                    </div>
                    <div className="border border-gray-200 rounded-xl p-3 bg-gray-50 overflow-y-auto max-h-[220px] flex-grow space-y-2">
                      {(() => {
                        const filteredQuestions = filterTemaId === "all"
                          ? preguntas
                          : preguntas.filter(q => q.temaId?.toString() === filterTemaId);

                        if (filteredQuestions.length === 0) {
                          return <p className="text-gray-400 text-center py-8">No hay preguntas en este tema.</p>;
                        }

                        return filteredQuestions.map((q) => {
                          const isSelected = selectedQuestions.includes(q.id);
                          return (
                            <button
                              type="button"
                              key={q.id}
                              onClick={() => toggleSelectQuestion(q.id)}
                              className={`w-full text-left p-2 rounded-lg border text-[11px] flex items-start gap-2 transition-colors ${
                                isSelected 
                                  ? "bg-emerald-50 border-emerald-500 text-emerald-800 font-semibold" 
                                  : "bg-white border-gray-150 text-gray-600 hover:bg-gray-50"
                              }`}
                            >
                              <CheckSquare className={`w-4 h-4 flex-shrink-0 mt-0.5 ${isSelected ? "text-emerald-600" : "text-gray-300"}`} />
                              <div>
                                <p className="line-clamp-2">{q.text}</p>
                                <span className="text-[9px] text-slate-500 font-semibold block mt-0.5">Tema: {q.temaName || "Sin Tema"}</span>
                              </div>
                            </button>
                          );
                        });
                      })()}
                    </div>
                    <span className="text-[10px] text-gray-400 block">
                      Preguntas seleccionadas: {selectedQuestions.length}
                    </span>
                  </div>
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setCreatorFormMode("none")}
                    className="w-1/3 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl transition-all cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={isCreatingQuiz}
                    className="w-2/3 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl transition-all flex items-center justify-center gap-2"
                  >
                    {isCreatingQuiz ? <Loader2 className="w-4 h-4 animate-spin" /> : <BookOpen className="w-4 h-4" />}
                    Crear Prueba
                  </button>
                </div>
              </form>
            </div>
          )}

          {creatorFormMode === "edit_quiz" && (
            <div className="bg-white p-6 rounded-2xl border border-gray-150 shadow-sm space-y-4 animate-fadeIn max-w-2xl">
              <h4 className="text-sm font-bold text-gray-800 flex items-center gap-1.5">
                <BookOpen className="w-4 h-4 text-emerald-600" />
                Editar Evaluación (ID: {editQuizId})
              </h4>
              <form onSubmit={handleEditQuizSubmit} className="space-y-4 text-xs">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    {/* Título */}
                    <div className="space-y-1">
                      <label className="block font-bold text-gray-500 uppercase tracking-wider">
                        Título:
                      </label>
                      <input
                        type="text"
                        value={newQuizTitle}
                        onChange={(e) => setNewQuizTitle(e.target.value)}
                        required
                        placeholder="Ej. Examen de Inducción"
                        className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white text-xs"
                      />
                    </div>

                    {/* Descripción */}
                    <div className="space-y-1">
                      <label className="block font-bold text-gray-500 uppercase tracking-wider">
                        Descripción:
                      </label>
                      <textarea
                        value={newQuizDesc}
                        onChange={(e) => setNewQuizDesc(e.target.value)}
                        placeholder="Descripción opcional..."
                        rows={3}
                        className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white text-xs resize-none"
                      />
                    </div>

                    {/* Tiempo límite */}
                    <div className="space-y-1">
                      <label className="block font-bold text-gray-500 uppercase tracking-wider">
                        Límite de Tiempo (Minutos):
                      </label>
                      <input
                        type="number"
                        placeholder="Ej. 15 (Dejar vacío para ilimitado)"
                        value={newQuizTimeLimit}
                        onChange={(e) => setNewQuizTimeLimit(e.target.value)}
                        className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white text-xs"
                      />
                    </div>
                    {/* Límite de intentos */}
                    <div className="space-y-1">
                      <label className="block font-bold text-gray-500 uppercase tracking-wider">
                        Límite de Intentos:
                      </label>
                      <input
                        type="number"
                        placeholder="Ej. 1 (Dejar vacío para ilimitado)"
                        value={newQuizLimiteIntentos}
                        onChange={(e) => setNewQuizLimiteIntentos(e.target.value)}
                        className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white text-xs"
                      />
                    </div>
                  </div>

                  {/* Banco de preguntas con Checkboxes */}
                  <div className="space-y-2 flex flex-col h-full">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                      <label className="block font-bold text-gray-500 uppercase tracking-wider">
                        Preguntas del Banco:
                      </label>
                      <select
                        value={filterTemaId}
                        onChange={(e) => setFilterTemaId(e.target.value)}
                        className="p-1 bg-white border border-gray-200 rounded-lg text-[10px] focus:outline-none"
                      >
                        <option value="all">Todos los Temas</option>
                        {temas.map(t => (
                          <option key={t.id} value={t.id.toString()}>{t.tema}</option>
                        ))}
                      </select>
                    </div>
                    <div className="border border-gray-200 rounded-xl p-3 bg-gray-50 overflow-y-auto max-h-[220px] flex-grow space-y-2">
                      {(() => {
                        const filteredQuestions = filterTemaId === "all"
                          ? preguntas
                          : preguntas.filter(q => q.temaId?.toString() === filterTemaId);

                        if (filteredQuestions.length === 0) {
                          return <p className="text-gray-400 text-center py-8">No hay preguntas en este tema.</p>;
                        }

                        return filteredQuestions.map((q) => {
                          const isSelected = selectedQuestions.includes(q.id);
                          return (
                            <button
                              type="button"
                              key={q.id}
                              onClick={() => toggleSelectQuestion(q.id)}
                              className={`w-full text-left p-2 rounded-lg border text-[11px] flex items-start gap-2 transition-colors ${
                                isSelected 
                                  ? "bg-emerald-50 border-emerald-500 text-emerald-800 font-semibold" 
                                  : "bg-white border-gray-150 text-gray-600 hover:bg-gray-50"
                              }`}
                            >
                              <CheckSquare className={`w-4 h-4 flex-shrink-0 mt-0.5 ${isSelected ? "text-emerald-600" : "text-gray-300"}`} />
                              <div>
                                <p className="line-clamp-2">{q.text}</p>
                                <span className="text-[9px] text-slate-500 font-semibold block mt-0.5">Tema: {q.temaName || "Sin Tema"}</span>
                              </div>
                            </button>
                          );
                        });
                      })()}
                    </div>
                    <span className="text-[10px] text-gray-400 block">
                      Preguntas seleccionadas: {selectedQuestions.length}
                    </span>
                  </div>
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setCreatorFormMode("none")}
                    className="w-1/3 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl transition-all cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={isCreatingQuiz}
                    className="w-2/3 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl transition-all flex items-center justify-center gap-2"
                  >
                    {isCreatingQuiz ? <Loader2 className="w-4 h-4 animate-spin" /> : <BookOpen className="w-4 h-4" />}
                    Guardar Cambios
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Contenedor de Pruebas */}
          <div className="bg-teal-50 border-l-4 border-teal-600 p-6 rounded-2xl shadow-sm space-y-4">
            {/* Header Colapsable */}
            <div 
              onClick={() => setIsQuizzesExpanded(!isQuizzesExpanded)}
              className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 cursor-pointer select-none"
            >
              <div className="flex items-center gap-2 text-teal-800">
                <BookOpen className="w-5 h-5 flex-shrink-0" />
                <h3 className="text-sm font-bold uppercase tracking-wider flex items-center gap-1.5">
                  Pruebas Activas
                </h3>
                {isQuizzesExpanded ? (
                  <ChevronDown className="w-4 h-4" />
                ) : (
                  <ChevronRight className="w-4 h-4" />
                )}
              </div>
              
              {/* Buscador de pruebas por nombre */}
              <div className="flex items-center gap-2 text-xs" onClick={(e) => e.stopPropagation()}>
                <input
                  type="text"
                  placeholder="Buscar prueba por nombre..."
                  value={searchQuizText}
                  onChange={(e) => setSearchQuizText(e.target.value)}
                  className="p-2 bg-white border border-teal-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 text-xs w-48 font-semibold text-teal-800 placeholder-teal-800/50"
                />
              </div>
            </div>

            {/* Contenido colapsable */}
            {isQuizzesExpanded && (
              <div className="space-y-4 pt-2">
                {(() => {
                  const filteredQuizzes = quizStats.filter((q) =>
                    q.title.toLowerCase().includes(searchQuizText.toLowerCase())
                  );

                  if (filteredQuizzes.length === 0) {
                    return (
                      <p className="text-teal-800/60 text-xs text-center py-8 font-semibold">
                        No hay pruebas que coincidan con la búsqueda.
                      </p>
                    );
                  }

                  return (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {filteredQuizzes.map((prueba) => (
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
                                {prueba.isActive ? <CheckCircle className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                                {prueba.isActive ? "Activo" : "Inactivo"}
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
                                    ? `${prueba.timeLimitMinutes} min` 
                                    : "Sin límite"}
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
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => handleStartEditQuiz(prueba.id)}
                                className="p-1 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                                title="Editar examen"
                              >
                                <Pencil className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDeleteQuiz(prueba.id)}
                                className="p-1 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors"
                                title="Eliminar examen"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  );
                })()}
              </div>
            )}
          </div>

          {/* Contenedor de Preguntas */}
          <div className="bg-slate-50 border-l-4 border-slate-500 p-6 rounded-2xl shadow-sm space-y-4">
            {/* Header Colapsable */}
            <div 
              onClick={() => setIsQuestionsExpanded(!isQuestionsExpanded)}
              className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 cursor-pointer select-none"
            >
              <div className="text-slate-800 flex items-center gap-2">
                <ClipboardList className="w-5 h-5 flex-shrink-0" />
                <div>
                  <h3 className="text-sm font-bold uppercase tracking-wider flex items-center gap-1.5">
                    Banco de Preguntas Global
                  </h3>
                  <p className="text-slate-500 text-[10px] mt-0.5 lowercase first-letter:uppercase">Todas las preguntas guardadas en el sistema. Puedes filtrarlas, editarlas o eliminarlas del banco.</p>
                </div>
                {isQuestionsExpanded ? (
                  <ChevronDown className="w-4 h-4 ml-1 flex-shrink-0" />
                ) : (
                  <ChevronRight className="w-4 h-4 ml-1 flex-shrink-0" />
                )}
              </div>
              
              {/* Buscador y filtros de preguntas */}
              <div className="flex flex-wrap gap-2 text-xs" onClick={(e) => e.stopPropagation()}>
                {/* Buscador */}
                <input
                  type="text"
                  placeholder="Buscar por pregunta..."
                  value={searchQuestionText}
                  onChange={(e) => setSearchQuestionText(e.target.value)}
                  className="p-2 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-500 focus:bg-white text-xs w-48 font-semibold text-slate-800 placeholder-slate-400"
                />
                {/* Filtro Tema */}
                <select
                  value={filterQuestionTemaId}
                  onChange={(e) => setFilterQuestionTemaId(e.target.value)}
                  className="p-2 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-500 text-xs font-semibold text-slate-800 cursor-pointer"
                >
                  <option value="all">Todos los Temas</option>
                  {temas.map(t => (
                    <option key={t.id} value={t.id.toString()}>{t.tema}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Contenido colapsable */}
            {isQuestionsExpanded && (
              <div className="pt-2 bg-white p-4 rounded-xl border border-slate-150">
                {(() => {
                  const filteredBankQuestions = preguntas.filter((q) => {
                    const matchesSearch = q.text.toLowerCase().includes(searchQuestionText.toLowerCase());
                    const matchesTema = filterQuestionTemaId === "all" || q.temaId?.toString() === filterQuestionTemaId;
                    return matchesSearch && matchesTema;
                  });

                  if (filteredBankQuestions.length === 0) {
                    return <p className="text-gray-400 text-xs text-center py-8">No hay preguntas que coincidan con la búsqueda.</p>;
                  }

                  return (
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse text-xs">
                        <thead>
                          <tr className="bg-gray-50 border-b border-gray-150 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                            <th className="px-4 py-3">Pregunta</th>
                            <th className="px-4 py-3">Tema</th>
                            <th className="px-4 py-3 text-right">Acción</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                          {filteredBankQuestions.map((q) => (
                            <tr key={q.id} className="hover:bg-gray-50/50">
                              <td className="px-4 py-3">
                                <span className="font-semibold text-gray-800 block">{q.text}</span>
                                <span className="text-[10px] text-gray-400 block mt-0.5">
                                  Alternativas: {q.opciones.map(o => `${o.text}${o.isCorrect ? ' (✓)' : ''}`).join(', ')}
                                </span>
                              </td>
                              <td className="px-4 py-3">
                                <span className="inline-flex items-center gap-1 bg-slate-50 text-slate-600 px-2 py-0.5 rounded-md font-semibold text-[10px]">
                                  {q.temaName || "Sin Tema"}
                                </span>
                              </td>
                              <td className="px-4 py-3 text-right">
                                <div className="flex items-center justify-end gap-1.5">
                                  <button
                                    onClick={() => handleStartEditQuestion(q)}
                                    className="p-1 text-teal-600 hover:bg-teal-50 rounded-lg transition-colors cursor-pointer"
                                    title="Editar pregunta"
                                  >
                                    <Pencil className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    onClick={() => handleDeleteQuestion(q.id)}
                                    className="p-1 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                                    title="Eliminar pregunta del banco"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  );
                })()}
              </div>
            )}
          </div>

          {/* Contenedor de Papelera (al final) */}
          <div className="bg-amber-50 border-l-4 border-amber-500 p-6 rounded-2xl shadow-sm space-y-4">
            {/* Header Colapsable */}
            <div 
              onClick={() => setIsTrashExpanded(!isTrashExpanded)}
              className="flex items-center justify-between cursor-pointer select-none"
            >
              <div className="text-amber-800 flex items-center gap-2">
                <Trash2 className="w-5 h-5 flex-shrink-0" />
                <h3 className="text-sm font-bold uppercase tracking-wider flex items-center gap-1.5">
                  Papelera: Pruebas Eliminadas ({deletedQuizzes.length})
                </h3>
                {isTrashExpanded ? (
                  <ChevronDown className="w-4 h-4" />
                ) : (
                  <ChevronRight className="w-4 h-4" />
                )}
              </div>
              <span className="text-[10px] text-amber-700 italic font-medium hidden sm:inline">
                Las estadísticas de estos exámenes se conservan en la pestaña de Resultados.
              </span>
            </div>

            {/* Contenido colapsable */}
            {isTrashExpanded && (
              <div className="space-y-4 pt-2">
                {deletedQuizzes.length === 0 ? (
                  <p className="text-amber-700/60 text-xs text-center py-4 font-semibold">
                    La papelera está vacía.
                  </p>
                ) : (
                  <div className="max-h-[300px] overflow-y-auto pr-1">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {deletedQuizzes.map((prueba) => (
                        <div 
                          key={prueba.id}
                          className="bg-white rounded-xl border border-amber-100 p-4 flex flex-col justify-between shadow-sm opacity-90 hover:opacity-100 transition-opacity"
                        >
                          <div>
                            <h5 className="text-xs font-bold text-gray-750">{prueba.title}</h5>
                            {prueba.description && (
                              <p className="text-[11px] text-gray-405 mt-1 line-clamp-2">
                                {prueba.description}
                              </p>
                            )}
                            <div className="flex items-center gap-3 text-[10px] text-gray-400 mt-2">
                              <span>Preguntas: {prueba.preguntaCount}</span>
                              {prueba.deletedAt && (
                                <span>Eliminado el: {new Date(prueba.deletedAt).toLocaleDateString("es-CL")}</span>
                              )}
                            </div>
                          </div>
                          <div className="border-t border-gray-150 mt-3 pt-2.5 flex items-center justify-between text-[11px]">
                            <span className="text-gray-400">ID: {prueba.id}</span>
                            <button
                              onClick={() => handleRestoreQuiz(prueba.id)}
                              className="py-1 px-3 bg-amber-50 hover:bg-amber-100 text-amber-800 font-bold rounded-lg transition-colors flex items-center gap-1 text-[10px] cursor-pointer"
                            >
                              <RotateCcw className="w-3 h-3" />
                              Reintegrar prueba
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* PANEL DE ASIGNACIONES */}
      {activeSubTab === "asignaciones" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* Formulario Asignar por Rol */}
          <div className="space-y-5">
            <div className="bg-white p-6 rounded-2xl border border-gray-150 shadow-sm space-y-5 text-xs">
              <h3 className="text-sm font-bold text-gray-800 flex items-center gap-2 border-b border-gray-100 pb-3">
                <Shield className="w-5 h-5 text-slate-500" />
                Asignar por Rol
              </h3>
              <form onSubmit={handleAssignRoleSubmit} className="space-y-4">
                <div className="space-y-1">
                  <label className="block font-bold text-gray-500 uppercase tracking-wider">Examen:</label>
                  <select
                    value={selectedQuizIdAssign}
                    onChange={(e) => setSelectedQuizIdAssign(e.target.value)}
                    required
                    className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-400 focus:bg-white text-xs"
                  >
                    <option value="" disabled>Selecciona examen...</option>
                    {pruebas.map((q) => (
                      <option key={q.id} value={q.id}>{q.title}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="block font-bold text-gray-500 uppercase tracking-wider">Rol:</label>
                  <select
                    value={roleName}
                    onChange={(e) => setRoleName(e.target.value)}
                    required
                    className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-400 text-xs"
                  >
                    <option value="" disabled>Selecciona un rol...</option>
                    <option value="matron">Matrona/ón</option>
                    <option value="tens">TENS</option>
                    <option value="orientacion">Orientación</option>
                    <option value="auxiliar">Auxiliar</option>
                    <option value="medico">Médico</option>
                    <option value="user">Usuario</option>
                    <option value="tens_insumos">TENS INSUMOS</option>
                    <option value="admin">Administrador</option>
                    <option value="estudiante">Estudiante</option>
                  </select>
                </div>
                <button
                  type="submit"
                  disabled={isAssigning}
                  className="w-full py-2.5 bg-slate-700 hover:bg-slate-800 text-white font-bold rounded-xl transition-all flex items-center justify-center gap-2"
                >
                  {isAssigning ? <Loader2 className="w-4 h-4 animate-spin" /> : <Shield className="w-4 h-4" />}
                  Asignar a Rol
                </button>
              </form>
            </div>

            {/* Formulario Asignar a Usuarios */}
            <div className="bg-white p-6 rounded-2xl border border-gray-150 shadow-sm space-y-5 text-xs">
              <h3 className="text-sm font-bold text-gray-800 flex items-center gap-2 border-b border-gray-100 pb-3">
                <UserPlus className="w-5 h-5 text-emerald-600" />
                Asignar a Usuarios
              </h3>
              <form onSubmit={handleAssignUsersSubmit} className="space-y-4">
                <div className="space-y-1">
                  <label className="block font-bold text-gray-500 uppercase tracking-wider">Examen:</label>
                  <select
                    value={selectedQuizIdAssign}
                    onChange={(e) => setSelectedQuizIdAssign(e.target.value)}
                    required
                    className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white text-xs"
                  >
                    <option value="" disabled>Selecciona examen...</option>
                    {pruebas.map((q) => (
                      <option key={q.id} value={q.id}>{q.title}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="block font-bold text-gray-500 uppercase tracking-wider">Usuarios:</label>
                    {selectedUserIds.length > 0 && (
                      <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                        {selectedUserIds.length} seleccionado(s)
                      </span>
                    )}
                  </div>
                  {/* Buscador de usuarios */}
                  <input
                    type="text"
                    placeholder="Buscar por nombre o email..."
                    value={userSearchText}
                    onChange={(e) => setUserSearchText(e.target.value)}
                    className="w-full p-2 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-xs"
                  />
                  {/* Lista de usuarios */}
                  <div className="border border-gray-200 rounded-xl overflow-y-auto max-h-[280px] divide-y divide-gray-100">
                    {allUsers.length === 0 ? (
                      <p className="text-gray-400 text-center py-6">No hay usuarios disponibles.</p>
                    ) : (
                      (() => {
                        const filtered = allUsers.filter((u) => {
                          const q = userSearchText.toLowerCase();
                          return (
                            u.nombre.toLowerCase().includes(q) ||
                            u.apellido1.toLowerCase().includes(q) ||
                            u.email.toLowerCase().includes(q)
                          );
                        });
                        if (filtered.length === 0) {
                          return <p className="text-gray-400 text-center py-6">Sin resultados.</p>;
                        }
                        return filtered.map((u) => {
                          const isSelected = selectedUserIds.includes(u.id);
                          return (
                            <button
                              key={u.id}
                              type="button"
                              onClick={() =>
                                setSelectedUserIds((prev) =>
                                  prev.includes(u.id)
                                    ? prev.filter((id) => id !== u.id)
                                    : [...prev, u.id]
                                )
                              }
                              className={`w-full text-left px-3 py-2.5 flex items-center gap-3 transition-colors ${
                                isSelected
                                  ? "bg-teal-50 border-l-2 border-teal-500"
                                  : "hover:bg-gray-50 border-l-2 border-transparent"
                              }`}
                            >
                              <div className={`w-4 h-4 rounded border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
                                isSelected ? "bg-teal-500 border-teal-500" : "border-gray-300"
                              }`}>
                                {isSelected && (
                                  <svg viewBox="0 0 10 8" fill="none" className="w-2.5 h-2.5">
                                    <path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                  </svg>
                                )}
                              </div>
                              <div className="min-w-0">
                                <p className={`font-semibold truncate ${ isSelected ? "text-teal-800" : "text-gray-700" }`}>
                                  {u.nombre} {u.apellido1}
                                </p>
                                <p className="text-[10px] text-gray-400 truncate">{u.email}</p>
                                <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">{u.role}</span>
                              </div>
                            </button>
                          );
                        });
                      })()
                    )}
                  </div>
                  {/* Seleccionar todo / Limpiar selección */}
                  <div className="flex items-center gap-2 mt-2">
                    <button
                      type="button"
                      onClick={() => {
                        const filtered = allUsers.filter((u) => {
                          const q = userSearchText.toLowerCase();
                          return (
                            u.nombre.toLowerCase().includes(q) ||
                            u.apellido1.toLowerCase().includes(q) ||
                            u.email.toLowerCase().includes(q)
                          );
                        });
                        const allFilteredIds = filtered.map((u) => u.id);
                        const allSelected = allFilteredIds.every((id) => selectedUserIds.includes(id));
                        if (allSelected) {
                          setSelectedUserIds((prev) => prev.filter((id) => !allFilteredIds.includes(id)));
                        } else {
                          setSelectedUserIds((prev) => Array.from(new Set([...prev, ...allFilteredIds])));
                        }
                      }}
                      className="flex-1 py-1.5 px-3 text-xs font-bold border border-teal-600 text-teal-700 hover:bg-teal-50 rounded-lg transition-colors"
                    >
                      Seleccionar todo
                    </button>
                    {selectedUserIds.length > 0 && (
                      <button
                        type="button"
                        onClick={() => setSelectedUserIds([])}
                        className="flex-1 py-1.5 px-3 text-xs font-bold border border-rose-400 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                      >
                        Limpiar ({selectedUserIds.length})
                      </button>
                    )}
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isAssigning || selectedUserIds.length === 0}
                  className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-200 disabled:text-gray-400 text-white font-bold rounded-xl transition-all flex items-center justify-center gap-2"
                >
                  {isAssigning ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserPlus className="w-4 h-4" />}
                  Asignar {selectedUserIds.length > 0 ? `(${selectedUserIds.length})` : ""}
                </button>
              </form>
            </div>
          </div>

          {/* Tabla de Asignaciones */}
          <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-gray-150 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-gray-800 flex items-center gap-2 border-b border-gray-100 pb-3">
              <ClipboardList className="w-5 h-5 text-gray-400" />
              Asignaciones Activas
            </h3>
            {asignaciones.length === 0 ? (
              <p className="text-gray-400 text-xs text-center py-8">No hay asignaciones registradas.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-150 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                      <th className="px-4 py-3">Examen</th>
                      <th className="px-4 py-3">Destinatario</th>
                      <th className="px-4 py-3 text-right">Acción</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {asignaciones.map((assignment) => {
                      const isRole = assignment.role !== null;
                      const userDetail = assignment.userId !== null ? usersMap[assignment.userId] : null;
                      return (
                        <tr key={assignment.id} className="hover:bg-gray-50/50">
                          <td className="px-4 py-3 font-semibold text-gray-800">{assignment.prueba.title}</td>
                          <td className="px-4 py-3">
                            {isRole ? (
                              <span className="inline-flex items-center gap-1 bg-slate-50 text-slate-700 px-2 py-0.5 rounded-md font-semibold">
                                <Shield className="w-3.5 h-3.5" />
                                {assignment.role}
                              </span>
                            ) : (
                              <span className="inline-flex flex-col bg-teal-50 text-teal-700 px-2 py-1 rounded-md font-semibold">
                                {userDetail ? (
                                  <>
                                    <span className="font-bold">{userDetail.nombre} {userDetail.apellido1}</span>
                                    <span className="text-[9px] text-teal-500 font-medium">{userDetail.email}</span>
                                  </>
                                ) : (
                                  <span>ID: {assignment.userId}</span>
                                )}
                              </span>
                            )}
                          </td>
                          <td className="px-4 py-3 text-right">
                            <button
                              onClick={() => handleRevokeAssignment(assignment.id)}
                              disabled={revokingId !== null}
                              className="p-1 text-rose-500 hover:bg-rose-50 rounded-lg"
                            >
                              {revokingId === assignment.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
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
      )}

      {/* PANEL DE RESULTADOS / DRILL-DOWN */}
      {activeSubTab === "resultados" && (
        <div className="space-y-6">
          {selectedQuizIdForDetail === null ? (
            <div className="space-y-6">
              {/* KPIs de Resultados */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-5 rounded-2xl border border-gray-150 shadow-sm flex items-center gap-4">
                  <div className="p-3 bg-emerald-50 rounded-xl text-emerald-600">
                    <CheckCircle className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                      Evaluaciones
                    </span>
                    <span className="text-xl font-black text-gray-800">{quizStats.length}</span>
                  </div>
                </div>
                <div className="bg-white/90 p-5 rounded-2xl border border-gray-150 shadow-sm flex items-center gap-4">
                  <div className="p-3 bg-slate-50 rounded-xl text-slate-600">
                    <User className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                      Intentos Totales
                    </span>
                    <span className="text-xl font-black text-gray-800">
                      {quizStats.reduce((acc, curr) => acc + curr.attemptCount, 0)}
                    </span>
                  </div>
                </div>
                <div className="bg-white p-5 rounded-2xl border border-gray-150 shadow-sm flex items-center gap-4">
                  <div className="p-3 bg-amber-50 rounded-xl text-amber-600">
                    <Award className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                      Nota Promedio
                    </span>
                    <span className="text-xl font-black text-gray-800">
                      {(quizStats.reduce((acc, curr) => acc + curr.averageScore, 0) / (quizStats.filter(q => q.attemptCount > 0).length || 1)).toFixed(1)}%
                    </span>
                  </div>
                </div>
              </div>

              {/* Listado de Exámenes con Estadísticas */}
              <div className="bg-white rounded-2xl border border-gray-150 shadow-sm overflow-hidden">
                <div className="px-6 py-5 border-b border-gray-150">
                  <h3 className="text-base font-bold text-gray-800">Rendimiento por Examen</h3>
                </div>
                {quizStats.length === 0 ? (
                  <p className="text-gray-400 text-xs text-center py-8">No hay resultados registrados.</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="bg-gray-50 border-b border-gray-150 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                          <th className="px-6 py-4">Examen</th>
                          <th className="px-6 py-4">Intentos</th>
                          <th className="px-6 py-4 text-center">Estados (C / T / P)</th>
                          <th className="px-6 py-4 text-right">Puntuación Promedio</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {quizStats.map((prueba) => (
                          <tr 
                            key={prueba.id} 
                            onClick={() => handleViewQuizDetail(prueba.id, prueba.title, prueba.description, prueba.timeLimitMinutes)}
                            className="hover:bg-gray-50/50 cursor-pointer transition-colors"
                          >
                            <td className="px-6 py-4 font-semibold text-gray-800">
                              {prueba.title}
                            </td>
                            <td className="px-6 py-4 text-gray-600 font-bold">{prueba.attemptCount}</td>
                            <td className="px-6 py-4">
                              <div className="flex items-center justify-center gap-3 text-[10px] font-bold">
                                <span className="bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-md flex items-center gap-0.5">
                                  {prueba.completedCount} C
                                </span>
                                <span className="bg-rose-50 text-rose-700 px-2 py-0.5 rounded-md flex items-center gap-0.5">
                                  {prueba.timeoutCount} T
                                </span>
                                <span className="bg-amber-50 text-amber-700 px-2 py-0.5 rounded-md flex items-center gap-0.5">
                                  {prueba.inProgressCount} P
                                </span>
                              </div>
                            </td>
                            <td className="px-6 py-4 text-right font-black text-sm">
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
          ) : (
            // DETALLE DRILL-DOWN DE EXAMEN SELECCIONADO o INTENTO SELECCIONADO
            selectedAttemptForDetail !== null ? (
              // RENDER DETALLE DEL INTENTO INDIVIDUAL
              <div className="space-y-6 animate-fadeIn">
                <div className="flex flex-col gap-4 border-b border-gray-100 pb-4">
                  <button
                    onClick={() => setSelectedAttemptForDetail(null)}
                    className="text-xs font-bold text-gray-500 hover:text-gray-700 transition-colors flex items-center gap-1 w-fit"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    Volver a Intentos
                  </button>
                  <div>
                    <h3 className="text-base font-bold text-gray-800">
                      Respuestas de: {detailUsersMap[selectedAttemptForDetail.userId]?.nombre || "Usuario"} {detailUsersMap[selectedAttemptForDetail.userId]?.apellido1 || ""}
                    </h3>
                    <p className="text-gray-500 text-xs mt-0.5">
                      Evaluación: {selectedQuizTitle} | Puntaje: <span className="font-bold text-gray-700">{selectedAttemptForDetail.score}%</span> | Estado: <span className={`font-bold ${selectedAttemptForDetail.status === 'COMPLETED' ? 'text-emerald-600' : 'text-rose-500'}`}>{selectedAttemptForDetail.status}</span>
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  {(() => {
                    const attemptSnapshot = selectedAttemptForDetail?.snapshot as any;
                    const questionsToRender = (attemptSnapshot && attemptSnapshot.preguntas)
                      ? attemptSnapshot.preguntas
                      : (detailQuizStructure?.preguntas || []);

                    return questionsToRender.map((q: any, qIdx: number) => {
                      const userAnswer = selectedAttemptForDetail.respuestas?.find((ans: any) => ans.preguntaId === q.id);
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
                              const isUserSelected = userAnswer?.opcionId === opt.id;
                              const isCorrect = opt.isCorrect;
                              
                              let cardStyle = "border-gray-150 bg-gray-50/50 text-gray-600";
                              let badge = null;

                              if (isUserSelected) {
                                if (isCorrect) {
                                  cardStyle = "border-emerald-500 bg-emerald-50 text-emerald-800 font-semibold";
                                  badge = (
                                    <span className="inline-flex items-center gap-0.5 text-[9px] font-bold bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded-full ml-auto">
                                      <CheckCircle className="w-3 h-3" /> Selección (Correcta)
                                    </span>
                                  );
                                } else {
                                  cardStyle = "border-rose-500 bg-rose-50 text-rose-800 font-semibold";
                                  badge = (
                                    <span className="inline-flex items-center gap-0.5 text-[9px] font-bold bg-rose-100 text-rose-700 px-1.5 py-0.5 rounded-full ml-auto">
                                      <XCircle className="w-3 h-3" /> Selección (Incorrecta)
                                    </span>
                                  );
                                }
                              } else if (isCorrect) {
                                cardStyle = "border-emerald-300 bg-emerald-50/20 text-emerald-700 font-semibold";
                                badge = (
                                  <span className="inline-flex items-center gap-0.5 text-[9px] font-bold bg-emerald-100/50 text-emerald-600 px-1.5 py-0.5 rounded-full ml-auto">
                                    Correcta
                                  </span>
                                );
                              }

                              return (
                                <div 
                                  key={opt.id} 
                                  className={`p-2.5 rounded-xl border flex items-center gap-2 ${cardStyle}`}
                                >
                                  <span className="flex-grow">{opt.text}</span>
                                  {badge}
                                </div>
                              );
                            })}
                          </div>
                          
                          {!userAnswer && (
                            <p className="text-[10px] text-rose-500 font-bold italic pt-1">
                              * El usuario no respondió esta pregunta.
                            </p>
                          )}
                        </div>
                      );
                    });
                  })()}
                </div>
              </div>
            ) : (
              // RENDER LISTADO DE INTENTOS
              <div className="space-y-6 animate-fadeIn">
                <div className="flex flex-col gap-4 border-b border-gray-100 pb-4">
                  <button
                    onClick={() => setSelectedQuizIdForDetail(null)}
                    className="text-xs font-bold text-gray-500 hover:text-gray-700 transition-colors flex items-center gap-1 w-fit"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    Volver a Resultados
                  </button>
                  <div>
                    <h3 className="text-base font-bold text-gray-800">Detalles: {selectedQuizTitle}</h3>
                    <p className="text-gray-500 text-xs mt-0.5">{selectedQuizDesc || "Sin descripción"}</p>
                  </div>
                </div>

                {loadingAttempts ? (
                  <div className="flex justify-center p-12">
                    <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
                  </div>
                ) : (
                  <div className="bg-white rounded-2xl border border-gray-150 shadow-sm overflow-hidden">
                    <div className="px-6 py-5 border-b border-gray-150">
                      <h4 className="text-sm font-bold text-gray-800">Intentos Realizados</h4>
                    </div>
                    {attemptsDetail.length === 0 ? (
                      <p className="text-gray-400 text-xs text-center py-8">Nadie ha realizado esta evaluación todavía.</p>
                    ) : (
                      <div className="overflow-x-auto text-xs">
                        <table className="w-full text-left border-collapse">
                          <thead>
                            <tr className="bg-gray-50 border-b border-gray-150 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                              <th className="px-6 py-4">Usuario</th>
                              <th className="px-6 py-4 text-center">Estado</th>
                              <th className="px-6 py-4 text-center">Puntaje</th>
                              <th className="px-6 py-4 text-right">Fecha</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-100">
                            {attemptsDetail.map((intento) => {
                              const u = detailUsersMap[intento.userId];
                              const isCompleted = intento.status === "COMPLETED";
                              const isTimeout = intento.status === "TIMEOUT";

                              return (
                                <tr 
                                  key={intento.id} 
                                  onClick={() => setSelectedAttemptForDetail(intento)}
                                  className="hover:bg-gray-50/50 cursor-pointer transition-colors"
                                >
                                  <td className="px-6 py-4">
                                    {u ? (
                                      <div>
                                        <span className="font-bold text-gray-800 block">{u.nombre} {u.apellido1}</span>
                                        <span className="text-[10px] text-gray-400 mt-0.5 block">{u.email} (ID: {u.id})</span>
                                      </div>
                                    ) : (
                                      <span className="text-gray-400 italic">Usuario no encontrado (ID: {intento.userId})</span>
                                    )}
                                  </td>
                                  <td className="px-6 py-4 text-center">
                                    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full font-bold uppercase text-[9px] ${
                                      isCompleted ? "bg-emerald-50 text-emerald-700 border border-emerald-100" :
                                      isTimeout ? "bg-rose-50 text-rose-700 border border-rose-100" :
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
                                  <td className="px-6 py-4 text-right text-gray-500 font-semibold">
                                    <div className="flex flex-col items-end">
                                      <span className="flex items-center gap-1">
                                        <Calendar className="w-3.5 h-3.5 text-gray-300" />
                                        {new Date(intento.createdAt).toLocaleDateString("es-CL")}
                                      </span>
                                      <span className="text-[9px] text-gray-400 mt-0.5">
                                        {new Date(intento.createdAt).toLocaleTimeString("es-CL", { hour: "2-digit", minute: "2-digit" })}
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
                )}
              </div>
            )
          )}
        </div>
      )}
    </div>
  );
}
