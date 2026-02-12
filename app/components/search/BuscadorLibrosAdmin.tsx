'use client'

import { useEffect, useState } from 'react'
import '@/app/ui/global/containers.css'
import { useUploadStore } from '@/app/store/store'

// Interfaz de Libro
interface Libro {
  id: number
  titulo: string
  rutaLocal?: string
  descripcion?: string
  categorias?: string
  fechaSubida: string
  formato?: string
  url: string
}

function BuscadorLibrosAdmin() {
  const actualizarLibros = useUploadStore(state => state.actualizarUpload)

  const [termino, setTermino] = useState('')
  const [tipo, setTipo] = useState('todos')
  const [libros, setLibros] = useState<Libro[]>([])
  const [cargando, setCargando] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const cargarLibros = async () => {
    setCargando(true)
    try {
      const response = await fetch(`/api/books?tipo=todos`)
      const data = await response.json()
      setLibros(data)
    } catch (error) {
      setError('Error cargando libros')
    } finally {
      setCargando(false)
    }
  }

  useEffect(() => {
    cargarLibros()
  }, [actualizarLibros])

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
        headers: {
          Accept: 'application/json'
        }
      })

      if (!response.ok) {
        throw new Error(`Error: ${response.status}`)
      }

      const resultados: Libro[] = await response.json()
      setLibros(resultados)
    } catch (error) {
      console.error('Error al buscar libros', error)
      setError(error instanceof Error ? error.message : 'Error desconocido')
      setLibros([])
    } finally {
      setCargando(false)
    }
  }

  const ambasBusquedas = () => {
    buscarLibros()
  }

  const eliminarArchivo = async (id: number, tipo: 'libro') => {
    setCargando(true)
    try {
      const url = `/api/books/${id}`
      const response = await fetch(url, {
        method: 'DELETE',
        headers: {
          Accept: 'application/json'
        }
      })

      if (!response.ok) {
        throw new Error(`Error al eliminar ${tipo}: ${response.status}`)
      }

      setLibros(prev => prev.filter(libro => libro.id !== id))
    } catch (error) {
      console.error('Error al eliminar archivo', error)
      setError(error instanceof Error ? error.message : 'Error desconocido')
    } finally {
      setCargando(false)
    }
  }

  const limpiarArchivos = async () => {
    setCargando(true)
    try {
      const response = await fetch('/api/delete-contenido-gestion', {
        method: 'POST',
        headers: {
          Accept: 'application/json'
        }
      })

      if (!response.ok) {
        throw new Error(`Error al limpiar archivos: ${response.status}`)
      }

      await cargarLibros() // Volver a cargar los libros
    } catch (error) {
      console.error('Error al limpiar archivos', error)
      setError(error instanceof Error ? error.message : 'Error desconocido')
    } finally {
      setCargando(false)
    }
  }

  return (
    <div className="flex-container container-formulario-global bg-gray-100 p-6">
      {/* Instrucciones para buscar libros */}
      <div className="Instrucciones__registro container-formulario-parte1 p-10">
        <ol className="container-listado">
          <li className="bg-white p-4 rounded-md shadow-sm">
            <h3 className="font-bold text-blue-600 mb-2">1. Buscar Libros.</h3>
            <ul className="list-disc list-inside pl-4 space-y-1">
              <li>Ingrese un término de búsqueda en el campo correspondiente.</li>
              <li>Seleccione el tipo de búsqueda (por Título, Categorías, etc.).</li>
              <li>Haga clic en el botón "Buscar" para obtener los resultados.</li>
            </ul>
          </li>
          <li className="bg-white p-4 rounded-md shadow-sm mt-4">
            <h3 className="font-bold text-blue-600 mb-2">2. Eliminar Libros.</h3>
            <ul className="list-disc list-inside pl-4 space-y-1">
              <li>Para eliminar un libro, haga clic en el botón "Eliminar".</li>
              <li>Confirme la acción en el mensaje que aparece.</li>
              <li>Recuerde que la eliminación es irreversible.</li>
            </ul>
          </li>
        </ol>
      </div>

      {/* Formulario de búsqueda */}
      <div className="Formulario__agregar conatiner-formulario-parte2 p-10">
        <form
          onSubmit={e => {
            e.preventDefault()
            ambasBusquedas()
          }}
          className="container-form"
        >
          <div className="flex flex-col space-y-4">
            <div className="w-full">
              <input
                className="flex w-full p-2 border rounded"
                value={termino}
                onChange={e => setTermino(e.target.value)}
                placeholder="Ingrese el término a buscar"
              />
            </div>
            <div>
              <select
                value={tipo}
                onChange={e => setTipo(e.target.value)}
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
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mt-4 w-full"
          >
            Buscar
          </button>
        </form>
      </div>

      {/* Resultados de búsqueda */}
      <div className="resultados w-1/2 mt-5">
        <p className="subtitle2-responsive">Resultados:</p>
        {error && <p style={{ color: 'red' }}>{error}</p>}

        {cargando ? (
          <p>Buscando...</p>
        ) : libros.length === 0 ? (
          <p>No se encontraron resultados.</p>
        ) : (
          <div className="h-96 overflow-y-scroll space-y-2">
            {libros.map(libro => {
              const urlLibro = libro.url
              const archivo = libro.rutaLocal?.split('/').pop() ?? ''
             // const urlLibro = archivo ? `/api/books/${archivo}` : '#'
              return (
                <div
                  key={libro.id}
                  className="resultados bg-white p-4 my-1 flex justify-between items-center border border-gray-300 rounded"
                >
                  <div>
                    <h3 className="font-bold">{libro.titulo}</h3>
                    <p>{libro.descripcion}</p>
                    <p>Categorías: {libro.categorias}</p>
                    <div className="flex space-x-8 mt-1">
                      <a
                        href={urlLibro}
                        download={`${libro.titulo}.pdf`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline font-bold"
                      >
                        Descargar
                      </a>
                      <a
                        href={urlLibro}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline font-bold"
                      >
                        Abrir en nueva ventana
                      </a>
                    </div>
                  </div>
                  <button
                    className="bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-3 rounded ml-2"
                    onClick={() => {
                      if (
                        confirm(
                          `¿Está seguro que desea eliminar el libro "${libro.titulo}"? Esta acción es irreversible.`
                        )
                      ) {
                        eliminarArchivo(libro.id, 'libro')
                     
                      }
                    }}
                  >
                    Eliminar
                  </button>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

export default BuscadorLibrosAdmin