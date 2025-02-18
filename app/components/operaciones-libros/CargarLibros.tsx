'use client';  

import {useValueStore }from '@/app/store/store';
import { useState, useEffect } from 'react';  
import DocxViewer from '../docx_viewer/docx_viewer';
import '@/app/ui/global/containers.css'
import '@/app/ui/global/shadows.css'
import '@/app/ui/global/docx.css'
import '@/app/ui/global/texts.css'
  
  


// Interfaz de libro  
interface Libro {  
  id: number;  
  titulo: string;  
  rutaLocal: string;  
  descripcion?: string;  
  fechaSubida: string;  
  formato?: string;  
}  

function CargarLibros() {  


  const [libros, setLibros] = useState<Libro[]>([]);  
  const [cargando, setCargando] = useState(true);  
  const {nuevoValor }= useValueStore();  // Store con los valores de indica de pestañas



  useEffect(() => {  
    const cargarLibros = async () => {  
      try {  
        const response = await fetch(`/api/books?tipo=todos`);  // Realiza busqueda por q(termino) y por tema (tipo)
        const data = await response.json();  
        
   
        setLibros(data);  
      } catch (error) {  
        console.error('Error cargando libros', error);  
      } finally {  
        setCargando(false);  
      }  
    };  


    cargarLibros();  
  }, [nuevoValor]);  

  if (cargando) return <p>Cargando libros...</p>;  

  return (  
    <div>  
      <h1 className='subtitle-responsive py-4'>Libros disponibles:</h1>  
      <div className="grid grid-cols-[repeat(auto-fit,minmax(350px,0.5fr))] gap-6 justify-center">  
        {libros.map((libro) => (  
          <div key={libro.id} className='bg-white rounded-lg overflow-hidden transition-transform hover:scale-105 border-4 p-2 container-sombra'>  
            <h2 className='subtitle2-responsive multi-line-ellipsis-title'>{libro.titulo}</h2>  
            <div className='libro__ p-2 bg-white '>  

              {libro.rutaLocal && (  
                libro.rutaLocal.toLowerCase().endsWith('.docx') ? (  
                  <div className="w-full h-fit mt-2 aspect-[8.5/11] overflow-auto">  
                    <DocxViewer rutaLocal={libro.rutaLocal} /> 
                   
                  </div>  
                ) : (  
                  <iframe  
                    src={libro.rutaLocal}  
                    className="w-full h-fit mt-2 aspect-[8.5/11]"  
                    title={libro.titulo}  
      

                  />  
                )
              )}  

            </div>  
            <div className='pt-4 px-2 space-y-2'>  
              <p className='contenedor__descripcion small-text-responsive  multi-line-ellipsis h-16'>  
                <span className='font-bold'>Descripcion:</span> {libro.descripcion}  
              </p>  
            </div>  
            <div className='contenedor__centrador flex flex-row justify-center'>  
              <div className='contenedor__descarga font-bold small-text-responsive p-2 items-center bg-slate-300 m-2'>  
                <a  
                  href={libro.rutaLocal}  
                  download={libro.titulo + (libro.formato ? `.${libro.formato}` : '')}  
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