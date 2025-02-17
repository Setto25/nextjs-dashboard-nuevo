'use client';  

import {useValueStore }from '@/app/store/store';
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

function CargarLibros() {  



  const selectTema = (seleccion: number) => {
    switch (seleccion) {
        case 0:
            return "reanimacion"; // Reanimación Neonatal
        case 1:
            return "cuidados_basicos"; // Cuidados Básicos Neonatales
        case 2:
            return "ventilacion_mecanica"; // Ventilación Mecánica
        case 3:
            return "administracion_medicamentos"; // Administración de Medicamentos
        case 4:
            return "instalacion_picc"; // Instalación de PICC
        case 5:
            return "lavado_manos"; // Lavado de Manos
        case 6:
            return "iass"; // IASS
        case 7:
            return "drenaje_pleural"; // Drenaje Pleural
        default:
            return "pagina no seleccionada"; // Mensaje por defecto si el índice no coincide
    }
}



  const [documentos, setDocumentos] = useState<Documento[]>([]);  
  const [cargando, setCargando] = useState(true);  
  const {nuevoValor }= useValueStore();  // Store con los valores de indica de pestañas



  useEffect(() => {  
    const cargarDocumentos = async () => {  
      try {  
        const response = await fetch(`/api/books?q=${selectTema(nuevoValor)}&tipo=tema`);  // Realiza busqueda por q(termino) y por tema (tipo)
        const data = await response.json();  
        
   
        setDocumentos(data);  
      } catch (error) {  
        console.error('Error cargando libros', error);  
      } finally {  
        setCargando(false);  
      }  
    };  


    cargarDocumentos();  
  }, [nuevoValor]);  

  if (cargando) return <p>Cargando documentos...</p>;  

  return (  
    <div>  
      <h1 className='subtitle-responsive py-4'>Libros disponibles:</h1>  
      <div className="grid grid-cols-[repeat(auto-fit,minmax(350px,0.5fr))] gap-6 justify-center">  
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
                )
              )}  

            </div>  
            <div className='pt-4 px-2 space-y-2'>  
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



export default CargarLibros;