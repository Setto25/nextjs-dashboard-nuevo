'use client'; 

  
import AgregarVideo from "@/app/components/operaciones-videos/AgregarVideo";

import SearchUsers from "./buscar-usuarios/SearchUsers";
import RegistroUsuarios from "./registro-usuario/RegistroUsuarios";
import PaginaBusqueda from "@/app/components/search/BuscadorArchivos";
import Tabs from "@/app/components/navegation/tabs";
import { SelectExport2 } from "@/app/components/navegation/tabs_nav_admin";
import useValueStore from "@/app/store/store";
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