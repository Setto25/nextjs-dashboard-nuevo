'use client'

import { Documento } from '@prisma/client'
import { useState } from 'react'
import '@/app/ui/global/containers.css'


// Interfaces
interface Video {
  id: number
  titulo: string
  tema: string
  tipo: string
  url?: string
  //rutaLocal?: string
  idYoutube?: string
  idDailymotion?: string
  descripcion?: string
  duracion?: string
  categorias?: string
  fechaSubida: string
  miniatura?: string
  formato?: string
}

interface Docmuento {
  id: number
  titulo: string
  tema: string
  tipo: string
  rutaLocal?: string
  url?: string
  descripcion?: string
  duracion?: string
  categorias?: string
  fechaSubida: string
  formato?: string
}

interface Protocolo {
  id: number
  titulo: string
  descripcion?: string
  categoria?: string
  rutaLocal?: string
  url?: string
}

interface Libro {
  id: number
  titulo: string
  descripcion?: string
  categorias?: string
  tema?: string
  rutaLocal?: string
  url?: string
}

interface Manual {
  id: number
  titulo: string
  descripcion?: string
  categoria?: string
  rutaLocal?: string
  url?: string
}

interface Plantilla {
  id: number
  titulo: string
  descripcion?: string
  categoria?: string
  palabrasClave?: string
  rutaLocal?: string
  url?: string
}

