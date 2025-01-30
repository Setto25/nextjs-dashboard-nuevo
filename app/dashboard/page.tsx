"use client";

import { useContext, useEffect } from "react";
import NoteForm from "../components/noteform";
import { useNoteHook } from "../context/notecontext";
import PaginaBusqueda from "../components/search/Buscador";
import '@/app/ui/global/grids.css';
import '@/app/ui/global/texts.css';
import { format } from "date-fns";


function HomePage() {
  //const notes= await loadNotes();

  const { notes, loadNotes } = useNoteHook(); //uso usecontext para traer NoteContext y asignarlo

  useEffect(() => { //Cuando cargue la pagina, carga loadNotes(Lo de los registros)
    loadNotes();
  }, [])


  return (
    <main className="flex h-screen grid-cols-[repeat(auto-fit,minmax(100px,fr))] items-center" style={{
      backgroundImage: 'url(/fondo3.2.webp)', // Ruta de la imagen de fondo  

    }}  >


      <div className="flex  w-full h-1/2 col-span-1 justify-center overflow-y-hidden ">

        <div className="contenedor__busquedas col-span-1 justify-center items-center overflow-y-scroll"> {/* Puede especificar cómo almacenar el componente */}
          <PaginaBusqueda />
        </div>
      </div>



      <div className="contenedor__formulario flex  w-full h-7/8 col-span-1 justify-center overflow-y-hidden">
        <div className="contenedor__columna h-full">

          <NoteForm />     {/* Formulario para ingresar infomacion a la DB */}

          <div className="contenedor__notas h-96 overflow-y-scroll py-2">
            {/*Visualizacion de la info de la DB*/}
            {notes.map((note) => (  // note.map() Esto recorreun arreglo y trabforma cada uno en uno nuevo por cafda nota 
              <div key={note.id} className="bg-slate-400 p-4 my-1"> {/*Se crea un div por cada nota */}
                <p className="small-text-responsive">  {format(new Date(note.createdAt), 'dd-MM-yyyy HH:mm')}</p> {/*se usa la libreria date-fns para darle formato a la fecha */}
                <h1 className="description-responsive">Título: {note.title}</h1>
                <p className="description-responsive" >Mensaje: {note.content}</p>
              </div>
            )
            )
            }
          </div>


        </div>
      </div>


    </main>
  );
}

export default HomePage;