"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

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

      console.log('RESPONSE:', response);

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
    <div className=" flex items-center justify-center bg-gray-100 w-fit">
      <div className="bg-white p-8 rounded-lg  w-96 container-sombra-4lados">
        <h1 className="text-2xl font-bold mb-6 text-center">Iniciar Sesión</h1>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-2 border rounded"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Contraseña</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-2 border rounded"
              required
            />
          </div>

          {error && <p className="text-red-500 text-sm">{error}</p>}

          <button
            type="submit"
            className="w-full bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 transition-colors"
          >
            Ingresar
          </button>
        </form>

        <div className="mt-4 text-center">
          <Link href="/recuperar-contrasena" className="text-blue-500 text-sm hover:underline">
            ¿Olvidaste tu contraseña?
          </Link>
        </div>
      </div>
    </div>
  );
}