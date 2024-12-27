"use client";

import { useContext, useEffect } from "react";
import NoteForm from "../components/noteform";
import { useNoteHook } from "../context/notecontext";


function HomePage() {
  //const notes= await loadNotes();

  const { notes, loadNotes } = useNoteHook(); //uso usecontext para traer NoteContext y asignarlo

  useEffect(() => { //Cuando cargue la pagina, carga loadNotes(Lo de los registros)
    loadNotes();
  } , [])


  return (
    <main className="flex min-h-screen flex-col " style={{
      backgroundImage: 'url(/fondo3.2.webp)', // Ruta de la imagen de fondo  

    }}  >
    <div className="flex items-center justify-center h-screen my">
      <div>
    
        <NoteForm />     {/* Formulario para ingresar infomacion a la DB */}
    
         
         {/*Visualizacion de la info de la DB*/}
          {notes.map((note) => (  // note.map() Esto recorreun arreglo y trabforma cada uno en uno nuevo por cafda nota 
            <div key={note.id} className="bg-slate-400 p-4 my-1"> {/*Se crea un div por cada nota */}
              <h1>{note.title}</h1>
              <p>{note.content}</p>
            </div>
          )
          )
          }
        </div>
      </div>
</main>
  );
}

export default HomePage;