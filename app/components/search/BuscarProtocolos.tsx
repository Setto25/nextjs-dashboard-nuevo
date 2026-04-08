'use client'

import { useState } from 'react'
import '@/app/ui/global/containers.css'
import '@/app/ui/global/texts.css'

// Interfaz de Protocolo
interface Protocolo {
  id: number
  titulo: string
  url: string
  descripcion?: string
  categoria?: string
  fechaCreacion: string
  version?: string
  creadoPor?: string
  fechaSubida?: string
}

function BuscadorProtocolos () {
  const [termino, setTermino] = useState('')
  const [tipo, setTipo] = useState('todos')
  const [protocolos, setProtocolos] = useState<Protocolo[]>([])
  const [cargando, setCargando] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const buscarProtocolos = async () => {
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

      if (!response.ok) {
        throw new Error(`Error: ${response.status}`)
      }

      const resultados: Protocolo[] = await response.json()
      setProtocolos(resultados)
    } catch (error) {
      console.error('Error al buscar protocolos', error)
      setError(error instanceof Error ? error.message : 'Error desconocido')
      setProtocolos([])
    } finally {
      setCargando(false)
    }
  }

  return (
    <div className='flex-container container-formulario-global bg-gray-100 p-6'>
      {/* Instrucciones para buscar protocolos */}
      <div className='Instrucciones__registro container-formulario-parte1 p-10'>
        <p className='subtitle-responsive font-semibold text-gray-800 mb-4'>
          En esta sección podrá buscar protocolos de manera sencilla...
        </p>
        <ol className='container-listado'>
          <li className='bg-white p-4 rounded-md shadow-sm'>
            <h3 className='font-bold text-emerald-600 mb-2'>1. Buscar Protocolos.</h3>
            <ul className='list-disc list-inside pl-4 space-y-1'>
              <li>Ingrese un término de búsqueda en el campo correspondiente.</li>
              <li>Seleccione el tipo de búsqueda (por Título, Categorías, etc.).</li>
              <li>Haga clic en el botón "Buscar" para obtener los resultados.</li>
            </ul>
          </li>
        </ol>
      </div>

      {/* Formulario de búsqueda */}
      <div className='Formulario__agregar container-formulario-parte2 p-10 flex items-center'>
        <form
          onSubmit={e => {
            e.preventDefault()
            buscarProtocolos()
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
                <option value='categoria'>Por Categoría</option>
                <option value='descripcion'>Por Descripción</option>
              </select>
            </div>
          </div>
          <button
            type='submit'
            className='bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2 px-4 rounded mt-4 w-full'
          >
            Buscar
          </button>
        </form>
      </div>

      {/* Resultados de búsqueda */}
      <div className='resultados w-1/2 mt-5'>
        <p className='subtitle2-responsive'>Resultados:</p>
        {error && <p style={{ color: 'red' }}>{error}</p>}

        {cargando ? (
          <p>Buscando...</p>
        ) : protocolos.length === 0 ? (
          <p>No se encontraron resultados.</p>
        ) : (
          <div className='h-96 overflow-y-scroll space-y-4'>
     {protocolos.map((protocolo) => (
  <div
    className="resultados bg-white p-4 my-1 flex flex-col justify-between items-start border border-gray-300 rounded"
    key={protocolo.id}
  >
    <div>
      <h3 className="subtitle-responsive">Protocolo: {protocolo.titulo}</h3>
      {protocolo.descripcion && (
        <p className='small-text-responsive'><strong>Descripción:</strong> {protocolo.descripcion}</p>
      )}
      <p className='small-text-responsive'><strong>Categoría:</strong> {protocolo.categoria}</p>
      <p className='small-text-responsive'><strong>Fecha de Creación:</strong> {protocolo.fechaCreacion.split('T')[0].split('-').reverse().join('/')}</p>
      <p className='small-text-responsive'><strong>Versión:</strong> {protocolo.version}</p>
      <p className='small-text-responsive'><strong>Creado por:</strong> {protocolo.creadoPor}</p>
      <p className='small-text-responsive'><strong>Fecha de Subida:</strong> {protocolo.fechaSubida?.split('T')[0].split('-').reverse().join('/')}</p>


      <div className="flex space-x-8 mt-1">
        <a
          href={protocolo.url ?? ''}
                    target="_blank"
          rel="noopener noreferrer"
          className="text-emerald-600 hover:underline font-bold"
        >
          Abrir en nueva pestaña
        </a>
   
      </div>
    </div>
  </div>
))}
          </div>
        )}
      </div>
    </div>
  )
}

export default BuscadorProtocolos