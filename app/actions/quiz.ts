"use server";

import { prisma } from "@/app/lib/prisma";
import { cookies } from "next/headers";
import { revalidatePath, updateTag } from "next/cache";

interface Session {
  id: number;
  email: string;
  role: string;
}

async function getSession(): Promise<Session | null> {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get("session");
  if (!sessionCookie) return null;
  try {
    return JSON.parse(sessionCookie.value) as Session;
  } catch {
    return null;
  }
}

/**
 * Valida la sesión de la cookie, verifica que el usuario tiene acceso (por rol o ID)
 * mediante AsignacionPrueba y crea un IntentoPrueba. Retorna el examen con sus opciones
 * (EXCLUYENDO isCorrect) y el intentoId.
 */
export async function startQuizAction(pruebaId: string) {
  try {
    const session = await getSession();
    if (!session) {
      return { success: false, error: "No autorizado: Sesión expirada." };
    }

    // 1. Verificar si el usuario tiene asignado el prueba
    const asignaciones = await prisma.asignacionPrueba.findMany({
      where: { pruebaId }
    });

    // Si hay asignaciones específicas, el usuario debe cumplir al menos una
    if (asignaciones.length > 0) {
      const hasAccess = asignaciones.some(
        (assignment) =>
          (assignment.userId !== null && assignment.userId === session.id) ||
          (assignment.role !== null && assignment.role.toLowerCase() === session.role.toLowerCase())
      );

      if (!hasAccess) {
        return { success: false, error: "No tienes acceso a esta evaluación." };
      }
    }

    // 2. Obtener el prueba con todos los datos necesarios para el snapshot interno
    const quizForSnapshot = await prisma.prueba.findUnique({
      where: { id: pruebaId, isActive: true },
      include: {
        preguntas: {
          include: {
            opciones: true // Incluye isCorrect para el snapshot interno
          }
        }
      }
    });

    if (!quizForSnapshot) {
      return { success: false, error: "La evaluación no existe o no está activa." };
    }

    if ((quizForSnapshot as any).limiteIntentos !== null) {
      const intentosPrevios = await prisma.intentoPrueba.count({
        where: { pruebaId, userId: session.id }
      });
      if (intentosPrevios >= (quizForSnapshot as any).limiteIntentos) {
        return { success: false, error: "Has alcanzado el límite máximo de intentos para esta evaluación." };
      }
    }

    // Estructurar el snapshot para persistencia histórica
    const snapshot = {
      id: quizForSnapshot.id,
      title: quizForSnapshot.title,
      description: quizForSnapshot.description,
      timeLimitMinutes: quizForSnapshot.timeLimitMinutes,
      preguntas: quizForSnapshot.preguntas.map((q) => ({
        id: q.id,
        text: q.text,
        opciones: q.opciones.map((o) => ({
          id: o.id,
          text: o.text,
          isCorrect: o.isCorrect
        }))
      }))
    };

    // 3. Crear el IntentoPrueba guardando el snapshot
    const intento = await prisma.intentoPrueba.create({
      data: {
        pruebaId,
        userId: session.id,
        status: "IN_PROGRESS",
        startedAt: new Date(),
        snapshot: snapshot as any
      }
    });

    try {
      updateTag("prueba-stats");
    } catch (e) {
      console.error("Error invalidating cache tag:", e);
    }

    // 4. Retornar el examen EXCLUYENDO isCorrect para el cliente
    const clientQuizQuestions = quizForSnapshot.preguntas.map((q) => ({
      id: q.id,
      text: q.text,
      opciones: q.opciones.map((o) => ({
        id: o.id,
        text: o.text
      }))
    }));

    return {
      success: true,
      intentoId: intento.id,
      prueba: {
        id: quizForSnapshot.id,
        title: quizForSnapshot.title,
        description: quizForSnapshot.description,
        timeLimitMinutes: quizForSnapshot.timeLimitMinutes,
        preguntas: clientQuizQuestions
      }
    };
  } catch (error: any) {
    console.error("Error al iniciar el examen:", error);
    return { success: false, error: error?.message || "Error interno del servidor." };
  }
}

