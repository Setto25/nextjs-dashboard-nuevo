'use client';  

import useValueStore from '@/app/store/store';
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
  const nuevoValor = useValueStore();  

  useEffect(() => {  
    const cargarDocumentos = async () => {  
      try {  
        const response = await fetch(`/api/documents?tema=${nuevoValor}`);  
        const data = await response.json();  
        setDocumentos(data);  
      } catch (error) {  
        console.error('Error cargando documentos', error);  
      } finally {  
        setCargando(false);  
      }  
    };  

    cargarDocumentos();  
  }, [nuevoValor]);  

  if (cargando) return <p>Cargando documentos...</p>;  

  return (  
    <div>  
      <h1 className='subtitle-responsive py-4'>Documentos disponibles:</h1>  
      <div className="grid grid-cols-[repeat(auto-fit,minmax(400px,1fr))] gap-6">  
        {documentos.map((documento) => (  
          <div key={documento.id} className='bg-white rounded-lg overflow-hidden transition-transform hover:scale-105 border-4 p-2 container-sombra'>  
            <h2 className='subtitle2-responsive multi-line-ellipsis-title'>{documento.titulo}</h2>  
            <div className='documento__ p-2 bg-white '>  

              {documento.rutaLocal && (  
                documento.rutaLocal.toLowerCase().endsWith('.docx') ? (  
                  <div className="w-full h-fit mt-2 aspect-[8.5/11] overflow-auto">  
                    <DocxViewer rutaLocal={documento.rutaLocal} />  
                  </div>  
                ) : (  
                  <iframe  
                    src={documento.rutaLocal}  
                    className="w-full h-fit mt-2 aspect-[8.5/11]"  
                    title={documento.titulo}  
                  />  
                )/* : documento.rutaLocal.toLowerCase().endsWith('.txt') ? (  
                  <TextViewer rutaLocal={documento.rutaLocal} />  
                ) : (  
                  <div className="p-4 bg-gray-100 rounded-md shadow-md">  
                    <pre className="whitespace-pre-wrap font-mono text-sm h-fit">{documento.rutaLocal}</pre>  
                  </div>  
                )  */
              )}  

            </div>  
            <div className='pt-4 px-2'>  
              <p className='contenedor__descripcion small-text-responsive  multi-line-ellipsis h-16'>  
                <span className='font-bold'>Descripcion:</span> {documento.descripcion}  
              </p>  
            </div>  
            <div className='contenedor__centrador flex flex-row justify-center'>  
              <div className='contenedor__descarga font-bold small-text-responsive p-2 items-center bg-slate-300 m-2'>  
                <a  
                  href={documento.rutaLocal}  
                  download={documento.titulo + (documento.formato ? `.${documento.formato}` : '')}  
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
    </div>  
  );  
}  

/*// Componente para visualizar archivos .txt  
const TextViewer = ({ rutaLocal }: { rutaLocal: string }) => {  
  const [contenido, setContenido] = useState<string>('');  
  const [cargando, setCargando] = useState<boolean>(true);  
  const [error, setError] = useState<string | null>(null);  

  useEffect(() => {  
    const cargarContenido = async () => {  
      try {  
        const respuesta = await fetch(rutaLocal);  
        if (respuesta.ok) {  
          const texto = await respuesta.text();  
          setContenido(texto);  
        } else {  
          throw new Error('Error al cargar el archivo de texto.');  
        }  
      } catch (err) {  
        setError('Error al cargar el archivo de texto.');  
      } finally {  
        setCargando(false);  
      }  
    };  

    cargarContenido();  
  }, [rutaLocal]);  

  if (cargando) return <p>Cargando contenido del archivo...</p>;  

  if (error) return <p>{error}</p>;  

  return (  
    <div className="p-4 bg-gray-100 rounded-md shadow-md">  
      <pre className="whitespace-pre-wrap font-mono text-sm">{contenido}</pre>  
    </div>  
  );  
};  */

export default PaginaDocumentos;