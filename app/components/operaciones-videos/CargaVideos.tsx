'use client';  

import {useValueMenuSeleccionadoStore, useValueStore} from '@/app/store/store';
import { useState, useEffect } from 'react';  
import '@/app/ui/global/containers.css'
import '@/app/ui/global/shadows.css'
import '@/app/ui/global/docx.css'
import '@/app/ui/global/texts.css'



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



function PaginaVideos() {  
    const [videos, setVideos] = useState<Video[]>([]);  
    const [cargando, setCargando] = useState(true);  

    //const {nuevoValor} = useValueStore();  // Store con los valores de indica de pestañas
    const {menuSeleccionado} = useValueMenuSeleccionadoStore();  

    console.log('El valor de menuSeleccionado es:', menuSeleccionado);  // Verificar el valor de nuevoValor
  

    useEffect(() => {  
        async function cargarVideos() {  
            try {  
                const response = await fetch(`/api/videos?q=${menuSeleccionado}&tipo=tema`);  
                const data = await response.json();  
                     console.log('EL DATA VIDEO ES:', data);     
                setVideos(data);  
            } catch (error) {  
                console.error('Error cargando videos', error);  
            } finally {  
                setCargando(false);  
            }  
        }  

        cargarVideos();  // Llamar a la función para cargar los videos
    }, [menuSeleccionado]);  // Esro hace que el efecto se ejecute cada vez que el valor de nuevoValor cambie

  console.log('El valor de menuSeleccionadoooo VIDEOes:', videos);  // Verificar el valor de nuevoValor

    if (cargando) return (  
        <div className="flex justify-center items-center h-64">  
            <p className="text-xl text-gray-600">Cargando videos...</p>  
        </div>  
    );  

    return (  
        <div className="container mx-auto px-4 py-6">  
            <h1 className="subtitle-responsive py-4'">Contenido:</h1>

            {videos.length === 0 && menuSeleccionado==="Vacio" ? (  
                <div className="text-center text-gray-600 bg-white   border-2 p-4 rounded-lg container-sombra-4lados">  
                    <p className='title-responsive'>¡Bienvenido a la sección de capacitación! </p>
                    <p className="subtitle-responsive">                        
                        Aquí podrás explorar una amplia colección de contenido organizado por categorías y temas. Navega por las pestañas para seleccionar una categoría, expande los temas disponibles y encuentra los videos que necesitas para tu aprendizaje. Recuerda que este contenido está en constante desarrollo, así que mantente atento a las actualizaciones. ¡Disfruta del contenido que hemos preparado para ti!</p>
                </div>  
            ) : null}  

            {/* Mostrar videos */}
            
            {videos.length === 0 && menuSeleccionado!="Vacio"  ? (  
                <div className="text-center text-gray-600">  
                    No hay videos disponibles para este tema.  
                </div>  
            ) : (  
                <div className="grid grid-cols-[repeat(auto-fit,minmax(400px,1fr))] gap-6 w-full justify-center ">  
                    {videos.map((video) => (  
                        <div   
                            key={video.id}  
                            className='bg-white rounded-lg overflow-hidden transition-transform hover:scale-105 border-4 p-2 container-sombra'  
                        >  
                           <h2 className="subtitle2-responsive multi-line-ellipsis-title">{video.titulo}</h2>  
                            {/* Miniatura o reproductor condicional */}  
                            { video.rutaLocal ? (  
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