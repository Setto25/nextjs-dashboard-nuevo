'use client'; 

import { PowerIcon } from "lucide-react";
import { useRouter } from "next/navigation";  

export default function LogoutPage() {  
    const router = useRouter();  

    const handleLogout = async () => {  
        try {  
            // Llama a la API de logout  
            const response = await fetch("/api/autenticacion/logout", {  
                method: "POST",  
                credentials: "include", // Necesario para cookies, para mantener la sesión  
            });  

            if (!response.ok) {  
                const data = await response.json();  
                throw new Error(data.error || "Error al cerrar sesión");  
            }  

            // Redirige al usuario a la página de inicio o a la página de login  
            router.push("/"); 
        } catch (err) {  
            console.error("Error al cerrar sesión:", err);  
        }  
    };  

    return <div className="description-responsive flex flex-row justify-center items-center font-bold px-3 py-2 " onClick={handleLogout}> <PowerIcon className="w-6" /> <p className="ml-2 hidden md:block">Cerrar Sesión </p> 
</div>
}