/**
 * Recibe un array completo de respuestas. Valida la sesión. Busca el IntentoPrueba.
 * Calcula el tiempo transcurrido desde startedAt con 30 segundos extra de gracia
 * respecto a timeLimitMinutes. Si el tiempo es válido, calcula el score verificando
 * las opciones correctas en la BD, guarda las respuestas en la tabla Answer,
 * y actualiza el estado a COMPLETED. Si el tiempo expiró, marca como TIMEOUT y no procesa puntos.
 */
export async function submitQuizAction(
  intentoId: string,
  respuestas: { preguntaId: string; opcionId: string }[]
) {
  try {
    const session = await getSession();
    if (!session) {
      return { success: false, error: "No autorizado: Sesión expirada." };
    }

    // 1. Obtener el intento
    const intento = await prisma.intentoPrueba.findUnique({
      where: { id: intentoId },
      include: {
        prueba: {
          include: {
            preguntas: {
              include: {
                opciones: true // Aquí sí necesitamos isCorrect para evaluar
              }
            }
          }
        }
      }
    });

    if (!intento) {
      return { success: false, error: "El intento de evaluación no existe." };
    }

    if (intento.userId !== session.id) {
      return { success: false, error: "No autorizado para enviar esta evaluación." };
    }

    if (intento.status !== "IN_PROGRESS") {
      return { success: false, error: "Esta evaluación ya ha sido enviada o ha expirado." };
    }

    // 2. Validar tiempo límite
    const snapshot = intento.snapshot as any;
    const startedTime = intento.startedAt.getTime();
    const currentTime = Date.now();
    const timeLimitMinutes = snapshot ? snapshot.timeLimitMinutes : intento.prueba.timeLimitMinutes;

    if (timeLimitMinutes !== null && timeLimitMinutes > 0) {
      const timeLimitMs = timeLimitMinutes * 60 * 1000;
      const gracePeriodMs = 30 * 1000; // 30 segundos de gracia
      
      if (currentTime - startedTime > timeLimitMs + gracePeriodMs) {
        // Excedió el tiempo límite: registrar como TIMEOUT
        const updatedAttempt = await prisma.intentoPrueba.update({
          where: { id: intentoId },
          data: {
            status: "TIMEOUT",
            score: 0
          }
        });

        revalidatePath("/dashboard/capacitacion/pruebas");
        revalidatePath("/dashboard/admin/pruebas");

        return {
          success: false,
          status: "TIMEOUT",
          error: "El tiempo límite ha expirado. Tu examen ha sido marcado como TIMEOUT."
        };
      }
    }

    // 3. Calcular la puntuación
    const correctAnswersMap = new Map<string, string>();
    let totalQuestions = 0;

    if (snapshot && snapshot.preguntas) {
      // Usar snapshot histórico
      const preguntas = snapshot.preguntas || [];
      totalQuestions = preguntas.length;
      preguntas.forEach((q: any) => {
        const correctOpt = q.opciones.find((o: any) => o.isCorrect);
        if (correctOpt) {
          correctAnswersMap.set(q.id, correctOpt.id);
        }
      });
    } else {
      // Fallback para intentos antiguos sin snapshot
      totalQuestions = intento.prueba.preguntas.length;
      intento.prueba.preguntas.forEach((q) => {
        const correctOpt = q.opciones.find((o) => o.isCorrect);
        if (correctOpt) {
          correctAnswersMap.set(q.id, correctOpt.id);
        }
      });
    }

    let correctCount = 0;

    respuestas.forEach((ans) => {
      const correctOptionId = correctAnswersMap.get(ans.preguntaId);
      if (correctOptionId && correctOptionId === ans.opcionId) {
        correctCount++;
      }
    });

    const score = totalQuestions > 0 ? (correctCount / totalQuestions) * 100 : 100;

    // 4. Guardar respuestas y actualizar intento en transacción
    await prisma.$transaction([
      prisma.respuestaPrueba.createMany({
        data: respuestas.map((ans) => ({
          intentoId: intentoId,
          preguntaId: ans.preguntaId,
          opcionId: ans.opcionId
        }))
      }),
      prisma.intentoPrueba.update({
        where: { id: intentoId },
        data: {
          status: "COMPLETED",
          score: parseFloat(score.toFixed(2))
        }
      })
    ]);

    revalidatePath("/dashboard/capacitacion/pruebas");
    revalidatePath("/dashboard/admin/pruebas");
    try {
      updateTag("prueba-stats");
    } catch (e) {
      console.error("Error invalidating cache tag:", e);
    }

    return {
      success: true,
      status: "COMPLETED",
      score: parseFloat(score.toFixed(2)),
      correctCount,
      totalQuestions
    };
  } catch (error: any) {
    console.error("Error al enviar el examen:", error);
    return { success: false, status: "ERROR", error: error?.message || "Error interno al procesar el examen." };
  }
}

