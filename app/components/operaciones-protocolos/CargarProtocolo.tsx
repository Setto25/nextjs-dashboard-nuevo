'use client'

import { useState, useEffect } from 'react'
import DocxViewer from '../docx_viewer/docx_viewer' // Asegúrate de que este componente es adecuado para visualizar protocolos
import '@/app/ui/global/containers.css'
import '@/app/ui/global/shadows.css'
import '@/app/ui/global/docx.css'
import '@/app/ui/global/texts.css'
import '@/app/ui/global/grids.css'
import { useValueProtocol } from '@/app/store/store'

// Interfaz de documento de protocolo
interface Protocolo {
  id: number
  titulo: string
  descripcion?: string
  fechaCreacion: string
  url: string
  portada: string
  version: string
  creadoPor: string
  fechaSubida: string
}

function CargarProtocolos () {
  const { numeroP } = useValueProtocol()

  const selectCategory = (seleccion: number) => {
    switch (seleccion) {
      case 0:
        return 'cuidados_generales' // Llame a la función correspondiente
      case 1:
        return 'soporte_respiratorio' // Llame a la función correspondiente
      case 2:
        return 'manejo_infecciones' // Llame a la función correspondiente
      case 3:
        return 'nutricion_alimentacion' // Llame a la función correspondiente
      case 4:
        return 'administracion_medicamentos' // Llame a la función correspondiente
      case 5:
        return 'procedimientos_invasivos' // Llame a la función correspondiente
      case 6:
        return 'cuidados_piel_termoregulacion' // Llame a la función correspondiente
      case 7:
        return 'monitorizacion_uci' // Llame a la función correspondiente
      case 8:
        return 'protocolos_institucionales' // Llame a la función correspondiente
      case 9:
        return 'otros_protocolos' // Llame a la función correspondiente
      default:
        return <p>Página no seleccionada</p>
    }
  }

  const [protocolos, setProtocolos] = useState<Protocolo[]>([])
  const [cargando, setCargando] = useState(true)

  useEffect(() => {
    const cargarProtocolo = async () => {
      try {
        const response = await fetch(
          `/api/protocolos?q=${selectCategory(numeroP)}&tipo=categoria`
        ) // en EndpoinT recibe dos parametros, termino y tipo
        const data = await response.json()

        setProtocolos(data)
        console.log('Protocolos cargados:', data) // Verificar los protocolos cargados
      } catch (error) {
        console.error('Error cargando protocolos:', error)
      } finally {
        setCargando(false)
      }
    }

    cargarProtocolo()
  }, [numeroP])

  if (cargando) return <p>Cargando protocolos...</p>

  return (
    <div>
      <h1 className='subtitle-responsive py-4'>Protocolos disponibles:</h1>
      {protocolos.length === 0 ? (
        <div className='text-center text-gray-600'>
          No hay portocolos disponibles para este tema.
        </div>
      ) : (
        <div className='grid grid-cols-[repeat(auto-fit,minmax(400px,0.35fr))] gap-6 justify-center'>
          {protocolos.map(protocolo => (
            <div key={protocolo.id} className='card-documento'>
              <h2 className='subtitle2-responsive multi-line-ellipsis-title py-5 my-2 text-center text-slate-900'>
                {protocolo.titulo}
              </h2>

              <div className='portada__ portada-documento'>
                {protocolo.url && (
                 
                    <img
                      src={protocolo.portada}
                      alt={`Portada de ${protocolo.titulo}`}
                      loading='lazy'
                      className='w-full h-full object-cover object-top mt-2 aspect-[8.5/11] rounded'
                      onClick={() => window.open(protocolo.url, '_blank')}
                    />
             
                )}
              </div>

              <div className='pt-4 px-2 space-y-2'>
                <p className='contenedor__descripcion x_small-text-responsive multi-line-ellipsis '>
                  <span className='font-bold'>Descripción:</span>{' '}
                  {protocolo.descripcion}
                </p>

                <p className='contenedor__descripcion x_small-text-responsive multi-line-ellipsis'>
                  <span className='font-bold'>Creado por:</span>{' '}
                  {protocolo.creadoPor}
                </p>
                <p className='contenedor__descripcion x_small-text-responsive multi-line-ellipsis'>
                  <span className='font-bold'>Versión:</span>{' '}
                  {protocolo.version}
                </p>
                <p className='contenedor__descripcion x_small-text-responsive multi-line-ellipsis'>
                  <span className='font-bold'>Subido el:</span>{' '}
                  {protocolo.fechaSubida
                    .split('T')[0]
                    .split('-')
                    .reverse()
                    .join('/')}{' '}
                  {/* Split corta en la T, 0 indica que element tomar y dejar, el 2do split divide los numeros separados por / en guiones y despues se invierte */}
                </p>
              </div>
              <div className='contenedor__centrador flex flex-row justify-between items-center gap-2'>
                <button
                  className='bg-emerald-600 hover:bg-emerald-700 text-white  py-1 rounded mt-4 w-full description-responsive'
                  onClick={() => window.open(`${protocolo.url}`, '_blank')}
                >
                  Abrir en nueva pestaña
                </button>
                {/*    <div className='bg-emerald-600 hover:bg-emerald-700 text-white py-1 rounded mt-4 w-full description-responsive text-center'>  
              <a  
                  href={`/api/protocolos/${protocolo.rutaLocal.split('/').pop()}`}  
                  download={protocolo.titulo + ".pdf"}  // Descarga el archivo  
                  target="_blank"  
                  rel="noopener noreferrer"  
               
                >  
                  Descargar  
                </a>  
              </div>  */}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default CargarProtocolos
