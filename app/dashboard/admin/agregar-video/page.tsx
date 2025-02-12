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
/*

    // Verificar autenticación al montar el componente
  useEffect(() => {
    const checkAuth1 = async () => {
      try {
        const resp = await fetch('/api/autenticacion/me', { // Verificar si el usuario está autenticado

          credentials: 'include' // Enviar cookies

        });

        if (!resp.ok) throw new Error("dddddd");
        const {user} = await resp.json();
        console.log('EL USER ES A-V:', user);

        if (user.role !== "admin") {// Verificar si el usuario es administrador
          console.log('EL USER ES A-V:', user.role);
          router.push('/dasboard'); // Redirigir al usuario a la página de inicio de sesión
        }
      } catch (error) {
        router.push('/dashboard'); // Redirigir al usuario a la página de inicio de sesión
      }
    };

    checkAuth1(); // Llamar a la función
  }, [router]);*/

  return (  
      <div>  
          <AgregarVideo/>  {/*/ Importar el componente Tabs}*/}
            {/*/ Importar la función pasando el valor de la pestaña activa de "Tabs" almacenado en el store*/}
      </div>  
  );  
}
export default Page;  // Exportar el componente