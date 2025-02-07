'use client'; 

  
import AgregarVideo from "@/app/components/operaciones-videos/AgregarVideo";
import useValueStore from "@/app/store/store";
import { useRouter } from "next/navigation";
import { useEffect } from "react";


function Page() {  
  console.log('Componente Page montado');
  const router = useRouter(); // Initialize router
  // Extraer el valor dentro del cuerpo del componente  
  //const { nuevoValor } = useValueStore();  // Extraer el valor del store


    // Verificar autenticación al montar el componente
    useEffect(() => {
      const checkAuth = async () => {
        try {
          const res = await fetch('/api/autenticacion/me', { // Verificar si el usuario está autenticado
            
            credentials: 'include' // Enviar cookies
            
          });
          console.log( 'EL USER ES A-V RES:',res);
          if (!res.ok) throw new Error("No se pudo verificar la autenticación");
          const {user} = await res.json(); //Se usa destructuring para extraer el valor de user, ya que user contendria user
          console.log( 'EL USER ES A-V:',user.role);
          
          if (user.role !== "admin") {// Verificar si el usuario es administrador
            console.log( 'EL USER.ROLE ES A-V:', user.role);
            router.push('/'); // Redirigir al usuario a la página de inicio de sesión
          }
        } catch (error) {
          router.push('/'); // Redirigir al usuario a la página de inicio de sesión
        }
      };
  
      checkAuth(); // Llamar a la función
    }, [router]);

  return (  
      <div>  
          <AgregarVideo/>  {/*/ Importar el componente Tabs}*/}
            {/*/ Importar la función pasando el valor de la pestaña activa de "Tabs" almacenado en el store*/}
      </div>  
  );  
}
export default Page;  // Exportar el componente