/**
 * Crea una evaluación de prueba (dummy) asignada a todos los usuarios
 * con rol "user" y "admin" para probar el sistema de pruebas.
 */
export async function createDummyQuizAction() {
  try {
    const session = await getSession();
    if (!session || !["admin", "super_admin"].includes(session.role.toLowerCase())) {
      return { success: false, error: "No autorizado." };
    }

    const prueba = await prisma.prueba.create({
      data: {
        title: "Evaluación Demo: Protocolos y Procedimientos",
        description: "Examen de prueba que abarca los 5 momentos del lavado de manos, materiales para VVP y Catéter Urinario.",
        timeLimitMinutes: 5,
        isActive: true,
        asignaciones: {
          create: [
            { role: "user" },
            { role: "admin" }
          ]
        },
        preguntas: {
          create: [
            {
              text: "Según la Organización Mundial de la Salud (OMS), ¿Cuáles son exactamente los 5 momentos en los que se debe realizar la higiene de manos?",
              opciones: {
                create: [
                  { text: "1. Al llegar al turno, 2. Antes de comer, 3. Después de ir al baño, 4. Después de tocar al paciente, 5. Al finalizar el turno.", isCorrect: false },
                  { text: "1. Antes de ponerse guantes, 2. Después de quitarse los guantes, 3. Antes de administrar medicamentos, 4. Después de limpiar superficies, 5. Antes de saludar al paciente.", isCorrect: false },
                  { text: "1. Antes de tocar al paciente, 2. Antes de realizar una tarea limpia/aséptica, 3. Después del riesgo de exposición a líquidos corporales, 4. Después de tocar al paciente, 5. Después del contacto con el entorno del paciente.", isCorrect: true },
                  { text: "1. Antes del contacto con el paciente, 2. Durante el examen físico, 3. Después de administrar medicamentos, 4. Después de tocar equipos médicos, 5. Antes de salir de la habitación.", isCorrect: false }
                ]
              }
            },
            {
              text: "¿Cuál de las siguientes alternativas contiene SÓLO los materiales esenciales correctos para la instalación de una Vía Venosa Periférica (VVP)?",
              opciones: {
                create: [
                  { text: "Guantes de procedimiento, tórulas, bránula, apósito transparente, liga, suero, jeringas, llave de 3 pasos, riñón estéril, extensor en T y rótulo.", isCorrect: true },
                  { text: "Guantes estériles, tórulas, bránula, apósito, liga, bisturí, llave de 3 pasos y suero fisiológico.", isCorrect: false },
                  { text: "Guantes de procedimiento, sonda Foley, bránula, liga, apósito, suero y jeringa.", isCorrect: false },
                  { text: "Guantes de procedimiento, tórulas, liga, termómetro, mascarilla quirúrgica y apósito transparente.", isCorrect: false }
                ]
              }
            },
            {
              text: "¿Cuáles son los materiales clave requeridos para el procedimiento de instalación de Catéter Urinario permanente ?",
              opciones: {
                create: [
                  { text: "Guantes de procedimiento, Sonda Foley, suero fisiológico en gran volumen, liga, bránula y llave de 3 pasos.", isCorrect: false },
                  { text: "Mascarilla, cofia, guantes estériles, Sonda Foley, vaselina estéril, agua estéril (ampolla), jeringa, paño perforado, apósito transparente y bolsa recolectora.", isCorrect: true },
                  { text: "Guantes estériles, Sonda Foley, bisturí, suturas, apósito tradicional, cinta adhesiva y jeringa de 50cc.", isCorrect: false },
                  { text: "Guantes de procedimiento, Sonda Foley, vaselina corriente, agua de la llave, riñón limpio, bolsa recolectora y termómetro.", isCorrect: false }
                ]
              }
            }
          ]
        }
      }
    });

    revalidatePath("/dashboard/capacitacion/pruebas");
    revalidatePath("/dashboard/admin/pruebas");

    return { success: true, pruebaId: prueba.id };
  } catch (error: any) {
    console.error("Error al crear examen de prueba:", error);
    return { success: false, error: error?.message || "Error al crear la evaluación de prueba." };
  }
}

