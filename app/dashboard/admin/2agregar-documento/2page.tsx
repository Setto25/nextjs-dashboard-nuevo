'use client'; 


import AgregarDocumento from "@/app/components/operaciones-documentos/AgregarDocumento";


export default function Page() {  



  return (  
      <div>  
          <AgregarDocumento/>  {/*/ Importar el componente Tabs}*/}
            {/*/ Importar la función pasando el valor de la pestaña activa de "Tabs" almacenado en el store*/}
      </div>  
  );  
}