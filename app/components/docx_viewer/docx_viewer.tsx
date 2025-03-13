import { useEffect, useRef, useState } from 'react';  
import { renderAsync } from 'docx-preview';  

interface DocxViewerProps {  
  rutaLocal: string;  
}  

export default function DocxViewer({ rutaLocal }: DocxViewerProps) {  
  const containerRef = useRef<HTMLDivElement>(null);  
  const [loading, setLoading] = useState(true);  
  const [error, setError] = useState<string | null>(null);  

  useEffect(() => {  
    async function loadDocument() {  
      try {  
        setLoading(true);  

        const response = await fetch(rutaLocal);  
        if (!response.ok) throw new Error('Error al cargar el documento');  

        const blob = await response.blob();  // se usa blob (binary large object) para representar archivos como iamgenes, documentos o videos
        const arrayBuffer = await blob.arrayBuffer();  // arrayBuffer permite trabajar con los datos binarios

        if (containerRef.current) {  
          await renderAsync(arrayBuffer, containerRef.current, undefined, {  //render async renderiza los datos binarios en el html (los datos del original docx)
            className: 'docx-content', 
            inWrapper: true,  
            ignoreWidth: true, // Cambiado a false para que respete el ancho  
            ignoreHeight: false,  
          });  
        }  
      } catch (err) {  // err nombre de mi variable que contiene el error
        console.error(err);  
        setError('Error al cargar el documento');  
      } finally {  
        setLoading(false);  
      }  
    }  

    loadDocument();  
  }, [rutaLocal]);  // indica que se vuelva a ejecutar el efecto (loadDcoument ene ste caso) si cambia la rutaLocal

  return (  
    <div className="relative w-full h-full bg-white overflow-hidden">  
      {loading && <p className="text-center">Cargando documento...</p>}  
      {error && <p className="text-red-500 text-center">{error}</p>}   
      <div   
        ref={containerRef}   
        className="docx-container"   
      />  
    </div>  
  );  
}

