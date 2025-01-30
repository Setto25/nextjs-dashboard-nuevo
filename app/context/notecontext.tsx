"use client";


import { error } from "console";
import { createContext, useState, useContext } from "react"; //Se agrega useContext cuando se crea el hook useNoteHook

interface Note { //se crea esta "interface" para hacer un objeto donde se almacenen las variables y sus tipos y luego pasarlas.
  title: string,
  content: string
}



export const NoteContext = createContext<{
  notes: any[];
  loadNotes: () => Promise<void>; //Con esto se especifica que loasNotes no retornara nada, solo ejecuta algo
  CreateNote:(note:Note)=>Promise<void>;
}>({
  notes: [],  //Se define lo que hay en el cntexto, empieza vacio
  loadNotes: async () => { }, // tambien empieza vacio
  CreateNote: async(note:Note)=>{}
}); //Al create context se le puede dar un tipado para que en el sitio de implementacionse sepa que se va a pasar...({notes: any[]})



export const useNoteHook = () => { //Este hook va a aevitar que tenga que importar el contexto y el usecontest en cada archivo, entonces se usa useNoteHook(), en lugar de useContext(NoteContext)
  const context = useContext(NoteContext);
  if (!context){
    throw new Error('useNoteHook debe ser usado dentro de un NoteProvider')
  }
  return context;

}              //Se crea este hook para no estar importando a cada rato el useContext, esta funcion va aejecutar el useContext por uno

export const NotesProvider = ({ children }: { children: React.ReactNode }) => {

  //Aqui se crean los estados, siempre antes del return
  const [notes, setNotes] = useState<any[]>([]); //Estado para las notas (un arreglo de notas)


  
  //Carga notas desde la API
  async function loadNotes() {  //Se pasa esta funcion que antes estaba en page. esta permitira establecer data.
    const res1 = await fetch("/api/notes"); //Se caca localhost:3000, ya que esta parte estara del lado del cliente
    console.log(res1)
    const data = await res1.json();
    setNotes(data); //Esta parte tmb se cambia en lugar de return data
  }


  //Crea notas y la sguarda
  async function CreateNote(note: Note) {   
    console.log("🚀 CreateNote iniciado"); // Log al inicio  
    console.log("Nota recibida:", note);   // Ver qué nota se está creando  
  
    try {  
      console.log("🌐 Enviando fetch...");  
      const res2 = await fetch('/api/notes', {  
        method: 'POST',  
        body: JSON.stringify({note }),  // note va entre llaves porque es un objeto js que sera convertido a json
        headers: {  
          'Content-type': 'application/json'  
        }  
      });  

      console.log("🔍 Nota a enviar (stringify):", JSON.stringify({ note })); 
  
      console.log("✅ Respuesta recibida:", res2.status); // Ver código de estado  
  
      const newNote = await res2.json()

      console.log("📝 Nueva nota creada:", newNote);  
      
      setNotes([...notes, newNote]);  
      
      console.log("✨ Notas actualizadas:", notes);  

    } catch (error) {  
      
      console.error("❌ Error en CreateNote:", error);  
    }  
  } 

  //Aqui el arreglo notes , se pasara al valor del contexto (en {{}}) en el provider y de este a todo lo que este dentro de el(children)
  return <NoteContext.Provider value={{ notes, loadNotes, CreateNote }}>



    {children}



  </NoteContext.Provider>
}