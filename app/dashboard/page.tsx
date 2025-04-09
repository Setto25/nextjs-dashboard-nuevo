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
    <main className="grid h-full grid-cols-1 lg:grid-cols-2 justify-start" style={{ backgroundImage: 'url(/fondo3.2.webp)' }}>
      <Suspense fallback={<p>Cargando...</p>}>
        <ErrorToast />
      </Suspense>

      <div className="contenedor__formulario flex flex-wrap h-96 w-full col-span-1 overflow-y-visible justify-start px-10">
        <p className="subtitle-responsive">Tablón de mensajes:</p>
        <div className="contenedor__columna w-full h-96 items-start">
          <div className="contenedor__notas h-full overflow-y-scroll py-2 pb-10">
            {notes.map((note) => (
              <div key={note.id} className="bg-slate-400 p-4 my-1">
                <p className="small-text-responsive font-semibold">{note.createdAt}</p>
                <h1 className="description-responsive font-semibold">Título: {note.title}</h1>
                <p className="description-responsive">Mensaje: {note.content}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="conenedor__buscador flex flex-wrap h-96 w-full col-span-1 overflow-y-visible px-10 pt-10 lg:pt-0 justify-start">
        <p className="subtitle-responsive">Búsquedas de contenido</p>
        <PaginaBusqueda />
      </div>
    </main>
  );
}

export default HomePage;
