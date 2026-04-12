"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast, ToastContainer } from "react-toastify";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      const response = await fetch("/api/autenticacion/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
        credentials: "include", // Necesario para cookies

      });


      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Error en el login");
      }
      router.push("/dashboard"); // Redirigir a panel 

    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido");
    }
  };

  return (
    <div className="flex items-center justify-center w-full animate-in fade-in zoom-in duration-500">
      <div className="bg-white/80 backdrop-blur-md p-8 md:p-10 rounded-3xl w-full shadow-[0_20px_50px_rgba(0,0,0,0.1)] border border-slate-100">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold text-slate-800 tracking-tight">Iniciar Sesión</h1>
          <p className="text-slate-500 text-sm mt-2">Ingrese sus credenciales para acceder</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-slate-700 ml-1">Correo Electrónico</label>
            <input
              type="email"
              placeholder="ejemplo@correo.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all placeholder:text-slate-300 bg-slate-50/50"
              required
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-semibold text-slate-700 ml-1">Contraseña</label>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all placeholder:text-slate-300 bg-slate-50/50"
              required
            />
          </div>

          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 p-3 rounded-r-lg animate-bounce">
              <p className="text-red-600 text-sm font-medium">{error}</p>
            </div>
          )}

          <button
            type="submit"
            className="w-full bg-emerald-600 text-white py-3 px-4 rounded-xl font-bold shadow-lg shadow-emerald-200 hover:bg-emerald-700 hover:shadow-emerald-300 transform active:scale-[0.98] transition-all duration-200"
          >
            Ingresar al Sistema
          </button>
        </form>

        <div className="mt-8 text-center pt-6 border-t border-slate-100">
          <button
            type="button"
            onClick={() => toast.info('Por favor contacte con el administrador de la plataforma')}
            className="text-emerald-600 text-sm font-medium hover:text-emerald-700 hover:underline transition-colors"
          >
            ¿Problemas para acceder?
          </button>
          <ToastContainer position="top-right" autoClose={3000} theme="colored" />
        </div>
      </div>
    </div>
  );
}