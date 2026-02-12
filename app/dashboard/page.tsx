"use client";

import { useEffect } from "react";
import { useNoteHook } from "../context/notecontext";
import PaginaBusqueda from "../components/search/BuscadorArchivos";
import '@/app/ui/global/grids.css';
import '@/app/ui/global/texts.css';
import { toast } from "react-toastify";
import { useSearchParams } from "next/navigation";
import { Suspense } from 'react';

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
    <main className="grid h-full grid-cols-1 lg:grid-cols-2 gap-8 p-4 md:p-8 justify-start items-start">
      <Suspense fallback={<p>Cargando...</p>}>
        <ErrorToast />
      </Suspense>

      {/* --- COLUMNA 1: TABLÓN DE MENSAJES --- */}
      <div className="contenedor__formulario flex flex-col w-full h-[500px] col-span-1">
        
        {/* Título con subrayado sutil */}
        <h2 className="subtitle-responsive text-gray-800 mb-4 border-b-2 border-sky-100 pb-2">
          Tablón de mensajes:
        </h2>

        <div className="contenedor__columna w-full flex-grow overflow-hidden">
          {/* Contenedor con scroll y padding para que la sombra no se corte */}
          <div className="contenedor__notas h-full overflow-y-auto pr-2 space-y-4 p-2 custom-scrollbar">
            {notes.map((note) => (
              <div 
                key={note.id} 
                className="bg-white p-5 rounded-lg shadow-sm border border-gray-100 border-l-4 border-l-sky-500 hover:shadow-md transition-shadow duration-200"
              >
                {/* Fecha más pequeña y discreta */}
                <div className="flex justify-between items-center mb-2">
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wide">
                    {note.createdAt}
                  </p>
                </div>

                {/* Título y Contenido */}
                <h3 className="description-responsive font-bold text-sky-700 mb-1">
                  {note.title}
                </h3>
                <p className="description-responsive text-gray-600 leading-relaxed text-sm text-justify">
                  {note.content}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* --- COLUMNA 2: BUSCADOR --- */}
      <div className="conenedor__buscador flex flex-col w-full h-auto col-span-1 pt-10 lg:pt-0">
        <h2 className="subtitle-responsive text-gray-800 mb-4 border-b-2 border-sky-100 pb-2">
          Búsquedas de contenido
        </h2>
        {/* Asegúrate de que PaginaBusqueda no tenga estilos verdes internamente */}
        <PaginaBusqueda />
      </div>
    </main>
  );
}

export default HomePage;
