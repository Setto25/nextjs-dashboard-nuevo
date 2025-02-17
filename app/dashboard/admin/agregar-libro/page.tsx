'use client'; 


import AgregarLibro from "@/app/components/operaciones-biblioteca/AgregarLibro";
import AgregarDocumento from "@/app/components/operaciones-documentos/AgregarDocumento";


export default function Page() {  



  return (  
      <div>  
          <AgregarLibro/>  {/*/ Importar el componente Tabs}*/}
            {/*/ Importar la función pasando el valor de la pestaña activa de "Tabs" almacenado en el store*/}
      </div>  
  );  
}