'use client'; 


import { SelectExport2 } from "@/app/components/navegation/tabs_nav_admin";
import {useValueStore} from "@/app/store/store";
import TabsAdmin from "@/app/components/navegation/tabs-admin";


function Page() {  
  console.log('Componente Page montado');
  const { nuevoValor } = useValueStore();  // Extraer el valor del store
 
  return (  
      <div>  
     <div>  
            <TabsAdmin />  {/*/ Importar el componente Tabs}*/}
            {SelectExport2(nuevoValor)}  {/*/ Importar la función pasando el valor de la pestaña activa de "Tabs" almacenado en el store*/}
        </div>  
      </div>  
  );  
}
export default Page;  // Exportar el componente