"use client";

import { useState } from "react";

export default function BackupSyncInfo() {
  const [isBackingUp, setIsBackingUp] = useState(false);

  const handleBackupSync = async () => {
    setIsBackingUp(true);
    try {
      const res = await fetch("/api/sync", { method: "POST" });
      if (!res.ok) throw new Error("Error al hacer backup");
      alert("Backup y sincronización completados con éxito.");
    } catch (error: any) {
      alert(`Falló el backup: ${error.message || "Error desconocido"}`);
    } finally {
      setIsBackingUp(false);
    }
  };

  return (
    <main className="min-h-screen bg-gray-50 flex justify-center p-6">
      <div className="max-w-xl bg-white rounded-lg shadow-lg p-8 space-y-6">
        <h2 className="text-3xl font-bold text-center text-blue-700">
          Backup y Sincronización
        </h2>

        <p className="text-gray-700 text-lg leading-relaxed">
          El botón <b>“Hacer Backup y Sincronizar”</b> permite guardar una copia
          actualizada y segura de todos los archivos importantes, así como
          sincronizar la base de datos y carpetas críticas como <code>public</code>.
          Esto es vital para:
        </p>

        <ul className="list-disc pl-6 text-gray-700 space-y-2">
          <li>Evitar pérdida de datos ante fallos o borrados accidentales.</li>
          <li>
            Tener siempre una copia de respaldo actualizada para recuperación
            rápida.
          </li>
          <li>
            Sincronizar archivos nuevos, modificados o eliminados adecuadamente.
          </li>
        </ul>

        <div className="text-center">
          <button
            onClick={handleBackupSync}
            disabled={isBackingUp}
            className={`px-8 py-3 rounded text-white font-semibold transition ${
              isBackingUp
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700"
            }`}
            title="Haz clic para hacer backup y sincronizar"
          >
            {isBackingUp ? "Procesando..." : "Hacer Backup y Sincronizar"}
          </button>
        </div>
      </div>
    </main>
  );
}