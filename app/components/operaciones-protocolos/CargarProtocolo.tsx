'use client';  


import { useState, useEffect } from 'react';  
import DocxViewer from '../docx_viewer/docx_viewer'; // Asegúrate de que este componente es adecuado para visualizar protocolos  
import '@/app/ui/global/containers.css';  
import '@/app/ui/global/shadows.css';  
import '@/app/ui/global/docx.css';  
import '@/app/ui/global/texts.css'; 
import '@/app/ui/global/grids.css';   
import { useValueProtocol } from '@/app/store/store';

// Interfaz de documento de protocolo  
interface Protocolo {  
  id: number;  
  titulo: string;  
  rutaLocal: string;  // Cambiado de rutaLocal a archivo  
  descripcion?: string;  
  fechaCreacion: string;  
  version: string;  
  creadoPor: string;  
}  

function CargarProtocolos() {  
  const {numeroP} = useValueProtocol();  


const selectCategory= (seleccion:number)=>{
    switch(seleccion){  
            case 0:  
                return "cuidados_generales";  // Llame a la función correspondiente  
            case 1:  
                return "soporte_respiratorio"; // Llame a la función correspondiente  
            case 2:  
                return "manejo_infecciones";   // Llame a la función correspondiente  
            case 3:  
                return "nutricion_alimentacion"; // Llame a la función correspondiente  
            case 4:  
                return "administracion_medicamentos"; // Llame a la función correspondiente  
            case 5:  
                return "procedimientos_invasivos"; // Llame a la función correspondiente  
            case 6:  
                return "cuidados_piel_termoregulacion"; // Llame a la función correspondiente  
            case 7:  
                return "monitorizacion_uci"; // Llame a la función correspondiente  
            default:  
                return <p>Página no seleccionada</p>;  
        }  
    
      }

  const [protocolos, setProtocolos] = useState<Protocolo[]>([]);  
  const [cargando, setCargando] = useState(true);  


  useEffect(() => {  
    const cargarProtocolo = async () => {  
      try {  
        const response = await fetch(`/api/protocolos?q=${selectCategory(numeroP)}&tipo=categoria`);  // en EndpoinT recibe dos parametros, termino y tipo
        const data = await response.json();  
        console.log("EL DATA DE PROTOCOLOS ES:", data)
        setProtocolos(data);  
      } catch (error) {  
        console.error('Error cargando protocolos:', error);  
      } finally {  
        setCargando(false);  
      }  
    };  

    cargarProtocolo();  
  }, [numeroP]);  

  if (cargando) return <p>Cargando protocolos...</p>;  

  return (  
    <div>  
      <h1 className='subtitle-responsive py-4'>Protocolos disponibles:</h1>  
      <div className="grid grid-cols-[repeat(auto-fit,minmax(400px,0.3fr))] gap-6">  
        {protocolos.map((protocolo) => (  
          <div key={protocolo.id} className='bg-white rounded-lg overflow-hidden transition-transform hover:scale-105 border-4 p-2 container-sombra'>  
            <h2 className='subtitle2-responsive multi-line-ellipsis-title'>{protocolo.titulo}</h2>  
            <div className='documento__ p-2 bg-white '>  

              {protocolo.rutaLocal && (  
                protocolo.rutaLocal.toLowerCase().endsWith('.pdf') ? (  
                  <iframe  
                    src={protocolo.rutaLocal}  
                    className="w-full h-30 mt-2 aspect-[8.5/11]"  
                    title={protocolo.titulo}  
                  />  
                ) : (  
                  <DocxViewer rutaLocal={protocolo.rutaLocal} />  
                )  
              )}  

            </div>  
            <div className='pt-4 px-2 space-y-2'>  
              <p className='contenedor__descripcion small-text-responsive multi-line-ellipsis '>  
                <span className='font-bold'>Descripción:</span> {protocolo.descripcion}  
              </p>  
              <p className='contenedor__descripcion small-text-responsive multi-line-ellipsis'>  
                <span className='font-bold'>Creado por:</span> {protocolo.creadoPor}  
              </p>  
              <p className='contenedor__descripcion small-text-responsive multi-line-ellipsis'>  
                <span className='font-bold'>Versión:</span> {protocolo.version}  
              </p>  
            </div>  
            <div className='contenedor__centrador flex flex-row justify-center'>  
            <div className='contenedor__descarga font-bold small-text-responsive p-2 items-center bg-slate-300 m-2'>  
                <a  
                  href={protocolo.rutaLocal}  
                  download={protocolo.titulo + ".pdf"}  // Descarga el archivo  
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

export default CargarProtocolos;