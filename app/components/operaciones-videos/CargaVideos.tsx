'use client';  

import {useValueStore} from '@/app/store/store';
import { useState, useEffect } from 'react';  



interface Video {  
    id: number;  
    titulo: string;  
    tipo: string  
    url?: string;  
    rutaLocal?: string;  
    descripcion?: string;  
    duracion?: string;  
    categorias?: string;  
    fechaSubida: string;  
    miniatura?: string;  
    formato?: string;  
}  



const selectTema = (seleccion: number) => {
    switch (seleccion) {
        case 0:
            return "reanimacion"; // Reanimación Neonatal
        case 1:
            return "cuidados_basicos"; // Cuidados Básicos Neonatales
        case 2:
            return "ventilacion_mecanica"; // Ventilación Mecánica
        case 3:
            return "administracion_medicamentos"; // Administración de Medicamentos
        case 4:
            return "instalacion_picc"; // Instalación de PICC
        case 5:
            return "lavado_manos"; // Lavado de Manos
        case 6:
            return "iass"; // IASS
        case 7:
            return "drenaje_pleural"; // Drenaje Pleural
        default:
            return "pagina no seleccionada"; // Mensaje por defecto si el índice no coincide
    }
}

function PaginaVideos() {  
    const [videos, setVideos] = useState<Video[]>([]);  
    const [cargando, setCargando] = useState(true);  

    const {nuevoValor} = useValueStore();  // Store con los valores de indica de pestañas

    useEffect(() => {  
        async function cargarVideos() {  
            try {  
                const response = await fetch(`/api/videos?q=${selectTema(nuevoValor)}&tipo=tema`);  
                const data = await response.json();  
                setVideos(data);  
            } catch (error) {  
                console.error('Error cargando videos', error);  
            } finally {  
                setCargando(false);  
            }  
        }  

        cargarVideos();  // Llamar a la función para cargar los videos
    }, [nuevoValor]);  // Esro hace que el efecto se ejecute cada vez que el valor de nuevoValor cambie

    if (cargando) return (  
        <div className="flex justify-center items-center h-64">  
            <p className="text-xl text-gray-600">Cargando videos...</p>  
        </div>  
    );  

    return (  
        <div className="container mx-auto px-4 py-6">  
            <h1 className="subtitle-responsive py-4">Videos disponibles:</h1>
            
            {videos.length === 0 ? (  
                <div className="text-center text-gray-600">  
                    No hay videos disponibles para este tema.  
                </div>  
            ) : (  
                <div className="grid grid-cols-[repeat(auto-fit,minmax(400px,1fr))] gap-6 w-fit ">  
                    {videos.map((video) => (  
                        <div   
                            key={video.id}  
                            className='bg-white rounded-lg overflow-hidden transition-transform hover:scale-105 border-4 p-2 container-sombra'  
                        >  
                           <h2 className="subtitle2-responsive multi-line-ellipsis-title">{video.titulo}</h2>  
                            {/* Miniatura o reproductor condicional */}  
                            {video.tipo === 'YOUTUBE' && video.url ? (  
                                <iframe   
                                    src={`https://www.youtube.com/embed/${getYouTubeId(video.url)}`}  
                                    className="w-full object-cover aspect-video"  
                                    allowFullScreen  
                                />  
                            ) : video.rutaLocal ? (  
                                <video   
                                    src={video.rutaLocal}   
                                    className="object-cover aspect-video"  
                                    controls  
                                />  
                            ) : (  
                                <div className="bg-gray-200 h-48 flex items-center justify-center">  
                                    Sin vista previa  
                                </div>  
                            )}  

                            <div className="pt-4 px-2">  
                             
                                <p className="small-text-responsive  multi-line-ellipsis h-16">
                                <span className='font-bold'>Descripcion: </span>{video.descripcion}</p>  
                                
                                <div className="flex justify-between pt-4 ">  
                                    <span className="text-xs text-gray-500">  
                                        {new Date(video.fechaSubida).toLocaleDateString()}  
                                    </span>  
                                    <span className="text-xs text-blue-600 bg-blue-100 px-2 py-1 rounded">  
                                        {video.tipo}  
                                    </span>  
                                </div>  
                            </div>  
                        </div>  
                    ))}  
                </div>  
            )}  
        </div>  
    );  
}  

// Función auxiliar para extraer ID de YouTube  
function getYouTubeId(url: string) {  
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;  
    const match = url.match(regExp);  
    return (match && match[2].length === 11) ? match[2] : null;  
}  

export default PaginaVideos;