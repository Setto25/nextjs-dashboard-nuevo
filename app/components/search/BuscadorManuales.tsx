'use client'

import { useEffect, useState } from 'react'
import '@/app/ui/global/containers.css'
import '@/app/ui/global/texts.css'
import DocxViewer from '../docx_viewer/docx_viewer'

// Interfaz de Manual
interface Manual {
  id: number
  titulo: string
  rutaLocal: string
  descripcion?: string
  categorias?: string
  fechaSubida: string
  formato?: string
}

function BuscadorManuales () {
  const [termino, setTermino] = useState('')
  const [tipo, setTipo] = useState('todos')
  const [manuales, setManuales] = useState<Manual[]>([])
  const [cargando, setCargando] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const cargarManuales = async () => {
      try {
        setCargando(true)
        const response = await fetch(`/api/manuals?tipo=todos`)
        const data = await response.json()
        setManuales(data)
      } catch (error) {
        console.error('Error cargando manuales', error)
      } finally {
        setCargando(false)
      }
    }
    cargarManuales()
  }, [])

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
        headers: { 'Accept': 'application/json' }
      })

      if (!response.ok) throw new Error(`Error: ${response.status}`)

      const resultados: Manual[] = await response.json()
      setManuales(resultados)
    } catch (error) {
      console.error('Error al buscar manuales', error)
      setError(error instanceof Error ? error.message : 'Error desconocido')
      setManuales([])
    } finally {
      setCargando(false)
    }
  }

  const recargarFormulario = () => {
    window.location.reload()
  }

  return (
    <div className='flex-container container-formulario-global bg-gray-100 p-6'>
      {/* Instrucciones para buscar manuales */}
      <div className='Instrucciones__registro container-formulario-parte1 p-10'>
        <ol className='container-listado'>
          <li className='bg-white p-4 rounded-md shadow-sm'>
            <h3 className='font-bold text-emerald-600 mb-2'>1. Filtrar Manuales.</h3>
            <ul className='list-disc list-inside pl-4 space-y-1'>
              <li>Ingrese un término a filtrar en el campo correspondiente.</li>
              <li>Seleccione el tipo de filtro (por Título, Categorías, etc.).</li>
              <li>Haga clic en el botón "Filtrar" para obtener los resultados.</li>
            </ul>
          </li>
        </ol>
      </div>

      {/* Formulario de búsqueda */}
      <div className='Formulario__agregar conatiner-formulario-parte2 p-10'>
        <form
          onSubmit={e => {
            e.preventDefault()
            buscarManuales()
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
                onChange={(e) => setTipo(e.target.value)}
                className='p-2 border rounded w-full'
              >
                <option value='todos'>Filtrar en Todo</option>
                <option value='titulo'>Por Título</option>
                <option value='categorias'>Por Categorías</option>
                <option value='descripcion'>Por Descripción</option>
              </select>
            </div>
          </div>
          <button
            type='submit'
            className='bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2 px-4 rounded mt-4 w-full'
          >
            Filtrar
          </button>

          <button
            type='button'
            onClick={recargarFormulario}
            className='bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2 px-4 rounded mt-4 w-full'
          >
            Mostrar todo
          </button>
        </form>
      </div>

      {/* Resultados */}
      <div className='resultados w-full mt-5'>
        <p className='subtitle-responsive p-2'>Resultados:</p>
        {error && <p style={{ color: 'red' }}>{error}</p>}

        {cargando ? (
          <p>Buscando...</p>
        ) : manuales.length === 0 ? (
          <p>No se encontraron resultados.</p>
        ) : (
          <div className='grid grid-cols-[repeat(auto-fit,minmax(350px,0.3fr))] gap-6 justify-center'>
            {manuales.map(manual => {
              const archivo = manual.rutaLocal?.split('/').pop() ?? ''
              const urlManual = archivo ? `/api/manuals/${archivo}` : '#'
              return (
                <div
                  key={manual.id}
                  className='bg-white rounded-lg overflow-hidden transition-transform hover:scale-105 border-4 p-2 container-sombra'
                >
                  <h2 className='subtitle2-responsive multi-line-ellipsis-title'>
                    {manual.titulo}
                  </h2>
                  <div className='documento__ p-2 bg-white '>
                    {manual.rutaLocal &&
                      (manual.rutaLocal.toLowerCase().endsWith('.docx') ? (
                        <div className='w-full h-fit mt-2 aspect-[8.5/11] overflow-auto'>
                          <DocxViewer rutaLocal={manual.rutaLocal} />
                        </div>
                      ) : (
                        <iframe
                          src={urlManual}
                          className='w-full h-fit mt-2 aspect-[8.5/11]'
                          title={manual.titulo}
                        />
                      ))}
                  </div>
                  <div className='pt-4 px-2 space-y-2'>
                    <p className='contenedor__descripcion small-text-responsive multi-line-ellipsis h-16'>
                      <span className='font-bold'>Descripción:</span>{' '}
                      {manual.descripcion}
                    </p>
                  </div>
                  <div className='contenedor__centrador flex flex-row justify-center space-x-8 p-2'>
                    <a
                      href={urlManual}
                      download={`${manual.titulo}.pdf`}
                      target='_blank'
                      rel='noopener noreferrer'
                      className='text-emerald-600 hover:underline font-bold'
                    >
                      Descargar
                    </a>
                    <a
                      href={urlManual}
                      target='_blank'
                      rel='noopener noreferrer'
                      className='text-emerald-600 hover:underline font-bold'
                    >
                      Abrir en nueva ventana
                    </a>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

export default BuscadorManuales