/**
 * Crea una asignación de examen para un rol o un usuario específico.
 */
export async function assignQuizAction(pruebaId: string, role?: string, userId?: number) {
  try {
    const session = await getSession();
    if (!session || !["admin", "super_admin"].includes(session.role.toLowerCase())) {
      return { success: false, error: "No autorizado." };
    }

    if (!role && !userId) {
      return { success: false, error: "Debe ingresar un rol o un ID de usuario para realizar la asignación." };
    }

    // Crear registro
    const assignment = await prisma.asignacionPrueba.create({
      data: {
        pruebaId,
        role: role ? role.trim() : null,
        userId: userId ? Number(userId) : null
      }
    });

    revalidatePath("/dashboard/admin/pruebas/asignaciones");
    revalidatePath("/dashboard/capacitacion/pruebas");

    return { success: true, assignmentId: assignment.id };
  } catch (error: any) {
    console.error("Error al asignar examen:", error);
    return { success: false, error: error?.message || "Ocurrió un error al guardar la asignación." };
  }
}

/**
 * Asigna un examen a múltiples usuarios a la vez (por IDs).
 * Omite usuarios que ya tienen asignación activa para ese examen.
 */
export async function assignQuizToUsersAction(pruebaId: string, userIds: number[]) {
  try {
    const session = await getSession();
    if (!session || !["admin", "super_admin"].includes(session.role.toLowerCase())) {
      return { success: false, error: "No autorizado." };
    }

    if (!pruebaId || userIds.length === 0) {
      return { success: false, error: "Debe seleccionar al menos un usuario." };
    }

    // Encontrar asignaciones ya existentes para ese examen y esos usuarios
    const existing = await prisma.asignacionPrueba.findMany({
      where: { pruebaId, userId: { in: userIds } },
      select: { userId: true }
    });
    const existingUserIds = new Set(existing.map((e) => e.userId));
    const newUserIds = userIds.filter((id) => !existingUserIds.has(id));

    if (newUserIds.length === 0) {
      return { success: false, error: "Todos los usuarios seleccionados ya tienen asignación para esta prueba." };
    }

    await prisma.asignacionPrueba.createMany({
      data: newUserIds.map((userId) => ({ pruebaId, userId, role: null }))
    });

    revalidatePath("/dashboard/admin/pruebas/asignaciones");
    revalidatePath("/dashboard/capacitacion/pruebas");

    return { success: true, assigned: newUserIds.length, skipped: userIds.length - newUserIds.length };
  } catch (error: any) {
    console.error("Error al asignar examen a usuarios:", error);
    return { success: false, error: error?.message || "Error al guardar las asignaciones." };
  }
}

/**
 * Revoca (elimina) una asignación de examen.
 */
export async function revokeQuizAssignmentAction(assignmentId: string) {
  try {
    const session = await getSession();
    if (!session || !["admin", "super_admin"].includes(session.role.toLowerCase())) {
      return { success: false, error: "No autorizado." };
    }

    await prisma.asignacionPrueba.delete({
      where: { id: assignmentId }
    });

    revalidatePath("/dashboard/admin/pruebas/asignaciones");
    revalidatePath("/dashboard/capacitacion/pruebas");

    return { success: true };
  } catch (error: any) {
    console.error("Error al revocar asignación:", error);
    return { success: false, error: error?.message || "Ocurrió un error al eliminar la asignación." };
  }
}

/**
 * Crea un nuevo tema (tópico) para clasificar preguntas.
 */
