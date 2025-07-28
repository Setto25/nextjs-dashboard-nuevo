'use client';

import { useValueMenuSeleccionadoStore} from '@/app/store/store';
import { useState, useEffect } from 'react';
import DocxViewer from '../docx_viewer/docx_viewer';
import '@/app/ui/global/containers.css'
import '@/app/ui/global/shadows.css'
import '@/app/ui/global/docx.css'
import '@/app/ui/global/texts.css'


// Interfaz de documento  
interface Documento {
  id: number;
  titulo: string;
  rutaLocal: string;
  descripcion?: string;
  fechaSubida: string;
  formato?: string;
}

function PaginaDocumentos() {


  const [documentos, setDocumentos] = useState<Documento[]>([]);
  const [cargando, setCargando] = useState(true);
  const {menuSeleccionado} = useValueMenuSeleccionadoStore();
  
console.log('El valor de menuSeleccionadoOOOOOO DOCUMENTO es:', menuSeleccionado);  // Verificar el valor de nuevoValor
  useEffect(() => {
      async function cargarDocumentos() {
      try {
        const response = await fetch(`/api/documents?q=${menuSeleccionado}&tipo=tema`);  // Realiza busqueda por q(termino) y por tema (tipo)
        const data = await response.json();
        console.log('EL DATA DOCUMENTO:', data);  // Verificar los documentos cargados
        setDocumentos(data);
      } catch (error) {
        console.error('Error cargando documentos', error);
      } finally {
        setCargando(false);
      }
    };

    cargarDocumentos();
  }, [menuSeleccionado]);

  console.log('El valor de menuSelecDOCUMENTOOO es:', documentos);  // Verificar el valor de nuevoValor
  if (cargando) return <p>Cargando documentos...</p>;

  return (
    <div className="container mx-auto px-4 py-6">
      <h1 className='subtitle-responsive py-4'>Documentos disponibles:</h1>

      {documentos.length === 0 ? (
        <div className="text-center text-gray-600">
          No hay documentos disponibles para este tema.
        </div>
      ) : (
        <div className="grid grid-cols-[repeat(auto-fit,minmax(350px,0.5fr))] gap-6 justify-center">
          {documentos.map((documento) => (
            <div key={documento.id} className='bg-white rounded-lg overflow-hidden transition-transform hover:scale-105 border-4 p-2 container-sombra'>
              <h2 className='subtitle-responsive multi-line-ellipsis-title'>{documento.titulo}</h2>
              <div className='documento__ p-2 bg-white '>

                {documento.rutaLocal && (
                  documento.rutaLocal.toLowerCase().endsWith('.docx') ? (
                    <div className="w-full h-0 md:h-fit mt-2 aspect-[8.5/11] overflow-auto">
                      <DocxViewer rutaLocal={documento.rutaLocal} />

                    </div>
                  ) : (
                    <iframe
                      src={`/api/documents/${documento.rutaLocal.split('/').pop()}`} 
                      className="w-full h-0 md:h-fit mt-2 aspect-[8.5/11]"
                      title={documento.titulo}
                    />
                  )
                )}

              </div>
              <div className='pt-4 px-2 space-y-2'>
                <p className='contenedor__descripcion small-text-responsive  multi-line-ellipsis h-16'>
                  <span className='font-bold'>Descripcion:</span> {documento.descripcion}
                </p>
              </div>
              <div className='contenedor__centrador flex flex-row justify-between items-center gap-2'>
                <button className="bg-blue-500 hover:bg-blue-700 text-white  py-1 rounded mt-4 w-full description-responsive" onClick={() => window.open(documento.rutaLocal, "_blank")}>
                  Abrir en nueva ventana
                </button>
                <div className='bg-blue-500 hover:bg-blue-700 text-white py-1 rounded mt-4 w-full description-responsive text-center'>
                  <a
                    href={documento.rutaLocal}
                    download={documento.titulo + '.pdf'}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Descargar
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default PaginaDocumentos;