'use client';

import { Documento } from "@prisma/client";
import { useState } from "react";



/*
Este archivo contiene la funcion que permite buscar videos en la base de datos, mediante el uso de un input y un boton, que almacena el valor ingresado en el input y lo busca en la base de datos, mostrando los resultados en la misma pagina

*/

// Interfaz de Video  
interface Video {
    id: number;
    titulo: string;
    tema: string;
    tipo:string
    url?: string;
    rutaLocal?: string;
    descripcion?: string;
    duracion?: string;
    categorias?: string;
    fechaSubida: string;
    miniatura?: string;
    formato?: string;
}

// Interfaz de documento  
interface Video {
    id: number;
    titulo: string;
    tema: string;
    tipo:string
    rutaLocal?: string;
    descripcion?: string;
    duracion?: string;
    categorias?: string;
    fechaSubida: string;
    formato?: string;
}

function PaginaBusqueda() {
    const [termino, setTermino] = useState('');
    const [tipo, setTipo] = useState('todos');
    const [videos, setVideos] = useState<Video[]>([]);
    const [documentos, setDocumentos] = useState<Documento[]>([]);
    const [cargando, setCargando] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const buscarVideos = async () => {
        // Prevenir búsqueda vacía  
        if (!termino.trim()) return;

        setCargando(true);
        setError(null);

        try {
            // Construir URL de manera segura  
            const url = new URL('/api/videos', window.location.origin);
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

            const resultados: Video[] = await response.json();
            setVideos(resultados);
        } catch (error) {
            console.error("Error al buscar videos", error);
            setError(error instanceof Error ? error.message : 'Error desconocido');
            setVideos([]);
        } finally {
            setCargando(false);
        }
    }


    const buscarDocumentos = async () => {
        // Prevenir búsqueda vacía  
        if (!termino.trim()) return;

        setCargando(true);
        setError(null);

        try {
            // Construir URL de manera segura  
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
        buscarVideos();
        buscarDocumentos();
    };


    /* Validaciones */

    

    return (
        <div className="contenedor__busquedas container ">
            <div className="container flex   py-2 place-items-center justify-center">
                <div className="w-full">
                    <input
                    className="flex w-full"
                        value={termino}
                        onChange={(e) => setTermino(e.target.value)}
                        placeholder="Ingrese el término a buscar"
                    />
                </div>

                <div>
                    <select
                        value={tipo}
                        onChange={(e) => setTipo(e.target.value)}
                    >
                        <option value="todos">Buscar en Todo</option>
                        <option value="titulo">Por Título</option>
                        <option value="categorias">Por Categorías</option>
                        <option value="descripcion">Por Descripción</option>
                    </select>
                </div>

                

                <div>
                    <button
                    className="bg-blue-500 hover:bg-blue-700 text-white font-bold ml-2 py-2 px-4 rounded disabled:opacity-20"
                        onClick={ambasBusquedas}
                        disabled={!termino.trim()}
                    >
                        Buscar
                    </button>
                </div>
            </div>

            <div className="resultados__ col-span-1 w-full h-96 overflow-y-scroll mt-5"> 
                {error && <p style={{ color: 'red' }}>{error}</p>}

                {cargando ? (
                    <p>Buscando...</p>
                ) : videos.length === 0 && documentos.length === 0 ? (
                    <p>No se encontraron resultados</p>
                ) : (

                   <> 
             {       videos.map((video) => (
                        <div className="resultados bg-gray-100 p-4 my-1 "
                         key={video.id}>
                            <h3>{video.titulo}</h3>
                            <p>{video.descripcion}</p>
                            <p>Categorías: {video.categorias}</p>
                            <a href={video.rutaLocal} target="_blank" rel="noopener noreferrer">
                                Ver Video
                            </a>
                        </div>
                    ))}
                    
            {        documentos.map((documento) => (
                        <div className="resultados bg-gray-100 p-4 my-1"
                         key={documento.id}>
                            <h3>{documento.titulo}</h3>
                            <p>{documento.descripcion}</p>
                            <p>Categorías: {documento.categorias}</p>
                            <a href={documento.rutaLocal ?? '#'} target="_blank" rel="noopener noreferrer">
                                Descargar
                            </a>
                        </div>
                    ))}
                    </>

                )}
            </div>
        </div>
    );
}

export default PaginaBusqueda;