export async function createTemaAction(name: string) {
  try {
    const session = await getSession();
    if (!session || !["admin", "super_admin"].includes(session.role.toLowerCase())) {
      return { success: false, error: "No autorizado." };
    }

    if (!name || !name.trim()) {
      return { success: false, error: "El nombre del tema es obligatorio." };
    }

    const newTema = await prisma.tema.create({
      data: {
        tema: name.trim()
      }
    });

    revalidatePath("/dashboard/admin");
    revalidatePath("/dashboard/admin/pruebas");
    revalidatePath("/dashboard/capacitacion/pruebas");

    return { success: true, temaId: newTema.id };
  } catch (error: any) {
    console.error("Error al crear tema:", error);
    return { success: false, error: error?.message || "Ocurrió un error al guardar el tema." };
  }
}

/**
 * Crea una pregunta asociada a un tema con sus alternativas correspondientes.
 * Las preguntas al crearse se agregan directamente al banco (pruebaId = null).
 */
export async function createQuestionAction(
  temaId: number,
  text: string,
  opciones: { text: string; isCorrect: boolean }[]
) {
  try {
    const session = await getSession();
    if (!session || !["admin", "super_admin"].includes(session.role.toLowerCase())) {
      return { success: false, error: "No autorizado." };
    }

    if (!text.trim()) {
      return { success: false, error: "El texto de la pregunta es obligatorio." };
    }

    if (opciones.length < 2) {
      return { success: false, error: "Debe ingresar al menos 2 alternativas." };
    }

    const hasCorrect = opciones.some((o) => o.isCorrect);
    if (!hasCorrect) {
      return { success: false, error: "Debe marcar al menos una alternativa como correcta." };
    }

    const question = await prisma.preguntaPrueba.create({
      data: {
        text: text.trim(),
        temaId: Number(temaId),
        opciones: {
          create: opciones.map((o) => ({
            text: o.text.trim(),
            isCorrect: o.isCorrect
          }))
        }
      }
    });

    revalidatePath("/dashboard/admin");
    revalidatePath("/dashboard/admin/pruebas");
    revalidatePath("/dashboard/capacitacion/pruebas");

    return { success: true, preguntaId: question.id };
  } catch (error: any) {
    console.error("Error al crear pregunta:", error);
    return { success: false, error: error?.message || "Ocurrió un error al guardar la pregunta." };
  }
}

/**
 * Crea un nuevo examen y le asigna las preguntas seleccionadas del banco (actualizando su pruebaId).
 */
export async function createQuizWithQuestionsAction(
  title: string,
  description: string | null,
  timeLimitMinutes: number | null,
  selectedQuestionIds: string[],
  limiteIntentos: number | null = null
) {
  try {
    const session = await getSession();
    if (!session || !["admin", "super_admin"].includes(session.role.toLowerCase())) {
      return { success: false, error: "No autorizado." };
    }

    if (!title.trim()) {
      return { success: false, error: "El título de la evaluación es obligatorio." };
    }

    // 1. Crear examen y asociar las preguntas seleccionadas
    const prueba = await prisma.prueba.create({
      data: {
        title: title.trim(),
        description: description ? description.trim() : null,
        timeLimitMinutes: timeLimitMinutes ? Number(timeLimitMinutes) : null,
        limiteIntentos: limiteIntentos ? Number(limiteIntentos) : null,
        isActive: true,
        preguntas: {
          connect: selectedQuestionIds.map(id => ({ id }))
        }
      }
    });

    revalidatePath("/dashboard/admin");
    revalidatePath("/dashboard/admin/pruebas");
    revalidatePath("/dashboard/capacitacion/pruebas");
    try {
      updateTag("prueba-stats");
    } catch (e) {
      console.error("Error invalidating cache tag:", e);
    }

    return { success: true, pruebaId: prueba.id };
  } catch (error: any) {
    console.error("Error al crear evaluación con preguntas:", error);
    return { success: false, error: error?.message || "Ocurrió un error al crear la evaluación." };
  }
}

/**
 * Actualiza una evaluación existente y actualiza sus relaciones many-to-many con las preguntas.
 */
