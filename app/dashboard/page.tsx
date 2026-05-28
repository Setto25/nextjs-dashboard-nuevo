"use client";

import { useEffect } from "react";
import { useNoteHook } from "../context/notecontext";
import PaginaBusqueda from "../components/search/BuscadorArchivos";
import '@/app/ui/global/grids.css';
import '@/app/ui/global/texts.css';
import { toast } from "react-toastify";
import { useSearchParams } from "next/navigation";
import { Suspense } from 'react';
import { RenderContent } from "../components/mensajes/Mensajes";

function HomePage() {
  const { notes, loadNotes } = useNoteHook();

  // Componente separado para manejar searchParams
  function ErrorToast() {
    const searchParams = useSearchParams();
    const error = searchParams?.get('error');

    useEffect(() => {
      if (error) {
        toast.error(error);
      }
    }, [error]);

    return null; // No renderiza nada visual
  }

  useEffect(() => {
    loadNotes();
  }, []);

return (
    <div className="flex flex-col w-full min-h-screen bg-gray-50 p-4 md:p-8 space-y-6">
      <Suspense fallback={<p>Cargando...</p>}>
        <ErrorToast />
      </Suspense>

      {/* --- BANNER DE BIENVENIDA --- */}
      <div className="w-full bg-gradient-to-r from-emerald-600 to-teal-700 text-white rounded-2xl p-6 shadow-md relative overflow-hidden flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        {/* Adornos de fondo sutiles */}
        <div className="absolute right-0 bottom-0 top-0 w-1/3 bg-emerald-500 opacity-10 rounded-l-full transform translate-x-10 pointer-events-none" />
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">¡Hola de nuevo!</h1>
          <p className="text-emerald-100 text-sm md:text-base mt-1">
            Aquí tienes las últimas novedades de la plataforma y el acceso rápido a los archivos.
          </p>
        </div>
        <div className="flex flex-col sm:items-end text-sm md:text-base bg-emerald-700/30 px-4 py-2 rounded-xl backdrop-blur-sm border border-emerald-500/20 w-fit">
          <span className="font-bold">Fecha del día</span>
          <span className="text-emerald-200 text-xs mt-0.5">
            {new Date().toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </span>
        </div>
      </div>

      {/* --- GRID DE CONTENIDO --- */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        
        {/* --- COLUMNA 1: TABLÓN DE MENSAJES (1/3 de ancho en lg) --- */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col w-full h-[calc(100vh-290px)] min-h-[580px] lg:col-span-1">
          {/* Título con subrayado sutil */}
          <div className="flex items-center justify-between mb-4 border-b border-gray-100 pb-3">
            <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
              <span className="h-3.5 w-3.5 rounded-full bg-emerald-500 inline-block animate-pulse" />
              Tablón de novedades
            </h2>
            <span className="text-xs bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-full font-semibold">
              {notes.length} {notes.length === 1 ? 'mensaje' : 'mensajes'}
            </span>
          </div>

          <div className="flex-grow overflow-hidden relative">
            {/* Contenedor con scroll y padding */}
            <div className="h-full overflow-y-auto pr-2 space-y-4 pb-4 custom-scrollbar">
              {notes.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center p-6 text-gray-400">
                  <svg className="w-12 h-12 mb-2 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0a2 2 0 01-2 2H6a2 2 0 01-2-2m16 0V9a2 2 0 00-2-2H6a2 2 0 00-2 2v4h16z" />
                  </svg>
                  <p className="text-sm">No hay novedades registradas</p>
                </div>
              ) : (
                notes.map((note) => (
                  <div 
                    key={note.id} 
                    className="bg-gray-50 p-4 rounded-xl border border-gray-100 border-l-4 border-l-emerald-500 hover:shadow-sm hover:border-gray-200 transition-all duration-200"
                  >
                    {/* Fecha más pequeña y discreta */}
                    <div className="flex justify-between items-center mb-1.5">
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                        {note.createdAt}
                      </p>
                    </div>

                    {/* Título y Contenido */}
                    <h3 className="text-sm font-bold text-emerald-800 mb-1 leading-snug">
                      {note.title}
                    </h3>
                    <div className="text-gray-600 leading-relaxed text-xs text-justify">
                      <RenderContent content={note.content} />
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* --- COLUMNA 2: BUSCADOR (2/3 de ancho en lg) --- */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col w-full h-auto lg:col-span-2">
          <div className="flex items-center justify-between mb-4 border-b border-gray-100 pb-3">
            <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
              <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              Búsquedas de contenido
            </h2>
          </div>
    
          <PaginaBusqueda />
        </div>

      </div>
    </div>
  );
}

export default HomePage;
