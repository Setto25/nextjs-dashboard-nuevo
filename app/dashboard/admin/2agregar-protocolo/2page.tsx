'use client'; 


import AgregarDocumento from "@/app/components/operaciones-documentos/AgregarDocumento";
import AgregarProtocolo from "@/app/components/operaciones-protocolos/AgregarProtocolo";
import { useValueStore } from "@/app/store/store";



export default function Page() {  
  // Extraer el valor dentro del cuerpo del componente  
  const { nuevoValor } = useValueStore();  // Extraer el valor del store

  return (  
      <div>  
          <AgregarProtocolo/>  {/*/ Importar el componente Tabs}*/}
            {/*/ Importar la función pasando el valor de la pestaña activa de "Tabs" almacenado en el store*/}
      </div>  
  );  
}