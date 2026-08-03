"use client";

import { useEffect } from "react";

export default function SessionTimeoutHandler() {
  useEffect(() => {
    // Definimos el tiempo límite en 55 minutos (3300000 ms) para dar margen seguro
    // antes de que expire exactamente a la 1 hora en el servidor.
    const TIMEOUT_DURATION = 55 * 60 * 1000;
    let timeoutId: NodeJS.Timeout;

    const logout = () => {
      // Intentar borrar la cookie de sesión del lado del cliente si es posible
      document.cookie = "session=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
      // Redirigir a la pantalla de inicio con código de error de sesión expirada
      window.location.href = "/?error=session_expired";
    };

    const resetTimer = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(logout, TIMEOUT_DURATION);
    };

    // Eventos que registran la actividad física del usuario en el navegador
    const activityEvents = [
      "mousedown",
      "mousemove",
      "keypress",
      "scroll",
      "touchstart",
      "click",
    ];

    // Iniciar el temporizador al cargar el componente
    resetTimer();

    // Registrar los escuchas de eventos de actividad
    activityEvents.forEach((event) => {
      window.addEventListener(event, resetTimer);
    });

    // Limpieza al desmontar el componente
    return () => {
      clearTimeout(timeoutId);
      activityEvents.forEach((event) => {
        window.removeEventListener(event, resetTimer);
      });
    };
  }, []);

  return null; // Componente lógico, no renderiza elementos visuales
}