export async function updateQuizAction(
  pruebaId: string,
  title: string,
  description: string | null,
  timeLimitMinutes: number | null,
  selectedQuestionIds: string[],
  limiteIntentos: number | null = null
) {
  try {
    const session = await getSession();
    if (!session || !["admin", "super_admin"].includes(session.role.toLowerCase())) {
      return { success: false, error: "No autorizado." };
    }

    if (!title.trim()) {
      return { success: false, error: "El título de la evaluación es obligatorio." };
    }

    await prisma.prueba.update({
      where: { id: pruebaId },
      data: {
        title: title.trim(),
        description: description ? description.trim() : null,
        timeLimitMinutes: timeLimitMinutes ? Number(timeLimitMinutes) : null,
        limiteIntentos: limiteIntentos ? Number(limiteIntentos) : null,
        preguntas: {
          set: selectedQuestionIds.map(id => ({ id }))
        }
      }
    });

    revalidatePath("/dashboard/admin");
    revalidatePath("/dashboard/admin/pruebas");
    revalidatePath("/dashboard/capacitacion/pruebas");
    try {
      updateTag("prueba-stats");
    } catch (e) {
      console.error("Error invalidating cache tag:", e);
    }

    return { success: true };
  } catch (error: any) {
    console.error("Error al actualizar la evaluación:", error);
    return { success: false, error: error?.message || "Ocurrió un error al actualizar la evaluación." };
  }
}

/**
 * Obtiene todos los datos agregados y detallados necesarios para el panel de administración
 * de evaluaciones dentro del cliente.
 */
