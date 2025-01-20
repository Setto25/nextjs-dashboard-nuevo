'use client';  

import useValueStore from '@/app/store/store';
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

function PaginaVideosTema() {  
    const [videos, setVideos] = useState<Video[]>([]);  
    const [cargando, setCargando] = useState(true);  

    const nuevoValor = useValueStore();  

    useEffect(() => {  
        async function cargarVideos() {  
            try {  
                const response = await fetch(`/api/videos?tema=${nuevoValor}`);  
                const data = await response.json();  
                setVideos(data);  
            } catch (error) {  
                console.error('Error cargando videos', error);  
            } finally {  
                setCargando(false);  
            }  
        }  

        cargarVideos();  
    }, [nuevoValor]);  

    if (cargando) return (  
        <div className="flex justify-center items-center h-64">  
            <p className="text-xl text-gray-600">Cargando videos...</p>  
        </div>  
    );  

    return (  
        <div className="container mx-auto px-4 py-6">  
            <h1 className="text-2xl font-bold mb-6 text-gray-800">Videos de {/*nuevoValor*/}:</h1>  
            
            {videos.length === 0 ? (  
                <div className="text-center text-gray-600">  
                    No hay videos disponibles para este tema.  
                </div>  
            ) : (  
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">  
                    {videos.map((video) => (  
                        <div   
                            key={video.id}  
                            className='bg-white shadow-md rounded-lg overflow-hidden transition-transform hover:scale-105'  
                        >  
                            {/* Miniatura o reproductor condicional */}  
                            {video.tipo === 'YOUTUBE' && video.url ? (  
                                <iframe   
                                    src={`https://www.youtube.com/embed/${getYouTubeId(video.url)}`}  
                                    className="w-full h-48 object-cover"  
                                    allowFullScreen  
                                />  
                            ) : video.rutaLocal ? (  
                                <video   
                                    src={video.rutaLocal}   
                                    className="w-full h-48 object-cover"  
                                    controls  
                                />  
                            ) : (  
                                <div className="bg-gray-200 h-48 flex items-center justify-center">  
                                    Sin vista previa  
                                </div>  
                            )}  

                            <div className="p-4">  
                                <h2 className="font-bold text-lg mb-2 text-gray-800">{video.titulo}</h2>  
                                <p className="text-gray-600 text-sm mb-4 line-clamp-2">{video.descripcion}</p>  
                                
                                <div className="flex justify-between items-center">  
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

export default PaginaVideosTema;