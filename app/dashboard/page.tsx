"use client";

import { useContext, useEffect } from "react";
import NoteForm from "../components/noteform";
import { useNoteHook } from "../context/notecontext";
import PaginaBusqueda from "../components/search/BuscadorArchivos";
import '@/app/ui/global/grids.css';
import '@/app/ui/global/texts.css';
import LogoutPage from "../logout/Logout";
import { useRouter } from "next/router";
import { toast } from "react-toastify";
import { useSearchParams } from "next/navigation";


function HomePage() {
  //const notes= await loadNotes();

  const { notes, loadNotes } = useNoteHook(); //uso usecontext para traer NoteContext y asignarlo

  const searchParams = useSearchParams();
  const error = searchParams.get('error'); // Obtener el valor del query param "error"

  useEffect(() => { //useEffect para mostrar el mensaje de error
    if (error) {
      toast.error(error); // Mostrar el mensaje en un toast
    }
  }, [error]);

  useEffect(() => { //Cuando cargue la pagina, carga loadNotes(Lo de los registros)
    loadNotes();
  }, [])


  return (
    <main className="grid h-full grid-cols-1 lg:grid-cols-2 justify-start" style={{
      backgroundImage: 'url(/fondo3.2.webp)', // Ruta de la imagen de fondo  

    }}  >

      <div className="contenedor__formulario flex flex-wrap h-96 w-full col-span-1 overflow-y-visible justify-start px-10">
        <p className="subtitle-responsive ">Tablón de mensajes:  </p>
        <div className="contenedor__columna w-full h-96 items-start">

          {/*<NoteForm />      Formulario para ingresar infomacion a la DB */}

          <div className="contenedor__notas h-full overflow-y-scroll py-2 pb-10">
            {/*Visualizacion de la info de la DB*/}
            {notes.map((note) => (  // note.map() Esto recorreun arreglo y trabforma cada uno en uno nuevo por cafda nota 
              <div key={note.id} className="bg-slate-400 p-4 my-1"> {/*Se crea un div por cada nota */}
                <p className="small-text-responsive font-semibold">  {note.createdAt}</p> {/*se usa la libreria date-fns para darle formato a la fecha */}
                <h1 className="description-responsive  font-semibold">Título: {note.title}</h1>
                <p className="description-responsive" >Mensaje: {note.content}</p>
              </div>
            )
            )
            }

          </div>

        </div>
      </div>
      <div className="conenedor__buscador flex flex-wrap h-96  w-full col-span-1 overflow-y-visible px-10 pt-10 lg:pt-0 justify-start ">
        <p className="subtitle-responsive">Busquedas de contenido</p>
        <PaginaBusqueda />

      </div>


    </main>
  );
}

export default HomePage;