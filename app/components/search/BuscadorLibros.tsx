'use client';  


import { useEffect, useState } from "react";  
import '@/app/ui/global/containers.css';
import '@/app/ui/global/texts.css';
import DocxViewer from "../docx_viewer/docx_viewer";



// Interfaz de Libro  
interface Libro {  
    id: number;  
    titulo: string;  
    rutaLocal?: string;  
    descripcion?: string;  
    categorias?: string;  
    fechaSubida: string;  
    formato?: string;  
}  

function BuscadorLibrosAdmin() {  
    const [termino, setTermino] = useState('');  
    const [tipo, setTipo] = useState('todos');  
    const [libros, setLibros] = useState<Libro[]>([]);  
    const [cargando, setCargando] = useState(false);  
    const [error, setError] = useState<string | null>(null);  


      useEffect(() => {    // Se utiliza este useEfect para cargar todos lso docuemtnos cuando cargue la pagina
        const cargarManuales = async () => {  
          try {  
            const response = await fetch(`/api/books?tipo=todos`);  // Realiza busqueda por q(termino) y por tema (tipo)
            const data = await response.json();  
            console.log("LA RUTA", data)
       
            setLibros(data);  
            console.log("LOGA CARGA MANULAES", data)
          } catch (error) {  
            console.error('Error cargando libros', error);  
          } finally {  
            setCargando(false);  
          }  
        };  
    
    
        cargarManuales();  
      },[]);  


    const buscarLibros = async () => {  
        // Prevenir búsqueda vacía  
        if (!termino.trim()) return;  

        setCargando(true);  
        setError(null);  

        try {  
            const url = new URL('/api/books', window.location.origin);  
            url.searchParams.append('q', termino);  
            url.searchParams.append('tipo', tipo);  

            const response = await fetch(url.toString(), {  
                method: 'GET',  
                headers: {  
                    'Accept': 'application/json'  
                }  
            });  

            if (!response.ok) {  
                throw new Error(`Error: ${response.status}`);  
            }  

            const resultados: Libro[] = await response.json();  
            setLibros(resultados);  
        } catch (error) {  
            console.error("Error al buscar libros", error);  
            setError(error instanceof Error ? error.message : 'Error desconocido');  
            setLibros([]);  
        } finally {  
            setCargando(false);  
        }  
    }  

    const ambasBusquedas = () => {  
        buscarLibros();  
    };  


    return (  
        <div className="flex-container container-formulario-global bg-gray-100 p-6">  
                {/* Instrucciones para buscar libros */} 
                <div className="Instrucciones__registro container-formulario-parte1 p-10">  
    <ol className="container-listado">  
        {/* Paso 1: Buscar libros */}  
        <li className="bg-white p-4 rounded-md shadow-sm">  
            <h3 className="font-bold text-blue-600 mb-2">1. Buscar Libros.</h3>  
            <ul className="list-disc list-inside pl-4 space-y-1">  
                <li>Ingrese un término de búsqueda en el campo correspondiente.</li>  
                <li>Seleccione el tipo de búsqueda (por Título, Categorías, etc.).</li>  
                <li>Haga clic en el botón "Buscar" para obtener los resultados.</li>  
            </ul>  
        </li>   
    </ol>  
</div>
     

            {/* Formulario de búsqueda */}  
            <div className="Formulario__agregar conatiner-formulario-parte2 p-10"> 
                <form onSubmit={(e) => { e.preventDefault(); ambasBusquedas(); }} className="container-form">  
                    <div className="flex flex-col space-y-4">  
                        <div className="w-full">  
                            <input  
                                className="flex w-full p-2 border rounded"  
                                value={termino}  
                                onChange={(e) => setTermino(e.target.value)}  
                                placeholder="Ingrese el término a buscar"  
                            />  
                        </div>  
                        <div>  
                            <select  
                                value={tipo}  
                                onChange={(e) => setTipo(e.target.value)}  
                                className="p-2 border rounded w-full"  
                            >  
                                <option value="todos">Buscar en Todo</option>  
                                <option value="titulo">Por Título</option>  
                                <option value="categorias">Por Categorías</option>  
                                <option value="descripcion">Por Descripción</option>  
                            </select>  
                        </div>  
                    </div>  
                    <button  
                        type="submit"  
                        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mt-4 w-full"  
                    >  
                        Buscar  
                    </button>  
                </form>  
            </div>  

            {/* Resultados de búsqueda */}  
            <div className="resultados w-full mt-5">  
                <p className="subtitle-responsive p-2">Resultados:</p>  
                {error && <p style={{ color: 'red' }}>{error}</p>}  

                {cargando ? (  
                    <p>Buscando...</p>  
                ) : libros.length === 0 ? (  
                    <p>No se encontraron resultados.</p>  
                ) : (  
                    <>  
                        <div className="grid grid-cols-[repeat(auto-fit,minmax(350px,0.3fr))] gap-6 justify-center">  
                           
                      {libros.map((libro) => (  
                                           <div key={libro.id} className='bg-white rounded-lg overflow-hidden transition-transform hover:scale-105 border-4 p-2 container-sombra'>  
                                             <h2 className='subtitle2-responsive multi-line-ellipsis-title'>{libro.titulo}</h2>  
                                             <div className='documento__ p-2 bg-white '>  
                                 
                                               {libro.rutaLocal && (  
                                                 libro.rutaLocal.toLowerCase().endsWith('.docx') ? (  
                                                   <div className="w-full h-fit mt-2 aspect-[8.5/11] overflow-auto">  
                                                     <DocxViewer rutaLocal={libro.rutaLocal} /> 
                                                 
                                                    
                                                   </div>  
                                                 ) : (  
                                                   <iframe  
                                                     src={libro.rutaLocal}  
                                                     className="w-full h-fit mt-2 aspect-[8.5/11]"  
                                                     title={libro.titulo}  
                                       
                                 
                                                   />  
                                                 )
                                               )}  
                                 
                                             </div>  
                                             <div className='pt-4 px-2 space-y-2'>  
                                               <p className='contenedor__descripcion small-text-responsive  multi-line-ellipsis h-16'>  
                                                 <span className='font-bold'>Descripcion:</span> {libro.descripcion}  
                                               </p>  
                                             </div>  
                                             <div className='contenedor__centrador flex flex-row justify-center'>  
                                               <div className='contenedor__descarga font-bold small-text-responsive p-2 items-center bg-slate-300 m-2'>  
                                                 <a  
                                                   href={libro.rutaLocal}  
                                                   download={libro.titulo + ".pdf"}  
                                                   target="_blank"  
                                                   rel="noopener noreferrer"  
                                                 >  
                                                   Descargar  
                                                 </a>  
                                               </div>  
                                             </div>  
                                           </div>  
                                         ))}   
                        </div>  
                    </>  
                )}  
            </div>  
        </div>  
    );  
}  

export default BuscadorLibrosAdmin;