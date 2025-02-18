

import { useState, useEffect } from 'react';  
import DocxViewer from '../docx_viewer/docx_viewer';
import '@/app/ui/global/containers.css'
import '@/app/ui/global/shadows.css'
import '@/app/ui/global/docx.css'
import '@/app/ui/global/texts.css'
  
  


// Interfaz de manual  
interface Manual {  
  id: number;  
  titulo: string;  
  rutaLocal: string;  
  descripcion?: string;  
  fechaSubida: string;  
}  

function CargadorManuales() {  


  const [manuales, setManuales] = useState<Manual[]>([]);  
  const [cargando, setCargando] = useState(true);  
  
  //const {nuevoValor }= useValueStore();  // Store con los valores de indica de pestañas



  useEffect(() => {  
    const cargarManuales = async () => {  
      try {  
        const response = await fetch(`/api/manuals?tipo=todos`);  // Realiza busqueda por q(termino) y por tema (tipo)
        const data = await response.json();  
        console.log("LA RUTA", data)
   
        setManuales(data);  
        console.log("LOGA CARGA MANULAES", data)
      } catch (error) {  
        console.error('Error cargando libros', error);  
      } finally {  
        setCargando(false);  
      }  
    };  


    cargarManuales();  
  },[]);  

  if (cargando) return <p>Cargando manuales...</p>;  

  return (  
    <div>  
      <h1 className='subtitle-responsive py-4'>Manuales disponibles:</h1>  
      <div className="grid grid-cols-[repeat(auto-fit,minmax(350px,0.5fr))] gap-6 justify-center">  
        {manuales.map((manual) => (  
          <div key={manual.id} className='bg-white rounded-lg overflow-hidden transition-transform hover:scale-105 border-4 p-2 container-sombra'>  
            <h2 className='subtitle2-responsive multi-line-ellipsis-title'>{manual.titulo}</h2>  
            <div className='documento__ p-2 bg-white '>  

              {manual.rutaLocal && (  
                manual.rutaLocal.toLowerCase().endsWith('.docx') ? (  
                  <div className="w-full h-fit mt-2 aspect-[8.5/11] overflow-auto">  
                    <DocxViewer rutaLocal={manual.rutaLocal} /> 
                
                   
                  </div>  
                ) : (  
                  <iframe  
                    src={manual.rutaLocal}  
                    className="w-full h-fit mt-2 aspect-[8.5/11]"  
                    title={manual.titulo}  
      

                  />  
                )
              )}  

            </div>  
            <div className='pt-4 px-2 space-y-2'>  
              <p className='contenedor__descripcion small-text-responsive  multi-line-ellipsis h-16'>  
                <span className='font-bold'>Descripcion:</span> {manual.descripcion}  
              </p>  
            </div>  
            <div className='contenedor__centrador flex flex-row justify-center'>  
              <div className='contenedor__descarga font-bold small-text-responsive p-2 items-center bg-slate-300 m-2'>  
                <a  
                  href={manual.rutaLocal}  
                  download={manual.titulo + ".pdf"}  
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



export default CargadorManuales;