function PaginaBusqueda() {
  const [termino, setTermino] = useState('')
  const [tipo, setTipo] = useState('todos')
  const [videos, setVideos] = useState<Video[]>([])
  const [documentos, setDocumentos] = useState<Documento[]>([])
  const [protocolos, setProtocolos] = useState<Protocolo[]>([])
  const [libros, setLibros] = useState<Libro[]>([])
  const [manuales, setManuales] = useState<Manual[]>([])
  const [plantillas, setPlantillas] = useState<Plantilla[]>([])
  const [cargando, setCargando] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Funciones de búsqueda omitidas para brevedad (igual que antes)

  const buscarVideos = async () => {
    if (!termino.trim()) return
    setCargando(true)
    setError(null)
    try {
      const url = new URL('/api/videos', window.location.origin)
      url.searchParams.append('q', termino)
      url.searchParams.append('tipo', tipo)
      const response = await fetch(url.toString(), {
        method: 'GET',
        headers: { Accept: 'application/json' }
      })
      if (!response.ok) throw new Error(`Error: ${response.status}`)
      const resultados: Video[] = await response.json()
      setVideos(resultados)
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Error desconocido')
      setVideos([])
    } finally {
      setCargando(false)
    }
  }

  const buscarDocumentos = async () => {
    if (!termino.trim()) return
    setCargando(true)
    setError(null)
    try {
      const url = new URL('/api/documents', window.location.origin)
      url.searchParams.append('q', termino)
      url.searchParams.append('tipo', tipo)
      const response = await fetch(url.toString(), {
        method: 'GET',
        headers: { Accept: 'application/json' }
      })
      if (!response.ok) throw new Error(`Error: ${response.status}`)
      const resultados = await response.json()
      setDocumentos(resultados)
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Error desconocido')
      setDocumentos([])
    } finally {
      setCargando(false)
    }
  }

  const buscarPrtocolos = async () => {
    if (!termino.trim()) return
    setCargando(true)
    setError(null)
    try {
      const url = new URL('/api/protocolos', window.location.origin)
      url.searchParams.append('q', termino)
      url.searchParams.append('tipo', tipo)
      const response = await fetch(url.toString(), {
        method: 'GET',
        headers: { Accept: 'application/json' }
      })
      if (!response.ok) throw new Error('')
      const resultados = await response.json()
      setProtocolos(resultados)
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Error desconocido')
      setProtocolos([])
    } finally {
      setCargando(false)
    }
  }

  const buscarLibros = async () => {
    if (!termino.trim()) return
    setCargando(true)
    setError(null)
    try {
      const url = new URL('/api/books', window.location.origin)
      url.searchParams.append('q', termino)
      url.searchParams.append('tipo', tipo)
      const response = await fetch(url.toString(), {
        method: 'GET',
        headers: { Accept: 'application/json' }
      })
      if (!response.ok) throw new Error(`Error: ${response.status}`)
      const resultados = await response.json()
      setLibros(resultados)
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Error desconocido')
      setLibros([])
    } finally {
      setCargando(false)
    }
  }

  const buscarManuales = async () => {
    if (!termino.trim()) return
    setCargando(true)
    setError(null)
    try {
      const url = new URL('/api/manuals', window.location.origin)
      url.searchParams.append('q', termino)
      url.searchParams.append('tipo', tipo)
      const response = await fetch(url.toString(), {
        method: 'GET',
        headers: { Accept: 'application/json' }
      })
      if (!response.ok) throw new Error(`Error: ${response.status}`)
      const resultados: Manual[] = await response.json()
      setManuales(resultados)
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Error desconocido')
      setManuales([])
    } finally {
      setCargando(false)
    }
  }

    const buscarPlantillas = async () => {
    if (!termino.trim()) return
    setCargando(true)
    setError(null)
    try {
      const url = new URL('/api/plantillas', window.location.origin)
      url.searchParams.append('q', termino)
      url.searchParams.append('tipo', tipo)
      const response = await fetch(url.toString(), {
        method: 'GET',
        headers: { Accept: 'application/json' }
      })
      if (!response.ok) throw new Error(`Error: ${response.status}`)
      const resultados: Plantilla[] = await response.json()
      setPlantillas(resultados)
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Error desconocido')
      setPlantillas([])
    } finally {
      setCargando(false)
    }
  }

  const ambasBusquedas = () => {
    buscarVideos()
    buscarDocumentos()
    buscarPrtocolos()
    buscarLibros()
    buscarManuales()
    buscarPlantillas()
  }
  

 return (
    <div className='flex-container container-formulario-global bg-white p-6 border border-gray-200 rounded-xl shadow-sm h-full flex flex-col'>
      
      {/* --- INSTRUCCIONES (Estilo Alerta Informativa) --- */}
      <div className='Instrucciones__registro container-formulario-parte1 mb-6'>
        <p className='text-gray-500 italic font-bold mb-4 text-lg'>
          En esta sección podrá buscar videos y documentos de forma sencilla...
        </p>
        
        {/* Aquí estaba el texto VERDE. Ahora es una caja de info azul suave */}
        <div className='bg-blue-50 p-4 rounded-lg border border-blue-100'>
          <p className='text-slate-700 text-sm leading-relaxed'>
            Ingrese el término a buscar y aplique el filtro deseado, luego haga clic en <span className="font-bold text-sky-700">"Buscar"</span> para encontrar el material.
          </p>
        </div>
      </div>

      {/* --- FORMULARIO --- */}
      <div className='Formulario__agregar conatiner-formulario-parte2 mb-6'>
        <form
          onSubmit={e => {
            e.preventDefault()
            ambasBusquedas()
          }}
          className='container-form'
        >
          <div className='flex flex-col space-y-4'>
            <div className='w-full'>
              <input
                className='flex w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent outline-none transition-all'
                value={termino}
                onChange={e => setTermino(e.target.value)}
                placeholder='Ingrese el término a buscar...'
              />
            </div>
            <div>
              <select
                value={tipo}
                onChange={e => setTipo(e.target.value)}
                className='w-full p-3 border border-gray-300 rounded-lg text-gray-700 focus:ring-2 focus:ring-sky-500 outline-none bg-white'
              >
                <option value='todos'>Buscar en Todo</option>
                <option value='titulo'>Por Título</option>
                <option value='categorias'>Por Categorías</option>
                <option value='descripcion'>Por Descripción</option>
              </select>
            </div>
          </div>
          <button
            type='submit'
            className='w-full bg-sky-600 hover:bg-sky-700 text-white font-bold py-3 px-4 rounded-lg mt-4 shadow transition-colors duration-200'
          >
            Buscar
          </button>
        </form>
      </div>

      {/* --- RESULTADOS --- */}
      <div className='resultados flex-grow w-full flex flex-col overflow-hidden'>
        <div className='flex items-center justify-between mb-2 border-b border-gray-100 pb-2'>
            <p className='subtitle-responsive text-gray-800'>Resultados:</p>
        </div>
        
        {error && <p className="text-red-500 text-sm mb-2 bg-red-50 p-2 rounded">{error}</p>}

        <div className='flex-grow overflow-y-auto pr-2 custom-scrollbar space-y-3'>
          {cargando ? (
            <div className="flex justify-center items-center py-10 text-sky-600">
                <p>Buscando contenido...</p>
            </div>
          ) : videos.length === 0 &&
            documentos.length === 0 &&
            protocolos.length === 0 &&
            libros.length === 0 &&
            plantillas.length === 0 &&
            manuales.length === 0 ? (
            <p className="text-gray-400 text-sm text-center py-10">No se encontraron resultados.</p>
          ) : (
            <>
              {videos.map(video => {
                let embedUrl: string | undefined;
                if (video.idYoutube) {
                  embedUrl = `https://www.youtube.com/watch/${video.idYoutube}`;
                } else if (video.idDailymotion) {
                  embedUrl = `https://www.dailymotion.com/video/${video.idDailymotion}?autoplay=1`;
                }

                return (
                  <div
                    className='bg-white p-4 flex flex-col justify-between items-start border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow'
                    key={video.id}
                  >
                    <div className="mb-2">
                        <span className="text-[10px] uppercase font-bold text-white bg-red-500 px-2 py-0.5 rounded-full mb-1 inline-block">Video</span>
                        <h3 className='font-bold text-gray-800 text-lg leading-tight'>{video.titulo}</h3>
                    </div>
                    {video.descripcion && <p className="text-gray-600 text-sm mb-2 line-clamp-2">{video.descripcion}</p>}
                    
                    <div className='flex flex-wrap gap-2 text-xs text-gray-500 mb-3'>
                        {video.categorias && <span className="bg-gray-100 px-2 py-1 rounded">Tag: {video.categorias}</span>}
                        {video.duracion && <span className="bg-gray-100 px-2 py-1 rounded">🕒 {video.duracion}</span>}
                    </div>

                    <a href={embedUrl ?? '#'} target='_blank' rel='noopener noreferrer' className='text-sky-600 hover:text-sky-800 hover:underline font-bold text-sm flex items-center gap-1'>
                      Ver Video 
                    </a>
                  </div>
                );
              })}

              {documentos.map(documento => (
                <div
                  className='bg-white p-4 flex flex-col justify-between items-start border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow'
                  key={documento.id}
                >
                  <div className="mb-2">
                      <span className="text-[10px] uppercase font-bold text-white bg-blue-500 px-2 py-0.5 rounded-full mb-1 inline-block">Documento</span>
                      <h3 className='font-bold text-gray-800 text-lg leading-tight'>{documento.titulo}</h3>
                  </div>
                  {documento.descripcion && <p className="text-gray-600 text-sm mb-2 line-clamp-2">{documento.descripcion}</p>}
                  {documento.categorias && <p className="text-xs text-gray-500 mb-3 bg-gray-100 px-2 py-1 rounded w-fit">Tag: {documento.categorias}</p>}
                  
                  <a
                    href={documento.url ?? '#'}
                    target='_blank'
                    rel='noopener noreferrer'
                    className='text-sky-600 hover:text-sky-800 hover:underline font-bold text-sm'
                  >
                    Ver Documento
                  </a>
                </div>
              ))}

              {protocolos.map(protocolo => (
                <div
                  className='bg-white p-4 flex flex-col justify-between items-start border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow'
                  key={protocolo.id}
                >
                   <div className="mb-2">
                      <span className="text-[10px] uppercase font-bold text-white bg-indigo-500 px-2 py-0.5 rounded-full mb-1 inline-block">Protocolo</span>
                      <h3 className='font-bold text-gray-800 text-lg leading-tight'>{protocolo.titulo}</h3>
                  </div>
                  {protocolo.descripcion && <p className="text-gray-600 text-sm mb-2 line-clamp-2">{protocolo.descripcion}</p>}
                  <p className="text-xs text-gray-500 mb-3 bg-gray-100 px-2 py-1 rounded w-fit">Cat: {protocolo.categoria}</p>

                  <a
                    href={protocolo.url ?? '#'}
                    target='_blank'
                    rel='noopener noreferrer'
                    className='text-sky-600 hover:text-sky-800 hover:underline font-bold text-sm'
                  >
                    Ver Protocolo
                  </a>
                </div>
              ))}

              {libros.map(libro => (
                <div
                  className='bg-white p-4 flex flex-col justify-between items-start border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow'
                  key={libro.id}
                >
                   <div className="mb-2">
                      <span className="text-[10px] uppercase font-bold text-white bg-amber-500 px-2 py-0.5 rounded-full mb-1 inline-block">Libro</span>
                      <h3 className='font-bold text-gray-800 text-lg leading-tight'>{libro.titulo}</h3>
                  </div>
                  {libro.descripcion && <p className="text-gray-600 text-sm mb-2 line-clamp-2">{libro.descripcion}</p>}
                  <p className="text-xs text-gray-500 mb-3 bg-gray-100 px-2 py-1 rounded w-fit">Cat: {libro.tema}</p>

                  <a
                    href={libro.url ?? '#'}
                    target='_blank'
                    rel='noopener noreferrer'
                    className='text-sky-600 hover:text-sky-800 hover:underline font-bold text-sm'
                  >
                    Ver PDF
                  </a>
                </div>
              ))}

              {manuales.map(manual => (
                <div
                  className='bg-white p-4 flex flex-col justify-between items-start border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow'
                  key={manual.id}
                >
                   <div className="mb-2">
                      <span className="text-[10px] uppercase font-bold text-white bg-teal-500 px-2 py-0.5 rounded-full mb-1 inline-block">Manual</span>
                      <h3 className='font-bold text-gray-800 text-lg leading-tight'>{manual.titulo}</h3>
                  </div>
                  {manual.descripcion && <p className="text-gray-600 text-sm mb-2 line-clamp-2">{manual.descripcion}</p>}
                  <p className="text-xs text-gray-500 mb-3 bg-gray-100 px-2 py-1 rounded w-fit">Cat: {manual.categoria}</p>

                  <a
                    href={manual.url ?? '#'}
                    target='_blank'
                    rel='noopener noreferrer'
                    className='text-sky-600 hover:text-sky-800 hover:underline font-bold text-sm'
                  >
                    Ver Manual
                  </a>
                </div>
              ))}

              {plantillas.map(plantilla => (
                <div
                  className='bg-white p-4 flex flex-col justify-between items-start border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow'
                  key={plantilla.id}
                >
                   <div className="mb-2">
                      <span className="text-[10px] uppercase font-bold text-white bg-green-500 px-2 py-0.5 rounded-full mb-1 inline-block">Plantilla</span>
                      <h3 className='font-bold text-gray-800 text-lg leading-tight'>{plantilla.titulo}</h3>
                  </div>
                  {plantilla.descripcion && <p className="text-gray-600 text-sm mb-2 line-clamp-2">{plantilla.descripcion}</p>}
                  <p className="text-xs text-gray-500 mb-3 bg-gray-100 px-2 py-1 rounded w-fit">Cat: {plantilla.categoria}</p>

                  <a
                    href={plantilla.url ?? '#'}
                    target='_blank'
                    rel='noopener noreferrer'
                    className='text-sky-600 hover:text-sky-800 hover:underline font-bold text-sm'
                  >
                    Ver Plantilla
                  </a>
                </div>
              ))}
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default PaginaBusqueda