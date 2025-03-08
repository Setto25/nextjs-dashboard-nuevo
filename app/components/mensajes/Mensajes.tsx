import NoteForm from "@/app/components/noteform";
import { useNoteHook } from "@/app/context/notecontext";
import { useEffect } from "react";






export default function Mensajes() {  
    // Extraer el valor dentro del cuerpo del componente  
    

      const { notes, loadNotes } = useNoteHook(); //uso usecontext para traer NoteContext y asignarlo
    
      useEffect(() => { //Cuando cargue la pagina, carga loadNotes(Lo de los registros)
        loadNotes();
      }, [])

    return (  
        <div className="contenedor__formulario flex flex-wrap h-96 w-full col-span-1 joverflow-y-hidden justify-start px-10">
        <p className="subtitle-responsive ">Novedades:  </p>
        <div className="contenedor__columna w-full h-full items-start">

          <NoteForm />     {/* Formulario para ingresar infomacion a la DB */}

          <div className="contenedor__notas h-96 overflow-y-scroll py-2">
            {/*Visualizacion de la info de la DB*/}
            {notes.map((note) => (  // note.map() Esto recorreun arreglo y trabforma cada uno en uno nuevo por cafda nota 
              <div key={note.id} className="bg-slate-400 p-4 my-1"> {/*Se crea un div por cada nota */}
                <p className="small-text-responsive">  {note.createdAt}</p> {/*se usa la libreria date-fns para darle formato a la fecha */}
                <h1 className="description-responsive">Título: {note.title}</h1>
                <p className="description-responsive" >Mensaje: {note.content}</p>
              </div>
            )
            )
            }
         
          </div>

        </div>
      </div>

    );  
}  
