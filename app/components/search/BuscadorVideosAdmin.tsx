'use client'

import { useEffect, useState } from "react";
import '@/app/ui/global/containers.css';
import { useUploadStore } from "@/app/store/store";

// Interfaz de Video  
interface Video {
  id: number;
  titulo: string;
  tema: string;
  tipo: string;
  //url?: string;
 // rutaLocal?: string;
  idYoutube?: string;
  idDailymotion?: string;
  descripcion?: string;
  duracion?: string;
  categorias?: string;
  fechaSubida: string;
  miniatura?: string;
  formato?: string;
}

function PaginaBusqueda() {
  const actualizarVideos = useUploadStore((state) => state.actualizarUpload);
  const [termino, setTermino] = useState('');
  const [tipo, setTipo] = useState('todos');
  const [videos, setVideos] = useState<Video[]>([]);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function cargarVideos() {
      try {
        setCargando(true);
        const response = await fetch('/api/videos');
        const data = await response.json();
        setVideos(data);
      } catch (error) {
        console.error('Error cargando videos', error);
      } finally {
        setCargando(false);
      }
    }
    cargarVideos();
  }, [actualizarVideos]);

  const buscarVideos = async () => {
    if (!termino.trim()) return;

    setCargando(true);
    setError(null);

    try {
      const url = new URL('/api/videos', window.location.origin);
      url.searchParams.append('q', termino);
      url.searchParams.append('tipo', tipo);

      const response = await fetch(url.toString(), {
        method: 'GET',
        headers: { 'Accept': 'application/json' }
      });

      if (!response.ok) throw new Error(`Error: ${response.status}`);

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

  const ambasBusquedas = () => {
    buscarVideos();
  };

  const eliminarArchivo = async (id: number, tipo: 'video' | 'documento') => {
    setCargando(true);
    try {
      const url = tipo === 'video' ? `/api/videos/${id}` : `/api/documents/${id}`;
      const response = await fetch(url, {
        method: 'DELETE',
        headers: { 'Accept': 'application/json' }
      });

      if (!response.ok) throw new Error(`Error al eliminar ${tipo}: ${response.status}`);

      setVideos(prev => prev.filter(video => video.id !== id));
    } catch (error) {
      console.error("Error al eliminar archivo", error);
      setError(error instanceof Error ? error.message : 'Error desconocido');
    } finally {
      setCargando(false);
    }
  };

  const limpiarArchivos = async () => {
    setCargando(true);
    try {
      const response = await fetch('/api/delete-contenido-gestion', {
        method: 'POST',
        headers: { 'Accept': 'application/json' }
      });

      if (!response.ok) throw new Error(`Error al limpiar archivos: ${response.status}`);

      setVideos([]);
      await buscarVideos();
    } catch (error) {
      console.error("Error al limpiar archivos", error);
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
          <li className="bg-white p-4 rounded-md shadow-sm">
            <h3 className="font-bold text-emerald-600 mb-2">1. Buscar Videos.</h3>
            <ul className="list-disc list-inside pl-4 space-y-1">
              <li>Ingrese un término de búsqueda en el campo correspondiente.</li>
              <li>Seleccione el tipo de búsqueda (por Título, Categorías, etc.).</li>
              <li>Haga clic en el botón "Buscar" para obtener los resultados.</li>
            </ul>
          </li>
          <li className="bg-white p-4 rounded-md shadow-sm mt-4">
            <h3 className="font-bold text-emerald-600 mb-2">2. Eliminar Videos.</h3>
            <ul className="list-disc list-inside pl-4 space-y-1">
              <li>Para eliminar un video, haga clic en el botón "Eliminar".</li>
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
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2 px-4 rounded mt-4 w-full"
          >
            Buscar
          </button>
        </form>
      </div>

      {/* Resultados de búsqueda */}
      <div className="resultados w-1/2 mt-5">
        <p className="subtitle2-responsive">Videos disponibles:</p>
        {error && <p style={{ color: 'red' }}>{error}</p>}

        {cargando ? (
          <p>Buscando...</p>
        ) : videos.length === 0 ? (
          <p>No se encontraron resultados.</p>
        ) : (
          <div className="h-96 overflow-y-scroll space-y-2">
            {videos.map((video) => {
              const videoYt = video.idYoutube ? video.idYoutube : null;''
              const videoDm = video.idDailymotion ? video.idDailymotion : null;
              {let urlVideo = '';
              if (videoYt) {
                urlVideo = `https://www.youtube.com/watch?v=${videoYt}`;
              } else if (videoDm) {
                urlVideo = `https://www.dailymotion.com/video/${videoDm}`;
              } else {
                urlVideo = '#';
              }
              return (
                <div
                  key={video.id}
                  className="resultados bg-white p-4 my-1 flex justify-between items-center border border-gray-300 rounded"
                >
                  <div>
                    <h3 className="font-bold">{video.titulo}</h3>
                    <p>{video.tema}</p>
                    <p>{video.descripcion}</p>
                    <p>Categorías: {video.categorias}</p>
                    <div className="flex space-x-8 mt-1 font-bold">
                      <a
                        href={urlVideo}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-emerald-600 hover:underline"
                      >
                        Ver Video
                      </a>
          
                    </div>
                  </div>
                  <button
                    className="bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-3 rounded ml-2"
                    onClick={() => {
                      if (
                        confirm(
                          `¿Está seguro que desea eliminar el video "${video.titulo}"? Esta acción es irreversible.`
                        )
                      ) {
                        eliminarArchivo(video.id, 'video')
              
                      }
                    }}
                  >
                    Eliminar
                  </button>
                </div>
              )}
            })}
          </div>
        )}
      </div>
    </div>
  )
}

export default PaginaBusqueda