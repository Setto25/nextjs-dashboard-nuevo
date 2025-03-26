// SearchUsers.tsx  
'use client';

import { useEffect, useState } from "react";
import Cookies from 'js-cookie';
import '@/app/ui/global/texts.css';
import '@/app/ui/global/containers.css';
import { useValueCookies } from "@/app/store/store";
import { NextRequest, NextResponse } from "next/server";
import { toast } from "react-toastify";


/*  
Este componente permite buscar usuarios en la base de datos  
mediante un formulario con múltiples filtros y mostrar los resultados.  
*/

// Interfaz de Usuario  
interface User {
    id: number;
    rut: string;
    nombre: string;
    apellido1: string;
    apellido2: string;
    email: string;
    role: string;
    createdAt: string;
    updatedAt: string;
    deletedAt?: string | null; // Puede ser undefined o null si no está eliminado  
}



function PerfilUsuario() {
    const [termino, setTermino] = useState('');
    const [tipo, setTipo] = useState('todos');
    const [usuario, setUsuarios] = useState<User | null>(null);
    const [cargando, setCargando] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [idCookie, setIdCookie] = useState<string | null>(null);  // Extraer el valor del store
    const [contraseña, setContraseña] = useState(""); // Almacena el texto ingresado en el campo de búsqueda
    const [mostrarContraseña, setMostrarContraseña] = useState(false);
    const [confirmarContraseña, setConfirmarContraseña] = useState("");
    const [mostrarCampo, setMostrarCampo] = useState(false); // Controla la visibilidad del campo de búsqueda
   /* const manejarCambioTexto = (e: React.ChangeEvent<HTMLInputElement>) => {
        setContraseña(e.target.value); // Actualiza el texto ingresado
    };*/

    const cambiarVisibilidadContraseña = () => {
        setMostrarContraseña((prev) => !prev);
    };



const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); 
    if (contraseña !== confirmarContraseña) {
        toast.error("Las contraseñas no coinciden");  
        return;
    }

        // Llamar a la función CambiarContraseña
        if (usuario?.id) {
            await CambiarContraseña(usuario.id, contraseña);
            toast.success("Contraseña cambiada con éxito");
        } else {
            toast.error("No se pudo obtener el ID del usuario");
        }
}

    async function fetchSession() {
        try {
            const response = await fetch('/api/autenticacion/validacion-sesion', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                console.error('Error al validar la sesión');
                window.location.href = '/login'; // Redirigir si no hay sesión
                return;
            }

            const data = await response.json();
            // setIdCookie(data.id); // Establecer el ID de la cookie en el store
            console.log('Sesión válida:', data.id);

            const response2 = await fetch(`/api/users/${data.id}`,
                {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                    }
                }
            );  // Cambié la URL para apuntar a la API de usuarios
            const dataUser = await response2.json();
            setUsuarios(dataUser);
            console.log('Usuarios cargados:', dataUser);



        } catch (error) {
            console.error('Error al obtener la sesión:', error);
            window.location.href = '/login'; // Redirigir si ocurre un error
        }
    }

    console.log('Usuarios cargados2:', usuario);
    useEffect(() => {
        fetchSession();
    }, []); // Llamar a la función al cargar el componente

    const CambiarContraseña = async (id: number, nuevaContraseña: string) => {
        setCargando(true);
        try {
            const url = `/api/users/${id}`;  // Cambié la URL para apuntar a la API de protocolos  
            const response = await fetch(url, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ password: nuevaContraseña }), // Datos a actualizar
            });

            if (!response.ok) {
                throw new Error(`Error al eliminar protocolo: ${response.status}`);
            }

            // Actualiza el estado para eliminar el protocolo de la lista mostrada  
            //  setUsuarios(prev => prev.filter(usuario => usuario.id !== id));  

        } catch (error) {
            console.error("Error al eliminar protocolo", error);
            setError(error instanceof Error ? error.message : 'Error desconocido');
        } finally {
            setCargando(false);
        }
    };

    return (

            <div className="h-96">
                    <div className="resultados bg-white shadow-md p-4 my-1 rounded-md description-responsive" key={usuario?.id}>
                        <h3 className="subtitle-responsive pb-2">Mi perfil de usuario</h3>
                        <p className="descrption-responsive font-bold">Nombre de usuario: {`${usuario?.nombre} ${usuario?.apellido1} ${usuario?.apellido2}`} </p>
                        <p className="descrption-responsive font-bold" >RUT: {usuario?.rut}</p>
                        <p className="descrption-responsive font-bold">Email: {usuario?.email}</p>
                        <p className="descrption-responsive font-bold">Rol: {usuario?.role}</p>
                    </div>
                


                {/* Botón para mostrar el campo de texto y el segundo botón */}

                <button
                    className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                    onClick={() => setMostrarCampo(true)}
                >
                    Cambiar Contraseña
                </button>

                {/* Mostrar el campo de texto y el botón adicional si `mostrarCampo` es true */}
      {mostrarCampo && (
 <form onSubmit={handleSubmit} className="container__fomr flex flex-wrap py-4 description-responsive just ">  
    <div className="flex flex-col">
        <input
            type={mostrarContraseña ? "text" : "password"}
            placeholder="introduzca la nueva contraseña"
            value={contraseña}
            onChange={(e) => setContraseña(e.target.value)}
            required
            className="w-full p-2 border rounded description-responsive "
        />
        
        <button
            type="button"
            onClick={cambiarVisibilidadContraseña}
            className=" flex justify-end pt-1 text-black description-responsive "
        >
            {mostrarContraseña ? "Ocultar contraseñas" : "Mostrar contraseñas"}
        </button>

        {/* Campo de confirmación de contraseña */}
        <div className="">
            <input
                type={mostrarContraseña ? "text" : "password"}
                placeholder="Confirme la nueva Contraseña"
                value={confirmarContraseña}
                onChange={(e) => setConfirmarContraseña(e.target.value)}
                required
                className="w-full border rounded description-responsive "
            />
        </div>



            <button
                className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded mt-2 description-responsive "
                onClick={() => CambiarContraseña(Number(usuario?.id), contraseña)}
            >
                Aceptar
            </button>
        </div>

    </form>
)}
                

            </div>




    )
}

export default PerfilUsuario;