export async function getAdminQuizDataAction() {
  try {
    const session = await getSession();
    if (!session || !["admin", "super_admin"].includes(session.role.toLowerCase())) {
      return { success: false, error: "No autorizado." };
    }

    // 1. Quizzes (incluyendo las preguntas para sacar sus ids) - Only show active ones for management
    const pruebas = await prisma.prueba.findMany({
      where: { deletedAt: null },
      include: {
        _count: { select: { preguntas: true } },
        preguntas: { select: { id: true } }
      },
      orderBy: { createdAt: "desc" }
    });

    // 1b. Temas
    const temas = await prisma.tema.findMany({
      orderBy: { tema: "asc" }
    });

    // 2. Banco de preguntas (todas las preguntas registradas en el sistema) - Filter question prueba links
    const preguntas = await prisma.preguntaPrueba.findMany({
      include: {
        opciones: true,
        pruebas: {
          where: { deletedAt: null },
          select: { title: true }
        },
        tema: { select: { id: true, tema: true } }
      },
      orderBy: { text: "asc" }
    });

    // 3. Asignaciones
    const asignaciones = await prisma.asignacionPrueba.findMany({
      include: {
        prueba: { select: { title: true } }
      },
      orderBy: { prueba: { title: "asc" } }
    });

    // Cargar detalles de usuarios asignados
    const assignedUserIds = asignaciones
      .filter((a) => a.userId !== null)
      .map((a) => a.userId as number);

    const usersMapList = await prisma.user.findMany({
      where: { id: { in: assignedUserIds } },
      select: {
        id: true,
        nombre: true,
        apellido1: true,
        email: true
      }
    });

    const usersMap: Record<number, { id: number; nombre: string; apellido1: string; email: string }> = {};
    usersMapList.forEach((user) => {
      usersMap[user.id] = user;
    });

    // Cargar TODOS los usuarios del sistema para el panel de asignaciones
    const allUsers = await prisma.user.findMany({
      select: {
        id: true,
        nombre: true,
        apellido1: true,
        email: true,
        role: true
      },
      orderBy: { nombre: "asc" }
    });

    // 4. Estadísticas y Agrupaciones
    const groupStats = await prisma.intentoPrueba.groupBy({
      by: ["pruebaId"],
      _count: { id: true },
      _avg: { score: true }
    });

    const statusStats = await prisma.intentoPrueba.groupBy({
      by: ["pruebaId", "status"],
      _count: { id: true }
    });

    // Fetch all pruebas that are either active OR have intentos for stats
    const quizzesForStats = await prisma.prueba.findMany({
      where: {
        OR: [
          { deletedAt: null },
          { intentos: { some: {} } }
        ]
      },
      include: {
        _count: { select: { preguntas: true } }
      },
      orderBy: { createdAt: "desc" }
    });

    const quizStats = quizzesForStats.map((q) => {
      const gStat = groupStats.find((g) => g.pruebaId === q.id);
      
      const qStatus = statusStats.filter((s) => s.pruebaId === q.id);
      const completedCount = qStatus.find((s) => s.status === "COMPLETED")?._count.id || 0;
      const timeoutCount = qStatus.find((s) => s.status === "TIMEOUT")?._count.id || 0;
      const inProgressCount = qStatus.find((s) => s.status === "IN_PROGRESS")?._count.id || 0;

      return {
        id: q.id,
        title: q.title + (q.deletedAt ? " (Eliminado)" : ""),
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

    // Fetch deleted pruebas
    const deletedQuizzes = await prisma.prueba.findMany({
      where: { NOT: { deletedAt: null } },
      include: {
        _count: { select: { preguntas: true } }
      },
      orderBy: { deletedAt: "desc" }
    });

    return {
      success: true,
      pruebas: pruebas.map((q) => ({ 
        id: q.id, 
        title: q.title, 
        isActive: q.isActive,
        description: q.description || "",
        timeLimitMinutes: q.timeLimitMinutes,
        limiteIntentos: (q as any).limiteIntentos || null,
        preguntaIds: q.preguntas.map((qu) => qu.id)
      })),
      deletedQuizzes: deletedQuizzes.map((q) => ({
        id: q.id,
        title: q.title,
        isActive: q.isActive,
        description: q.description || "",
        timeLimitMinutes: q.timeLimitMinutes,
        preguntaCount: q._count.preguntas,
        deletedAt: q.deletedAt
      })),
      preguntas: preguntas.map((q) => ({
        id: q.id,
        text: q.text,
        quizTitles: q.pruebas.map((qz) => qz.title),
        temaId: q.temaId,
        temaName: q.tema?.tema || null,
        opciones: q.opciones.map((o) => ({ id: o.id, text: o.text, isCorrect: o.isCorrect }))
      })),
      temas,
      asignaciones,
      usersMap,
      allUsers,
      quizStats
    };
  } catch (error: any) {
    console.error("Error al obtener datos de admin prueba:", error);
    return { success: false, error: error?.message || "Error al cargar la información." };
  }
}

/**
 * Obtiene los intentos detallados de una evaluación específica para el panel admin.
 */
export async function getQuizAttemptsAction(pruebaId: string) {
  try {
    const session = await getSession();
    if (!session || !["admin", "super_admin"].includes(session.role.toLowerCase())) {
      return { success: false, error: "No autorizado." };
    }

    const intentos = await prisma.intentoPrueba.findMany({
      where: { pruebaId },
      include: {
        respuestas: true
      },
      orderBy: { createdAt: "desc" }
    });

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
    usersList.forEach((user) => {
      usersMap[user.id] = user;
    });

    // Obtener la estructura del examen con preguntas y opciones para poder contrastar las respuestas
    const prueba = await prisma.prueba.findUnique({
      where: { id: pruebaId },
      include: {
        preguntas: {
          include: {
            opciones: true
          }
        }
      }
    });

    return {
      success: true,
      intentos: intentos.map((a) => ({
        id: a.id,
        score: a.score,
        status: a.status,
        createdAt: a.createdAt,
        userId: a.userId,
        respuestas: a.respuestas.map((ans) => ({
          preguntaId: ans.preguntaId,
          opcionId: ans.opcionId
        })),
        snapshot: a.snapshot
      })),
      usersMap,
      prueba: prueba ? {
        id: prueba.id,
        title: prueba.title,
        preguntas: prueba.preguntas.map((q) => ({
          id: q.id,
          text: q.text,
          opciones: q.opciones.map((o) => ({
            id: o.id,
            text: o.text,
            isCorrect: o.isCorrect
          }))
        }))
      } : null
    };
  } catch (error: any) {
    console.error("Error al obtener intentos de examen:", error);
    return { success: false, error: error?.message || "Error al cargar los intentos." };
  }
}

/**
 * Elimina una pregunta de la base de datos.
 * Sus opciones se eliminan automáticamente en cascada.
 */
export async function deleteQuestionAction(preguntaId: string) {
  try {
    const session = await getSession();
    if (!session || !["admin", "super_admin"].includes(session.role.toLowerCase())) {
      return { success: false, error: "No autorizado." };
    }

    await prisma.preguntaPrueba.delete({
      where: { id: preguntaId }
    });

    revalidatePath("/dashboard/admin");
    revalidatePath("/dashboard/admin/pruebas");
    revalidatePath("/dashboard/capacitacion/pruebas");

    return { success: true };
  } catch (error: any) {
    console.error("Error al eliminar pregunta:", error);
    return { success: false, error: error?.message || "Ocurrió un error al eliminar la pregunta." };
  }
}

/**
 * Elimina un examen de la base de datos.
 * Las preguntas asociadas se desasocian (pruebaId = null) debido a onDelete: SetNull,
 * por lo que no se borran y se mantienen en el banco de preguntas global.
 */
export async function deleteQuizAction(pruebaId: string) {
  try {
    const session = await getSession();
    if (!session || !["admin", "super_admin"].includes(session.role.toLowerCase())) {
      return { success: false, error: "No autorizado." };
    }

    // Soft delete prueba and delete active asignaciones
    await prisma.$transaction([
      prisma.asignacionPrueba.deleteMany({
        where: { pruebaId }
      }),
      prisma.prueba.update({
        where: { id: pruebaId },
        data: {
          deletedAt: new Date(),
          isActive: false
        }
      })
    ]);

    revalidatePath("/dashboard/admin");
    revalidatePath("/dashboard/admin/pruebas");
    revalidatePath("/dashboard/capacitacion/pruebas");
    try {
      updateTag("prueba-stats");
    } catch (e) {
      console.error("Error invalidating cache tag:", e);
    }

    return { success: true };
  } catch (error: any) {
    console.error("Error al eliminar examen:", error);
    return { success: false, error: error?.message || "Ocurrió un error al eliminar la evaluación." };
  }
}

/**
 * Restaura (reintegra) una evaluación previamente soft-deleted.
 */
export async function restoreQuizAction(pruebaId: string) {
  try {
    const session = await getSession();
    if (!session || !["admin", "super_admin"].includes(session.role.toLowerCase())) {
      return { success: false, error: "No autorizado." };
    }

    await prisma.prueba.update({
      where: { id: pruebaId },
      data: {
        deletedAt: null,
        isActive: true
      }
    });

    revalidatePath("/dashboard/admin");
    revalidatePath("/dashboard/admin/pruebas");
    revalidatePath("/dashboard/capacitacion/pruebas");
    try {
      updateTag("prueba-stats");
    } catch (e) {
      console.error("Error invalidating cache tag:", e);
    }

    return { success: true };
  } catch (error: any) {
    console.error("Error al restaurar examen:", error);
    return { success: false, error: error?.message || "Ocurrió un error al restaurar la evaluación." };
  }
}

/**
 * Actualiza una pregunta existente y sus alternativas.
 */
export async function updateQuestionAction(
  preguntaId: string,
  temaId: number,
  text: string,
  opciones: { text: string; isCorrect: boolean }[]
) {
  try {
    const session = await getSession();
    if (!session || !["admin", "super_admin"].includes(session.role.toLowerCase())) {
      return { success: false, error: "No autorizado." };
    }

    if (!text.trim()) {
      return { success: false, error: "El texto de la pregunta es obligatorio." };
    }

    if (opciones.length < 2) {
      return { success: false, error: "Debe ingresar al menos 2 alternativas." };
    }

    const hasCorrect = opciones.some((o) => o.isCorrect);
    if (!hasCorrect) {
      return { success: false, error: "Debe marcar al menos una alternativa como correcta." };
    }

    // Usar transacción para borrar las opciones anteriores y recrear las nuevas
    await prisma.$transaction([
      prisma.opcionPrueba.deleteMany({
        where: { preguntaId }
      }),
      prisma.preguntaPrueba.update({
        where: { id: preguntaId },
        data: {
          text: text.trim(),
          temaId: Number(temaId),
          opciones: {
            create: opciones.map((o) => ({
              text: o.text.trim(),
              isCorrect: o.isCorrect
            }))
          }
        }
      })
    ]);

    revalidatePath("/dashboard/admin");
    revalidatePath("/dashboard/admin/pruebas");
    revalidatePath("/dashboard/capacitacion/pruebas");
    try {
      updateTag("prueba-stats");
    } catch (e) {
      console.error("Error invalidating cache tag:", e);
    }

    return { success: true };
  } catch (error: any) {
    console.error("Error al actualizar la pregunta:", error);
    return { success: false, error: error?.message || "Ocurrió un error al actualizar la pregunta." };
  }
}
