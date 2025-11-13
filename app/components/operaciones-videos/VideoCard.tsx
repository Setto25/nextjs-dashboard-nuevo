
import React, { useState } from 'react';
import Image from 'next/image';


// 1. Definimos los tipos para las props
interface Video {  
    id: number;  
    titulo: string;  
    tipo: string  
    //url?: string;  
    rutaLocal?: string;  
    idYoutube?: string;
    idDailymotion?: string; // 1. Agregamos el ID de Dailymotion
    descripcion?: string;  
    duracion?: string;  
    categorias?: string;  
    fechaSubida: string;  
    miniatura?: string;  
    formato?: string;  
}  

interface VideoCardProps {
  video: Video;
}

const VideoCard: React.FC<VideoCardProps> = ({ video }) => {
  const [playVideo, setPlayVideo] = useState(false);

  // 2. Determinamos la plataforma y las URLs correspondientes
  const isYoutube = !!video.idYoutube;
  const isDailymotion = !!video.idDailymotion;

  let videoId: string | undefined;
  let thumbnailUrl: string | undefined;
  let embedUrl: string | undefined;

  if (isYoutube) {
    videoId = video.idYoutube;
    thumbnailUrl = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
    embedUrl = `https://www.youtube.com/embed/${videoId}?autoplay=1`; // autoplay=1 para iniciar
  } else if (isDailymotion) {
    videoId = video.idDailymotion;
    thumbnailUrl = `https://www.dailymotion.com/thumbnail/video/${videoId}`;
    embedUrl = `https://www.dailymotion.com/embed/video/${videoId}?autoplay=1`;
  }

  // Si no hay ID de ninguna plataforma, no renderizamos nada
  if (!videoId || !thumbnailUrl || !embedUrl) {
    return null;
  }

  return (
    <div className='bg-white rounded-lg overflow-hidden shadow-lg transition-transform hover:scale-105 p-4 w-full max-w-lg flex flex-col'>
      <h2 className="text-lg font-bold mb-2 truncate">{video.titulo}</h2>
      
      <div className="relative w-full h-0 pb-[56.25%]"> {/* 16:9 Aspect Ratio */}
        {playVideo ? (
          <iframe
            className="w-full h-full absolute top-0 left-0"
            src={embedUrl}
            title={video.titulo}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          ></iframe>
        ) : (
          <div onClick={() => setPlayVideo(true)} className="cursor-pointer absolute top-0 left-0 w-full h-full">
            <Image
              src={thumbnailUrl}
              alt={`Miniatura de ${video.titulo}`}
              layout="fill" // 'fill' hace que la imagen llene el contenedor padre
              objectFit="cover" // similar a object-cover en CSS
            />
            <div className="absolute inset-0 flex items-center justify-center">
                <svg className="w-16 h-16 text-white opacity-80" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M8 5v14l11-7z" />
                </svg>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default React.memo(VideoCard);