'use client'

import { useState, useEffect } from 'react'
import { PDFDocument } from 'pdf-lib'
import { toast } from 'react-toastify'
import DocxViewer from '../docx_viewer/docx_viewer'
import '@/app/ui/global/containers.css'
import '@/app/ui/global/shadows.css'
import '@/app/ui/global/docx.css'
import '@/app/ui/global/texts.css'
import '@/app/ui/global/grids.css'

import { useUploadStore, useValueProtocol } from '@/app/store/store'

interface Plantilla {
  id: number
  tema?: string
  categoria: string
  titulo: string
  url?: string
  portada?: string
  descripcion?: string
  palabrasClave?: string
  fechaSubida: string
  formato?: string
}

function CargarPlantillas () {
  const actualizarPlantillas = useUploadStore(state => state.actualizarUpload)

  // 1. CAMBIO: Inicializamos en 'todo' porque el tipo inicial es 'todos'
  const [termino, setTermino] = useState('todo')
  const [tipo, setTipo] = useState('mostrarTodo')

  const [plantillas, setPlantillas] = useState<Plantilla[]>([])
  const [cargando, setCargando] = useState(true)

  // Estado para manejar los documentos seleccionados para el "Set"
  const [seleccionados, setSeleccionados] = useState<number[]>([])
  const [procesandoPdf, setProcesandoPdf] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // NUEVO: Estado para controlar la vista (false = grilla, true = lista)
  const [vistaLista, setVistaLista] = useState(false)

  // 2. CAMBIO: Agregamos el useEffect para controlar el cambio de inputs
  useEffect(() => {
    if (tipo === 'mostrarTodo') {
      setTermino('todo')
    } else {
      setTermino('') // Limpiamos para obligar al usuario a escribir/seleccionar
    }
  }, [tipo])

  const selectCategory = (seleccion: number) => {
    switch (seleccion) {
      case 0:
        return 'legal_administrativo'
      case 1:
        return 'registros_clinicos'
      case 2:
        return 'escalas_valoracion'
      case 3:
        return 'control_dispositivos'
      case 4:
        return 'listas_chequeo'
      case 5:
        return 'educacion_padres'
      default:
        return 'otros'
    }
  }

  useEffect(() => {
    async function cargarPlantillas () {
      try {
        setCargando(true)
        const response = await fetch('/api/plantillas')
        const data = await response.json()
        setPlantillas(data)
      } catch (error) {
        console.error('Error cargando Plantillas', error)
      } finally {
        setCargando(false)
      }
    }
    cargarPlantillas()
  }, [actualizarPlantillas])

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
      console.error('Error al buscar Plantillas', error)
      setError(error instanceof Error ? error.message : 'Error desconocido')
      setPlantillas([])
    } finally {
      setCargando(false)
    }
  }

  // --- FUNCIÓN NÚCLEO: UNIÓN DE PDFs EN EL CLIENTE ---
  const generarEImprimirSet = async () => {
    if (seleccionados.length === 0) return

    setProcesandoPdf(true)
    const loadingToast = toast.loading('Generando set de impresión...')

    try {
      const mergedPdf = await PDFDocument.create()
      const docsElegidos = plantillas.filter(p => seleccionados.includes(p.id))

      console.log('Documentos elegidos para el set:', docsElegidos)

      for (const doc of docsElegidos) {
        if (!doc.url) continue

        const response = await fetch(doc.url)
        if (!response.ok) throw new Error(`Error al descargar: ${doc.titulo}`)

        const pdfBytes = await response.arrayBuffer()
        const pdfDoc = await PDFDocument.load(pdfBytes)

        const copiedPages = await mergedPdf.copyPages(
          pdfDoc,
          pdfDoc.getPageIndices()
        )
        copiedPages.forEach(page => mergedPdf.addPage(page))
      }

      const pdfFinalBytes = await mergedPdf.save()
      const blob = new Blob([new Uint8Array(pdfFinalBytes)], {
        type: 'application/pdf'
      })
      const finalUrl = URL.createObjectURL(blob)

      window.open(finalUrl, '_blank')

      toast.update(loadingToast, {
        render: 'Set listo para imprimir',
        type: 'success',
        isLoading: false,
        autoClose: 3000
      })
    } catch (error) {
      console.error('Error uniendo documentos:', error)
      toast.update(loadingToast, {
        render: 'Error al crear el set',
        type: 'error',
        isLoading: false,
        autoClose: 3000
      })
    } finally {
      setProcesandoPdf(false)
    }
  }

  const toggleSeleccion = (id: number) => {
    setSeleccionados(prev =>
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    )
  }

  if (cargando)
    return <p className='text-center py-10'>Cargando plantillas...</p>

  return (
    <div className='flex-container flex-col place-items-center'>
      <div className='flex-container flex-row container-formulario-global bg-white rounded-2xl shadow-sm hover:shadow-md transition-shadow p-6 justify-center w-fit gap-4 border '>
        <p className='subtitle-responsive'>Filtrar Plantillas</p>

        {/* Formulario de búsqueda */}
        <div className='Formulario__agregar container-formulario-parte2 '>
          <form
            onSubmit={e => {
              e.preventDefault()
              buscarPlantillas()
            }}
            className='container-form'
          >
            <div className='flex flex-row space-y-4'>
              <div className='flex flex-row space-x-4 '>
                <select
                  value={tipo}
                  onChange={e => {
                    const nuevoTipo = e.target.value
                    setTipo(nuevoTipo)

                    // Usamos nuevoTipo en lugar de tipo
                    if (nuevoTipo === 'mostrarTodo') {
                      setTermino('')
                    }
                  }}
                  className='px-10 border rounded'
                >
                  <option value='mostrarTodo'>Mostrar Todo</option>
                   <option value='palabrasClave'>Palabra clave</option>
                  <option value='titulo'>Por Título</option>
                  <option value='categoria'>Por Categoría</option>
                 
                </select>

                {/* Lógica visual simplificada */}
                {tipo === 'palabrasClave' ? (
                  <input
                    className='p-2 border rounded  placeholder:text-sm'
                    value={termino}
                    onChange={e => setTermino(e.target.value)}
                    placeholder='Ingrese palabra, ej. "ingreso"'
                  />
                ) : tipo === 'categoria' ? (
                  <select
                    value={termino}
                    onChange={e => {
                      setTermino(e.target.value)
                    }}
                    className='p-2 border rounded  px-10'
                  >
                    <option value=''>-- Seleccione Área --</option>
                    <option value='legal_administrativo'>
                      Legales y Administrativos
                    </option>
                    <option value='registros_clinicos'>
                      Registros Clínicos
                    </option>
                    <option value='escalas_valoracion'>
                      Escalas de Valoración y Scores
                    </option>
                    <option value='control_dispositivos'>
                      Seguimiento de Dispositivos
                    </option>
                    <option value='listas_chequeo'>
                      Listas de Chequeo (Checklists)
                    </option>
                    <option value='educacion_padres'>Educación a Padres</option>
                  </select>
                ) : tipo === 'titulo' ? (
                  <input
                    className='p-2 border rounded placeholder:text-sm'
                    value={termino}
                    onChange={e => setTermino(e.target.value)}
                    placeholder='Ingrese el término a buscar'
                  />
                ) : (
                  <span className='flex items-center text-gray-400 italic text-sm px-2'></span>
                )}

                <button
                  type='submit'
                  className='bg-sky-300 hover:bg-sky-500 text-white font-bold py-2 px-4 rounded gap-4 w-full'
                >
                  Buscar
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>

      <div className='relative pb-40 w-full'>
        {' '}
        {/* CHECK PARA SELECCIONAR VISTA */}
        <div className='flex flex-row justify-end items-center w-full gap-3'>
          <label
            htmlFor='toggleVista'
            className='cursor-pointer font-bold text-gray-700 select-none'
          >
            Ver como lista
          </label>

          <input
            id='toggleVista'
            type='checkbox'
            checked={vistaLista}
            onChange={() => setVistaLista(prev => !prev)}
            className='w-6 h-6 cursor-pointer accent-blue-500'
          />
        </div>
        <h1 className='subtitle-responsive py-4'>Plantillas disponibles:</h1>
        {/* INDICADOR FLOTANTE DE SELECCIÓN CON BANNER DE IMPRESIÓN */}
        {seleccionados.length > 0 && (
          <div className='fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-white border-2 border-blue-500 p-4 rounded-xl shadow-2xl flex flex-col items-center gap-4 transition-all animate-in fade-in slide-in-from-bottom-4 w-[90%] max-w-2xl'>
            {/* NUEVO: ALERTA DE IMPRESIÓN */}
            <div className='bg-amber-50 border border-amber-300 p-3 rounded w-full flex items-start text-left'>
              <svg
                className='w-6 h-6 text-amber-500 mr-3 flex-shrink-0'
                fill='none'
                stroke='currentColor'
                viewBox='0 0 24 24'
              >
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth='2'
                  d='M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z'
                ></path>
              </svg>
              <div className='text-sm text-amber-800'>
                <p className='font-bold mb-1'>
                  Antes de imprimir el Set que se generará, verifica en las
                  opciones de la impresora:
                </p>
                <ul className='list-disc pl-5'>
                  <li>
                    Tamaño de papel: <strong>Folio</strong>.
                  </li>
                  <li>
                    Escala: <strong>Ajustar al tamaño del papel</strong>.
                  </li>
                  <li>
                    Ambas caras:{' '}
                    <strong>
                      Imprimir en ambas caras (Girar por el borde largo)
                    </strong>
                    .
                  </li>
                </ul>
              </div>
            </div>

            {/* CONTROLES DE GENERACIÓN */}
            <div className='flex w-full justify-between items-center px-2'>
              <p className='font-bold text-black'>
                {seleccionados.length}{' '}
                {seleccionados.length === 1
                  ? 'documento seleccionado'
                  : 'documentos seleccionados'}
              </p>
              <div className='flex gap-4'>
                <button
                  onClick={generarEImprimirSet}
                  disabled={procesandoPdf}
                  className='bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-full font-bold transition-colors disabled:bg-gray-400'
                >
                  {procesandoPdf ? 'Procesando...' : 'Generar Set e Imprimir'}
                </button>
                <button
                  onClick={() => setSeleccionados([])}
                  className='text-gray-500 hover:text-red-500 text-sm font-semibold px-2'
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        )}
        {/* VISTAS SELECCION */}
        {plantillas.length === 0 ? (
          <div className='text-center text-gray-600 py-10'>
            No hay plantillas disponibles.
          </div>
        ) : (
          <div
            className={` justify-center
            
          ${
            vistaLista
              ? 'flex flex-col gap-4'
              : 'grid grid-cols-[repeat(auto-fit,minmax(350px,0.35fr))] gap-6 justify-center'
          }`}
          >
            {plantillas.map(item => {
              const elegido = seleccionados.includes(item.id)
              return (
                <div
                  key={item.id}
                  className={`card-documento ${
                    vistaLista
                      ? elegido
                        ? 'flex flex-row card-documento-seleccion justify-between items-center '
                        : 'flex flex-row justify-between items-center'
                      : 'flex-fit'
                  }
                    `}
                >
                  {/* Checkbox visual */}
                  <div
                    onClick={() => toggleSeleccion(item.id)}
                    className={`absolute top-4 right-4 w-7 h-7 rounded-full border-2 flex items-center justify-center cursor-pointer z-10 transition-colors ${
                      elegido
                        ? 'bg-blue-500 border-blue-500'
                        : 'bg-white border-gray-300'
                    }`}
                  >
                    {elegido && (
                      <span className='text-white text-xs font-bold'>✓</span>
                    )}
                  </div>

                  <h2 className='subtitle2-responsive multi-line-ellipsis-title p-2 subtitle2-responsive '>
                    {item.titulo}
                  </h2>

                  <div
                    className={`portada__ ${
                      vistaLista ? '' : ' portada-documento'
                    }`}
                  >
                    {item.url &&
                      (vistaLista ? (
                        ''
                      ) : (
                        <>
                          <img
                            src={item.portada || '/placeholder-document.png'}
                            alt={`Portada`}
                            loading='lazy'
                            className='w-full h-full object-cover object-top mt-2 aspect-[8.5/11] rounded cursor-pointer'
                            onClick={() => window.open(item.url, '_blank')}
                          />

                          <div className='pt-4 px-2 space-y-2 text-sm text-gray-700'>
                            <p className='multi-line-ellipsis'>
                              <span className='font-bold'>Descripción:</span>{' '}
                              {item.descripcion}
                            </p>
                            <p>
                              <span className='font-bold'>Subido el:</span>{' '}
                              {item.fechaSubida
                                .split('T')[0]
                                .split('-')
                                .reverse()
                                .join('/')}
                            </p>
                            {item.palabrasClave && (
                              <p className='text-blue-500 italic text-[11px]'>
                                Tags: {item.palabrasClave}
                              </p>
                            )}
                          </div>
                        </>
                      ))}
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

export default CargarPlantillas
