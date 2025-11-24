'use client';

import { useValueMenuSeleccionadoStore} from '@/app/store/store';
import { useState, useEffect } from 'react';
import DocxViewer from '../docx_viewer/docx_viewer';
import '@/app/ui/global/containers.css'
import '@/app/ui/global/shadows.css'
import '@/app/ui/global/docx.css'
import '@/app/ui/global/texts.css'


// Interfaz de plantilla  
interface Plantilla {
  id: number;
  titulo: string;
  url: string;
  portada?: string;
  descripcion?: string;
  fechaSubida: string;
  formato?: string;
}

function PaginaPlantillas() {


  const [plantillas, setPlantillas] = useState<Plantilla[]>([]);
  const [cargando, setCargando] = useState(true);
  const {menuSeleccionado} = useValueMenuSeleccionadoStore();
  
console.log('El valor de menuSeleccionadoOOOOOO DOCUMENTO es:', menuSeleccionado);  // Verificar el valor de nuevoValor
  useEffect(() => {
      async function cargarPlantillas() {
      try {
        const response = await fetch(`/api/documents?q=${menuSeleccionado}&tipo=tema`);  // Realiza busqueda por q(termino) y por tema (tipo)
        const data = await response.json();
        console.log('EL DATA DOCUMENTO:', data);  // Verificar los plantillas cargados
        setPlantillas(data);
      } catch (error) {
        console.error('Error cargando plantillas', error);
      } finally {
        setCargando(false);
      }
    };

    cargarPlantillas();
  }, [menuSeleccionado]);

  console.log('El valor de menuSelecDOCUMENTOOO es:', plantillas);  // Verificar el valor de nuevoValor
  if (cargando) return <p>Cargando plantillas...</p>;

  return (
    <div className="container mx-auto px-4 py-6">
      <h1 className='subtitle-responsive py-4'>Plantillas disponibles:</h1>

      {plantillas.length === 0 ? (
        <div className="text-center text-gray-600">
          No hay plantillas disponibles para este tema.
        </div>
      ) : (
        <div className="grid grid-cols-[repeat(auto-fit,minmax(350px,0.5fr))] gap-6 justify-center">
          {plantillas.map((plantilla) => (
            <div key={plantilla.id} className='bg-white rounded-lg overflow-hidden transition-transform hover:scale-105 border-4 p-2 container-sombra'>
              <h2 className='subtitle-responsive multi-line-ellipsis-title'>{plantilla.titulo}</h2>
              <div className='plantilla__ p-2 bg-white '>

                {plantilla.url && (
                  plantilla.url.toLowerCase().endsWith('.docx') ? (
                    <div className="w-full h-fit md:h-fit mt-2 aspect-[8.5/11] overflow-auto">
                      <DocxViewer rutaLocal={plantilla.url} />

                    </div>
                  ) : (
                    <img
                      src={plantilla.portada} 
                      alt={`Portada de  ${plantilla.titulo}`}
                      loading='lazy'
                   className="w-full h-full object-cover object-top mt-2 aspect-[8.5/11] rounded"
                   onClick={() => window.open(plantilla.url, "_blank")}
                     
                    />
                  )
                )}

              </div>
              <div className='pt-4 px-2 space-y-2'>
                <p className='contenedor__descripcion small-text-responsive  multi-line-ellipsis h-16'>
                  <span className='font-bold'>Descripcion:</span> {plantilla.descripcion}
                </p>
              </div>
              <div className='contenedor__centrador flex flex-row justify-between items-center gap-2'>
                <button className="bg-blue-500 hover:bg-blue-700 text-white  py-1 rounded mt-4 w-full description-responsive" onClick={() => window.open(plantilla.url, "_blank")}>
                  Abrir en nueva pestaña
                </button>
               {/*  <div className='bg-blue-500 hover:bg-blue-700 text-white py-1 rounded mt-4 w-full description-responsive text-center'>
                  <a
                    href={`/api/documents/${plantilla.rutaLocal.split('/').pop()}`}
                    download={plantilla.titulo + '.pdf'}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Descargar
                  </a>
                </div> */}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default PaginaPlantillas;