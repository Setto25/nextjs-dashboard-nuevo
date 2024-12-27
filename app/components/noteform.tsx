"use client";

import { useState } from "react";
import { POST } from "../api/notes/route";
import { useRouter } from "next/router";
import { useNoteHook } from "../context/notecontext";

//import { useNoteHook } from "@/context/";


export default function NoteForm() {
    const [title, setTitle] = useState(""); // se crean las variables para title y content con un string vacio
    const [content, setContent] = useState("");
    const { CreateNote} = useNoteHook();// Se declara y asigna el context que se va a usar, permite acceder a los valores definidos en un context
//  const { CreateNote } = useContext(NoteContext); linea antes de crear el useNoteHook

    return (
        <form onSubmit={async (e) => {
            e.preventDefault(); /*Los formularios reinician la pagina, por lo que se ejecuta el prventDefaul para que no ocurra*/

            await CreateNote(
                {
                    title,
                    content
                }
            );  //Se pasa esta funcion desde el context, que debe recibir titulo y conten

            console.log(title);
            console.log(content);

        }
        }
        >
            <input type="text"  //Cuadro de titulo
                name="title"
                autoFocus placeholder="Title"
                className="w-full px-4 py-2 text-black bg-white rounded-md focus:online-none focus:ring-2 focus:ring-blue-600 my-2"
                onChange={(e) => setTitle(e.target.value)}     // e= evento, es arbitrario el nombre / cuando se escriba en el input, el valor que reciba se almacene en el titulo y se establecera en el e.tar...
            />

            <textarea  //Cuadro de Contenido
                name="text"
                placeholder="Content"
                className="w-full px-4 py-2 text-black bg-white rounded-md focus:online-none focus:ring-2 focus:ring-blue-600 my-2"
                onChange={(e) => setContent(e.target.value)}
            ></textarea>

            <button
                className="px-5 py-2 text-white bg-blue-600 bg rounded-md hover:bg-blue-700">
                Create
            </button>


        </form>


    );
}