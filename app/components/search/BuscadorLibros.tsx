'use client';  


import { useState } from "react";  
import '@/app/ui/global/containers.css';



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
            <div className="resultados w-1/2 mt-5">  
                <p className="subtitle2-responsive">Resultados:</p>  
                {error && <p style={{ color: 'red' }}>{error}</p>}  

                {cargando ? (  
                    <p>Buscando...</p>  
                ) : libros.length === 0 ? (  
                    <p>No se encontraron resultados.</p>  
                ) : (  
                    <>  
                        <div className="h-96 overflow-y-scroll">  
                           
                            {libros.map((libro) => (  
                                <div className="resultados bg-white p-4 my-1 flex justify-between items-center" key={libro.id}>  
                                    <div>  
                                        <h3 className="font-bold">{libro.titulo}</h3>  
                                        <p>{libro.descripcion}</p>  
                                        <p>Categorías: {libro.categorias}</p>  
                                        <a href={libro.rutaLocal ?? '#'} target="_blank" rel="noopener noreferrer">  
                                            Descargar  
                                        </a>  
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