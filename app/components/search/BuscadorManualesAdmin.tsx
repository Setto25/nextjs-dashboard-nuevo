'use client'; 


import { useState } from "react";  
import '@/app/ui/global/containers.css';




// Interfaz de Manual  
interface Manual {  
    id: number;  
    titulo: string;  
    rutaLocal?: string;  
    descripcion?: string;  
    categorias?: string;  
    fechaSubida: string;  
    formato?: string;  
}  

function BuscadorManualesAdmin() {  
    const [termino, setTermino] = useState('');  
    const [tipo, setTipo] = useState('todos');  
    const [manuales, setManuales] = useState<Manual[]>([]);  
    const [cargando, setCargando] = useState(false);  
    const [error, setError] = useState<string | null>(null);  


    const buscarManuales = async () => {  
        // Prevenir búsqueda vacía  
        if (!termino.trim()) return;  

        setCargando(true);  
        setError(null);  

        try {  
            const url = new URL('/api/manuals', window.location.origin);  
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

            const resultados: Manual[] = await response.json();  
            setManuales(resultados);  
        } catch (error) {  
            console.error("Error al buscar manuales", error);  
            setError(error instanceof Error ? error.message : 'Error desconocido');  
            setManuales([]);  
        } finally {  
            setCargando(false);  
        }  
    }  

    const ambasBusquedas = () => {  
        buscarManuales();  
    };  

    const eliminarArchivo = async (id: number, tipo: 'manual') => {  
        setCargando(true);  
        try {  
            const url =  `/api/manuals/${id}`;  
            const response = await fetch(url, {  
                method: 'DELETE',  
                headers: {  
                    'Accept': 'application/json'  
                }  
            });  

            if (!response.ok) {  
                throw new Error(`Error al eliminar ${tipo}: ${response.status}`);  
            }  

   
         setManuales(prev => prev.filter(manual => manual.id !== id));  
            
        } catch (error) {  
            console.error("Error al eliminar archivo", error);  
            setError(error instanceof Error ? error.message : 'Error desconocido');  
        } finally {  
            setCargando(false);  
        }  
    };  

    return (  
        <div className="flex-container container-formulario-global bg-gray-100 p-6">  
                {/* Instrucciones para buscar manuales */} 
                <div className="Instrucciones__registro container-formulario-parte1 p-10">  
    <ol className="container-listado">  
        {/* Paso 1: Buscar manuales */}  
        <li className="bg-white p-4 rounded-md shadow-sm">  
            <h3 className="font-bold text-blue-600 mb-2">1. Buscar Manuales.</h3>  
            <ul className="list-disc list-inside pl-4 space-y-1">  
                <li>Ingrese un término de búsqueda en el campo correspondiente.</li>  
                <li>Seleccione el tipo de búsqueda (por Título, Categorías, etc.).</li>  
                <li>Haga clic en el botón "Buscar" para obtener los resultados.</li>  
            </ul>  
        </li>  
        {/* Paso 2: Eliminar doscumentos */}  
        <li className="bg-white p-4 rounded-md shadow-sm">  
            <h3 className="font-bold text-blue-600 mb-2">2. Eliminar Manuales.</h3>  
            <ul className="list-disc list-inside pl-4 space-y-1">  
                <li>Para eliminar un manual, haga clic en el botón "Eliminar".</li>  
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
                ) : manuales.length === 0 ? (  
                    <p>No se encontraron resultados.</p>  
                ) : (  
                    <>  
                        <div className="h-96 overflow-y-scroll">  
                           
                            {manuales.map((manual) => (  
                                <div className="resultados bg-white p-4 my-1 flex justify-between items-center" key={manual.id}>  
                                    <div>  
                                        <h3 className="font-bold">{manual.titulo}</h3>  
                                        <p>{manual.descripcion}</p>  
                                        <p>Categorías: {manual.categorias}</p>  
                                        <a href={manual.rutaLocal ?? '#'} target="_blank" rel="noopener noreferrer">  
                                            Descargar  
                                        </a>  
                                    </div>  
                                    <button  
                                        className="bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-3 rounded ml-2"  
                                        onClick={() => eliminarArchivo(manual.id, 'manual')}  
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

export default BuscadorManualesAdmin;