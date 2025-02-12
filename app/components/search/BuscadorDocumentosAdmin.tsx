'use client';  


import { useState } from "react";  
import '@/app/ui/global/containers.css';

/*  
Este archivo contiene la función que permite buscar videos en la base de datos, mediante el uso de un input y un botón,  
que almacena el valor ingresado en el input y lo busca en la base de datos, mostrando los resultados en la misma página  
*/  

// Interfaz de Video  


// Interfaz de Documento  
interface Documento {  
    id: number;  
    titulo: string;  
    rutaLocal?: string;  
    descripcion?: string;  
    categorias?: string;  
    fechaSubida: string;  
    formato?: string;  
}  

function BuscadorDocmuentosAdmin() {  
    const [termino, setTermino] = useState('');  
    const [tipo, setTipo] = useState('todos');  
    const [documentos, setDocumentos] = useState<Documento[]>([]);  
    const [cargando, setCargando] = useState(false);  
    const [error, setError] = useState<string | null>(null);  


    const buscarDocumentos = async () => {  
        // Prevenir búsqueda vacía  
        if (!termino.trim()) return;  

        setCargando(true);  
        setError(null);  

        try {  
            const url = new URL('/api/documents', window.location.origin);  
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

            const resultados: Documento[] = await response.json();  
            setDocumentos(resultados);  
        } catch (error) {  
            console.error("Error al buscar documentos", error);  
            setError(error instanceof Error ? error.message : 'Error desconocido');  
            setDocumentos([]);  
        } finally {  
            setCargando(false);  
        }  
    }  

    const ambasBusquedas = () => {  
        buscarDocumentos();  
    };  

    const eliminarArchivo = async (id: number, tipo: 'video' | 'documento') => {  
        setCargando(true);  
        try {  
            const url = tipo === 'video' ? `/api/videos/${id}` : `/api/documents/${id}`;  
            const response = await fetch(url, {  
                method: 'DELETE',  
                headers: {  
                    'Accept': 'application/json'  
                }  
            });  

            if (!response.ok) {  
                throw new Error(`Error al eliminar ${tipo}: ${response.status}`);  
            }  

   
         setDocumentos(prev => prev.filter(documento => documento.id !== id));  
            
        } catch (error) {  
            console.error("Error al eliminar archivo", error);  
            setError(error instanceof Error ? error.message : 'Error desconocido');  
        } finally {  
            setCargando(false);  
        }  
    };  

    return (  
        <div className="flex-container container-formulario-global bg-gray-100 p-6">  
                {/* Instrucciones para buscar videos y documentos */} 
                <div className="Instrucciones__registro container-formulario-parte1 p-10">  
    <ol className="container-listado">  
        {/* Paso 1: Buscar videos */}  
        <li className="bg-white p-4 rounded-md shadow-sm">  
            <h3 className="font-bold text-blue-600 mb-2">1. Buscar Documentos.</h3>  
            <ul className="list-disc list-inside pl-4 space-y-1">  
                <li>Ingrese un término de búsqueda en el campo correspondiente.</li>  
                <li>Seleccione el tipo de búsqueda (por Título, Categorías, etc.).</li>  
                <li>Haga clic en el botón "Buscar" para obtener los resultados.</li>  
            </ul>  
        </li>  
        {/* Paso 2: Eliminar videos */}  
        <li className="bg-white p-4 rounded-md shadow-sm">  
            <h3 className="font-bold text-blue-600 mb-2">2. Eliminar Documentos.</h3>  
            <ul className="list-disc list-inside pl-4 space-y-1">  
                <li>Para eliminar un documento, haga clic en el botón "Eliminar".</li>  
                <li>Confirme la acción en el mensaje que aparece.</li>  
                <li>Recuerde que la eliminación es irreversible.</li>  
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
                ) : documentos.length === 0 ? (  
                    <p>No se encontraron resultados.</p>  
                ) : (  
                    <>  
                        <div className="h-96 overflow-y-scroll">  
                           
                            {documentos.map((documento) => (  
                                <div className="resultados bg-white p-4 my-1 flex justify-between items-center" key={documento.id}>  
                                    <div>  
                                        <h3 className="font-bold">{documento.titulo}</h3>  
                                        <p>{documento.descripcion}</p>  
                                        <p>Categorías: {documento.categorias}</p>  
                                        <a href={documento.rutaLocal ?? '#'} target="_blank" rel="noopener noreferrer">  
                                            Descargar  
                                        </a>  
                                    </div>  
                                    <button  
                                        className="bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-3 rounded ml-2"  
                                        onClick={() => eliminarArchivo(documento.id, 'documento')}  
                                    >  
                                        Eliminar  
                                    </button>  
                                </div>  
                            ))}  
                        </div>  
                    </>  
                )}  
            </div>  
        </div>  
    );  
}  

export default BuscadorDocmuentosAdmin;