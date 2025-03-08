'use client'; 

  
import AgregarVideo from "@/app/components/operaciones-videos/AgregarVideo";
import { useRouter } from "next/navigation";



function Page() {  
  console.log('Componente Page montado');
  const router = useRouter(); // Initialize router

  return (  
      <div>  
          <AgregarVideo/>  {/*/ Importar el componente Tabs}*/}
            {/*/ Importar la función pasando el valor de la pestaña activa de "Tabs" almacenado en el store*/}
      </div>  
  );  
}
export default Page;  // Exportar el componente