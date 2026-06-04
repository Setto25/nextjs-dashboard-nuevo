"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { 
  UserPlus, 
  Trash2, 
  Loader2, 
  Shield, 
  User, 
  HelpCircle,
  ClipboardList
} from "lucide-react";
import { assignQuizAction, revokeQuizAssignmentAction } from "@/app/actions/quiz";

interface Prueba {
  id: string;
  title: string;
}

interface UserMap {
  id: number;
  nombre: string;
  apellido1: string;
  email: string;
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

interface AsignacionesPruebasClientProps {
  pruebas: Prueba[];
  asignaciones: Assignment[];
  users: Record<number, UserMap>;
}

export default function AsignacionesPruebasClient({ 
  pruebas, 
  asignaciones, 
  users 
}: AsignacionesPruebasClientProps) {
  const router = useRouter();
  const [selectedQuizId, setSelectedQuizId] = useState("");
  const [assignType, setAssignType] = useState<"role" | "user">("role");
  const [roleName, setRoleName] = useState("");
  const [userIdInput, setUserIdInput] = useState("");
  
  const [enviando, setEnviando] = useState(false);
  const [revokingId, setRevokingId] = useState<string | null>(null);

  const manejarEnvio = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedQuizId) {
      toast.error("Por favor, selecciona una evaluación.");
      return;
    }

