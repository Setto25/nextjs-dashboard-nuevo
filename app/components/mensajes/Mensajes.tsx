import NoteForm from "@/app/components/noteform";
import { useNoteHook } from "@/app/context/notecontext";
import { useEffect, useState } from "react";






// Subcomponente para renderizar la imagen o alternar al enlace de texto en caso de error
const ImageMessage = ({ url }: { url: string }) => {
  const [hasError, setHasError] = useState(false);

  if (hasError) {
    return (
      <a href={url} target="_blank" rel="noopener noreferrer" className="text-emerald-800 hover:underline break-all text-sm font-semibold">
        {url}
      </a>
    );
  }

  return (
    <div className="my-2">
      <a 
        href={url} 
        target="_blank" 
        rel="noopener noreferrer" 
        title="Haga clic para ver la imagen completa en otra pestaña"
        className="inline-block hover:opacity-90 transition-opacity duration-200"
      >
        <img
          src={url}
          alt="Imagen adjunta"
          className="max-w-full h-auto rounded-md shadow-sm max-h-60 object-contain bg-slate-300 p-1 border border-slate-400 hover:shadow-md transition-shadow cursor-pointer"
          onError={() => setHasError(true)}
        />
      </a>
    </div>
  );
};

// Componente para detectar y renderizar URLs de texto o imágenes
export const RenderContent = ({ content }: { content: string }) => {
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  const parts = content.split(urlRegex);

  return (
    <>
      {parts.map((part, index) => {
        if (part.match(urlRegex)) {
          const pathPart = part.split('?')[0];
          const hasImageExtension = /\.(jpeg|jpg|gif|png|webp|svg)$/i.test(pathPart);
          const hasImageParams = /view=fimg|disp=emb|thumbnail|export=view|export=download|format=(png|jpg|jpeg|webp)/i.test(part);

          const isImage = hasImageExtension || hasImageParams;

          if (isImage) {
            return <ImageMessage key={index} url={part} />;
          }
          return (
            <a key={index} href={part} target="_blank" rel="noopener noreferrer" className="text-emerald-800 hover:underline break-all">
              {part}
            </a>
          );
        }
        return <span key={index}>{part}</span>;
      })}
    </>
  );
};

export default function Mensajes() {  
    // Extraer el valor dentro del cuerpo del componente  
    

      const { notes, loadNotes } = useNoteHook(); //uso usecontext para traer NoteContext y asignarlo
        const [cargando, setCargando] = useState(false)
    
      useEffect(() => { //Cuando cargue la pagina, carga loadNotes(Lo de los registros)
        loadNotes();
      }, [])

            const eliminarMensaje = async (id: number) => {
   // setCargando(true)
    try {
      const url = `/api/notes/${id}`
      const response = await fetch(url, {
        method: 'DELETE',
        headers: {
          'Accept': 'application/json'
        }
      })

      if (!response.ok) {
        throw new Error('Error al eliminar el mensaje')
      }
      //setLibros(prev => prev.filter(libro => libro.id !== id))
          // Volver a cargar las notas:
    await loadNotes();
    } catch (error) {
      console.error('Error al eliminar archivo', error)
      //setError(error instanceof Error ? error.message : 'Error desconocido')
    } finally {
      //setCargando(false)
    }
  }


    return (  
        <div className="contenedor__formulario flex flex-wrap h-96 w-full col-span-1 joverflow-y-hidden justify-start px-10">
        <p className="subtitle-responsive ">Novedades:  </p>
        <div className="contenedor__columna w-full h-full items-start">

          <NoteForm />     {/* Formulario para ingresar infomacion a la DB */}

          <div className="contenedor__notas h-96 overflow-y-scroll py-2">
            {/*Visualizacion de la info de la DB*/}
            {notes.map((note) => (  // note.map() Esto recorreun arreglo y trabforma cada uno en uno nuevo por cafda nota 
              <div key={note.id} className="bg-slate-400 p-4 my-1"> {/*Se crea un div por cada nota */}
                <p className="small-text-responsive font-bold">  {note.createdAt}</p> {/*se usa la libreria date-fns para darle formato a la fecha */}
                <h1 className="description-responsive font-bold">Título: {note.title}</h1>
                <div className="description-responsive" >Mensaje: <RenderContent content={note.content} /></div>


                 
                              <button
                                                  className='bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-3 rounded ml-2'
                                                  onClick={() => {
                                                    eliminarMensaje(note.id)
                                                  }}
                                                >
                                                  Eliminar
                                                </button>
                     
              </div>
              
            )
            )
            
            }
         
          </div>
            

        </div>
      </div>

    );  
}  
