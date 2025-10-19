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
  rutaLocal?: string
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
}

interface Libro {
  id: number
  titulo: string
  descripcion?: string
  categorias?: string
  tema?: string
  rutaLocal?: string
}

interface Manual {
  id: number
  titulo: string
  descripcion?: string
  categoria?: string
  rutaLocal?: string
}

function PaginaBusqueda() {
  const [termino, setTermino] = useState('')
  const [tipo, setTipo] = useState('todos')
  const [videos, setVideos] = useState<Video[]>([])
  const [documentos, setDocumentos] = useState<Documento[]>([])
  const [protocolos, setProtocolos] = useState<Protocolo[]>([])
  const [libros, setLibros] = useState<Libro[]>([])
  const [manuales, setManuales] = useState<Manual[]>([])
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

  const ambasBusquedas = () => {
    buscarVideos()
    buscarDocumentos()
    buscarPrtocolos()
    buscarLibros()
    buscarManuales()
  }

  return (
    <div className='flex-container container-formulario-global bg-gray-100 p-6 border border-gray-950 rounded-lg container-sombra'>
      {/* Instrucciones para buscar videos y documentos */}
      <div className='Instrucciones__registro container-formulario-parte1'>
        <p className='description-responsive font-semibold text-gray-800 mb-4'>
          En esta sección podrá buscar videos y documentos de forma sencilla...
        </p>
        <p className='mt-6 text-green-700 font-bold description-responsive pb-2'>
          Ingrese el termino a buscar y aplique el filtro deseado, luego haga clic en "Buscar" para encontrar videos y documentos.
        </p>
      </div>

      {/* Formulario de búsqueda */}
      <div className='Formulario__agregar conatiner-formulario-parte2'>
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
                className='flex w-full p-2 border rounded'
                value={termino}
                onChange={e => setTermino(e.target.value)}
                placeholder='Ingrese el término a buscar'
              />
            </div>
            <div>
              <select
                value={tipo}
                onChange={e => setTipo(e.target.value)}
                className='p-2 border rounded w-full'
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
            className='bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mt-4 w-full'
          >
            Buscar
          </button>
        </form>
      </div>

      {/* Resultados */}
      <div className='resultados h-full w-full mt-5'>
        <p className='subtitle-responsive'>Resultados:</p>
        {error && <p style={{ color: 'red' }}>{error}</p>}

        {cargando ? (
          <p>Buscando...</p>
        ) : videos.length === 0 &&
          documentos.length === 0 &&
          protocolos.length === 0 &&
          libros.length === 0 &&
          manuales.length === 0 ? (
          <p>No se encontraron resultados.</p>
        ) : (
          <div className='h-52 overflow-y-scroll space-y-4'>

            {videos.map(video => (
              <div
         className='resultados bg-white p-4 my-1 flex flex-col justify-between items-start border border-gray-300 rounded'
                key={video.id}
              >
                <h3 className='font-bold'>Video: {video.titulo}</h3>
                {video.descripcion && (
                  <p><strong>Descripción:</strong> {video.descripcion}</p>
                )}
                {video.categorias && (
                  <p><strong>Categorías:</strong> {video.categorias}</p>
                )}
                {video.duracion && (
                  <p><strong>Duración:</strong> {video.duracion}</p>
                )}
                <div className='flex space-x-8 mt-1'>
                  <a
                    href={video.rutaLocal ?? '#'}
                    download
                    target='_blank'
                    rel='noopener noreferrer'
                    className='text-blue-600 hover:underline font-bold'
                  >
                    Descargar
                  </a>
                  <a
                    href={video.rutaLocal ?? '#'}
                    target='_blank'
                    rel='noopener noreferrer'
                    className='text-blue-600 hover:underline font-bold'
                  >
                    Abrir en nueva ventana
                  </a>
                </div>
              </div>
            ))}

            {documentos.map(documento => (
              <div
           className='resultados bg-white p-4 my-1 flex flex-col justify-between items-start border border-gray-300 rounded'
                key={documento.id}
              >
                <h3 className='font-bold'>Documento: {documento.titulo}</h3>
                {documento.descripcion && (
                  <p><strong>Descripción:</strong> {documento.descripcion}</p>
                )}
                {documento.categorias && (
                  <p><strong>Categorías:</strong> {documento.categorias}</p>
                )}
                <div className='flex space-x-8 mt-1'>
                  <a
                    href={documento.rutaLocal ?? '#'}
                    download
                    target='_blank'
                    rel='noopener noreferrer'
                    className='text-blue-600 hover:underline font-bold'
                  >
                    Descargar
                  </a>
                  <a
                    href={documento.rutaLocal ?? '#'}
                    target='_blank'
                    rel='noopener noreferrer'
                    className='text-blue-600 hover:underline font-bold'
                  >
                    Abrir en nueva ventana
                  </a>
                </div>
              </div>
            ))}

            {protocolos.map(protocolo => (
              <div
                className='resultados bg-white p-4 my-1 flex flex-col justify-between items-start border border-gray-300 rounded'
                key={protocolo.id}
              >
                <div>
                  <h3 className='font-bold'>Protocolo: {protocolo.titulo}</h3>
                  {protocolo.descripcion && (
                    <p><strong>Descripción:</strong> {protocolo.descripcion}</p>
                  )}
                  <p><strong>Categoría:</strong> {protocolo.categoria}</p>
                </div>
                <div className='flex space-x-8 mt-1'>
                  <a
                    href={`/api/protocolos/${protocolo.rutaLocal?.split('/').pop()}`}
                    download
                    target='_blank'
                    rel='noopener noreferrer'
                    className='text-blue-600 hover:underline font-bold'
                  >
                    Descargar
                  </a>
                  <a
                    href={`/api/protocolos/${protocolo.rutaLocal?.split('/').pop()}`}
                    target='_blank'
                    rel='noopener noreferrer'
                    className='text-blue-600 hover:underline font-bold'
                  >
                    Abrir en nueva ventana
                  </a>
                </div>
              </div>
            ))}

            {libros.map(libro => (
              <div
          className='resultados bg-white p-4 my-1 flex flex-col justify-between items-start border border-gray-300 rounded'
                key={libro.id}
              >
                <div>
                  <h3 className='font-bold'>Libro: {libro.titulo}</h3>
                  {libro.descripcion && (
                    <p><strong>Descripción:</strong> {libro.descripcion}</p>
                  )}
                  <p><strong>Categoría:</strong> {libro.tema}</p>
                </div>
                <div className='flex space-x-8 mt-1'>
                  <a
                    href={libro.rutaLocal ?? '#'}
                    download
                    target='_blank'
                    rel='noopener noreferrer'
                    className='text-blue-600 hover:underline font-bold'
                  >
                    Descargar
                  </a>
                  <a
                    href={libro.rutaLocal ?? '#'}
                    target='_blank'
                    rel='noopener noreferrer'
                    className='text-blue-600 hover:underline font-bold'
                  >
                    Abrir en nueva ventana
                  </a>
                </div>
              </div>
            ))}

            {manuales.map(manual => (
              <div
           className='resultados bg-white p-4 my-1 flex flex-col justify-between items-start border border-gray-300 rounded'
                key={manual.id}
              >
                <div>
                  <h3 className='font-bold'>Manual: {manual.titulo}</h3>
                  {manual.descripcion && (
                    <p><strong>Descripción:</strong> {manual.descripcion}</p>
                  )}
                  <p><strong>Categoría:</strong> {manual.categoria}</p>
                </div>
                <div className='flex space-x-8 mt-1'>
                  <a
                    href={manual.rutaLocal ?? '#'}
                    download
                    target='_blank'
                    rel='noopener noreferrer'
                    className='text-blue-600 hover:underline font-bold'
                  >
                    Descargar
                  </a>
                  <a
                    href={manual.rutaLocal ?? '#'}
                    target='_blank'
                    rel='noopener noreferrer'
                    className='text-blue-600 hover:underline font-bold'
                  >
                    Abrir en nueva ventana
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default PaginaBusqueda