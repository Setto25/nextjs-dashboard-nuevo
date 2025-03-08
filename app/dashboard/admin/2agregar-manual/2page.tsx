'use client'; 


import AgregarDocumento from "@/app/components/operaciones-documentos/AgregarDocumento";
import AgregarManual from "@/app/components/operaciones-manuales/AgregarManual";


export default function Page() {  



  return (  
      <div>  
          <AgregarManual/>  {/*/ Importar el componente Tabs}*/}
            {/*/ Importar la función pasando el valor de la pestaña activa de "Tabs" almacenado en el store*/}
      </div>  
  );  
}