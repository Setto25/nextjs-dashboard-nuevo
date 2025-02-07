'use client'; 
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
            router.push("/"); // o a la ruta que desees  
        } catch (err) {  
            console.error("Error al cerrar sesión:", err);  
        }  
    };  

    return <button onClick={handleLogout}>Cerrar Sesión</button>;  
}