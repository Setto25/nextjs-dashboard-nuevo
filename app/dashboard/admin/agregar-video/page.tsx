'use client'; 


  
import AgregarVideo from "@/app/components/operaciones-videos/AgregarVideo";
import useValueStore from "@/app/store/store";


export default function Page() {  
  // Extraer el valor dentro del cuerpo del componente  
  const { nuevoValor } = useValueStore();  // Extraer el valor del store

  return (  
      <div>  
          <AgregarVideo/>  {/*/ Importar el componente Tabs}*/}
            {/*/ Importar la función pasando el valor de la pestaña activa de "Tabs" almacenado en el store*/}
      </div>  
  );  
}