    setEnviando(true);
    try {
      const role = assignType === "role" ? roleName : undefined;
      const userId = assignType === "user" ? Number(userIdInput) : undefined;

      if (assignType === "user" && isNaN(Number(userIdInput))) {
        toast.error("El ID de usuario debe ser un número válido.");
        setEnviando(false);
        return;
      }

      const res = await assignQuizAction(selectedQuizId, role, userId);
      if (res.success) {
        toast.success("¡Evaluación asignada correctamente!");
        // Reset form
        setSelectedQuizId("");
        setRoleName("");
        setUserIdInput("");
        router.refresh();
      } else {
        toast.error(res.error || "Ocurrió un error al guardar la asignación.");
      }
    } catch (error) {
      console.error(error);
      toast.error("Error inesperado al crear la asignación.");
    } finally {
      setEnviando(false);
    }
  };

  const handleRevoke = async (assignmentId: string) => {
    if (revokingId) return;
    setRevokingId(assignmentId);

    try {
      const res = await revokeQuizAssignmentAction(assignmentId);
      if (res.success) {
        toast.success("Asignación revocada.");
        router.refresh();
      } else {
        toast.error(res.error || "No se pudo revocar la asignación.");
      }
    } catch (error) {
      console.error(error);
      toast.error("Error al revocar la asignación.");
    } finally {
      setRevokingId(null);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Columna del Formulario (1/3) */}
      <div className="bg-white p-6 rounded-2xl border border-gray-150 shadow-sm space-y-6 h-fit">
        <h3 className="text-base font-bold text-gray-800 flex items-center gap-2 border-b border-gray-100 pb-3">
          <UserPlus className="w-5 h-5 text-emerald-600" />
          Nueva Asignación
        </h3>

        <form onSubmit={manejarEnvio} className="space-y-4">
          {/* Examen */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider">
              Seleccionar Evaluación
            </label>
            <select
              value={selectedQuizId}
              onChange={(e) => setSelectedQuizId(e.target.value)}
              required
              className="w-full p-2.5 text-xs text-black bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all"
            >
              <option value="" disabled>Selecciona una evaluación...</option>
              {pruebas.map((q) => (
                <option key={q.id} value={q.id}>{q.title}</option>
              ))}
            </select>
          </div>

          {/* Tipo de asignación */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider">
              Asignar por:
            </label>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 text-xs font-semibold text-gray-600 cursor-pointer">
                <input
                  type="radio"
                  name="assignType"
                  checked={assignType === "role"}
                  onChange={() => setAssignType("role")}
                  className="text-emerald-600 focus:ring-emerald-500"
                />
                Rol de Usuario
              </label>
              <label className="flex items-center gap-2 text-xs font-semibold text-gray-600 cursor-pointer">
                <input
                  type="radio"
                  name="assignType"
                  checked={assignType === "user"}
                  onChange={() => setAssignType("user")}
                  className="text-emerald-600 focus:ring-emerald-500"
                />
                ID de Usuario
              </label>
            </div>
          </div>

          {/* Campo condicional: Rol */}
          {assignType === "role" ? (
            <div className="space-y-1.5 animate-fadeIn">
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider">
                Rol Destinatario
              </label>
              <select
                value={roleName}
                onChange={(e) => setRoleName(e.target.value)}
                required
                className="w-full p-2.5 text-xs text-black bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all"
              >
                <option value="" disabled>Selecciona un rol...</option>
                <option value="user">Usuario General (user)</option>
                <option value="admin">Administrador (admin)</option>
                <option value="tens_insumos">Encargado de Insumos (tens_insumos)</option>
              </select>
            </div>
          ) : (
            <div className="space-y-1.5 animate-fadeIn">
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider">
                ID numérico del Usuario
              </label>
              <input
                type="number"
                placeholder="Ej. 1"
                value={userIdInput}
                onChange={(e) => setUserIdInput(e.target.value)}
                required
                className="w-full p-2.5 text-xs text-black bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all"
              />
            </div>
          )}

          <button
            type="submit"
            disabled={enviando}
            className="w-full py-3 px-4 bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white font-bold rounded-xl shadow-md hover:shadow-lg transition-all duration-200 text-xs flex items-center justify-center gap-2 pt-2.5"
          >
            {enviando ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Guardando...
              </>
            ) : (
              <>
                <UserPlus className="w-4 h-4" />
                Asignar Evaluación
              </>
            )}
          </button>
        </form>
      </div>

      {/* Columna de Asignaciones Actuales (2/3) */}
      <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-gray-150 shadow-sm space-y-6">
        <h3 className="text-base font-bold text-gray-800 flex items-center gap-2 border-b border-gray-100 pb-3">
          <ClipboardList className="w-5 h-5 text-gray-400" />
          Asignaciones Activas
        </h3>

        {asignaciones.length === 0 ? (
          <div className="text-center py-12 space-y-4">
            <HelpCircle className="mx-auto w-10 h-10 text-gray-300" />
            <p className="text-gray-500 text-xs">No hay asignaciones registradas en el sistema.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-150 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                  <th className="px-4 py-3">Evaluación</th>
                  <th className="px-4 py-3">Destinatario</th>
                  <th className="px-4 py-3 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-xs">
                {asignaciones.map((assignment) => {
                  const isRole = assignment.role !== null;
                  const userDetail = assignment.userId !== null ? users[assignment.userId] : null;

                  return (
                    <tr key={assignment.id} className="hover:bg-gray-50/50">
                      <td className="px-4 py-3 font-semibold text-gray-800">
                        {assignment.prueba.title}
                      </td>
                      <td className="px-4 py-3">
                        {isRole ? (
                          <span className="inline-flex items-center gap-1 bg-sky-50 text-sky-700 px-2 py-0.5 rounded-md font-semibold">
                            <Shield className="w-3.5 h-3.5" />
                            Rol: {assignment.role}
                          </span>
                        ) : (
                          <span className="inline-flex flex-col bg-purple-50 text-purple-700 px-2 py-1 rounded-md font-semibold">
                            <span className="flex items-center gap-1">
                              <User className="w-3.5 h-3.5" />
                              ID: {assignment.userId}
                            </span>
                            {userDetail && (
                              <span className="text-[10px] font-medium text-purple-500 mt-0.5">
                                {userDetail.nombre} {userDetail.apellido1} ({userDetail.email})
                              </span>
                            )}
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button
                          onClick={() => handleRevoke(assignment.id)}
                          disabled={revokingId !== null}
                          className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors inline-flex items-center"
                          title="Revocar asignación"
                        >
                          {revokingId === assignment.id ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Trash2 className="w-4 h-4" />
                          )}
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
