// SearchUsers.tsx  
'use client';  

import { useState } from "react";  
import '@/app/ui/global/texts.css';
import '@/app/ui/global/containers.css';

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

function SearchUsers() {  
    const [termino, setTermino] = useState('');
    const [tipo, setTipo] = useState('todos');
   /* const [nombre, setNombre] = useState('');  
    const [apellido, setApellido] = useState('');  
    const [email, setEmail] = useState('');  
    const [role, setRole] = useState('');  */
    const [usuarios, setUsuarios] = useState<User[]>([]);  
    const [cargando, setCargando] = useState(false);  
    const [error, setError] = useState<string | null>(null);  

    const buscarUsuarios = async () => {  

        
        if (!termino.trim()) return;
        
        setCargando(true);  
        setError(null);  
        setUsuarios([]);  


        try {  
            // Construir URL de búsqueda con los parámetros de filtro  
            const url = new URL('/api/users', window.location.origin);  
            url.searchParams.append('q', termino);
            url.searchParams.append('tipo', tipo);

/*
            if (nombre) url.searchParams.append('nombre', nombre);  
            if (apellido) url.searchParams.append('apellido', apellido);  
            if (email) url.searchParams.append('email', email);  
            if (role) url.searchParams.append('role', role);  */

            const response = await fetch(url.toString(), {  
                method: 'GET',  
                headers: {  
                    'Accept': 'application/json'  
                }  
            });  

            if (!response.ok) {  
                throw new Error(`Error: ${response.status}`);  
            }  

            const resultados: User[] = await response.json();  
            console.log("ALMACENAMIENTO RESULTADOS", resultados)
            setUsuarios(resultados);  
        } catch (error) {  
            console.error("Error al buscar usuarios", error);  
            setError(error instanceof Error ? error.message : 'Error desconocido');  
            setUsuarios([]);  
        } finally {  
            setCargando(false);  
        }  
    }  

    return (  
        <div className="flex-container container-formulario-global bg-gray-100 p-6">  
            {/* Instrucciones para buscar usuarios */}  
            <div className="Intrucciones__registro container-formulario-parte1">  
                <p className="subtitle-responsive font-semibold text-gray-800 mb-4">En esta sección podrá buscar usuarios en la base de datos...</p>  
                {/* Lista de pasos */}  
                <ol className="container-listado">  
                    {/* Paso 1: Completar filtros de búsqueda */}  
                    <li className="bg-white p-4 rounded-md shadow-sm">  
                        <h3 className="font-bold text-blue-600 mb-2">1. Complete los filtros de búsqueda.</h3>  
                        <ul className="list-disc list-inside pl-4 space-y-1">  
                            <li>Ingrese el nombre, apellido o email del usuario que desea buscar.</li>  
                            <li>Seleccione el rol del usuario, si es necesario.</li>  
                            <li>Presione el botón "Buscar" para realizar la búsqueda.</li>  
                        </ul>  
                    </li>  
                    {/* Paso 2: Revisar resultados */}  
                    <li className="bg-white p-4 rounded-md shadow-sm">  
                        <h3 className="font-bold text-blue-600 mb-2">2. Revise los resultados.</h3>  
                        <ul className="list-disc list-inside pl-4 space-y-1">  
                            <li>Los resultados se mostrarán debajo del formulario.</li>  
                            <li>Si no se encuentran resultados, intente ajustar los filtros.</li>  
                        </ul>  
                        <p className="mt-6 text-green-700 description-responsive">¡Listo! Haga clic en "Buscar" para encontrar usuarios.</p>  
                    </li>  
                    <li className="bg-white p-4 rounded-md shadow-sm">  
            <h3 className="font-bold text-blue-600 mb-2">3. Eliminar usuarios.</h3>  
            <ul className="list-disc list-inside pl-4 space-y-1">  
                <li>Para eliminar un usuario, haga clic en el botón "Eliminar".</li>  
                <li>Confirme la acción en el mensaje que aparece.</li>  
                <li>Recuerde que la eliminación es irreversible.</li>  
            </ul>  
        </li>  
                </ol>  
           
            </div>  

            {/* Formulario de búsqueda */}  
            <div className="Formulario__agregar conatiner-formulario-parte2 ">  
                <form onSubmit={(e) => { e.preventDefault(); buscarUsuarios(); }} className="container-form">  
                    <div className="flex flex-col space-y-4">  
                      


                    <div className="w-full">
                    <input
                    className="flex w-full"
                        value={termino}
                        onChange={(e) => setTermino(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && buscarUsuarios()}
                        placeholder="Ingrese el término a buscar"
                    />
                </div>

                <div>
                    <select
                        value={tipo}
                        onChange={(e) => setTipo(e.target.value)}
                        className="w-full"
                    >
                        <option value="todos">Buscar en Todo</option>
                        <option value="rut">Rut</option>
                        <option value="nombre">Por Nombre</option>
                        <option value="apellido1">1er apellido</option>
                        <option value="apellido2">2do apellido</option>
                        <option value="role">Rol de usuario</option>
                    </select>
                </div>

{}
                     
                    </div>  
                    <button  
                        type="submit"  
                        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mt-4 w-full"  
                    >  
                        Buscar  
                    </button>  
                </form>  
            </div>  

            {/* Resultados de búsqueda */}  
            <div className="resultados w-full mt-5">  
            <p className="subtitle2-responsive">Resultados:</p>
                {error && <p style={{ color: 'red' }}>{error}</p>}  

                {cargando ? (  
                    <p>Buscando...</p>  
                ) : usuarios.length === 0 ? (  
                    <p>No se encontraron resultados.</p>  
                ) : (  
                    
                    <div className="h-96 overflow-y-scroll">  
                        {usuarios.map((usuario) => (  
                            <div className="resultados bg-white shadow-md p-4 my-1 rounded-md description-responsive" key={usuario.id}>  
                                <h3 className="font-bold text-black ">{`${usuario.nombre} ${usuario.apellido1}`} (RUT: {usuario.rut})</h3>  
                                <p><strong>Email:</strong> {usuario.email}</p>  
                                <p><strong>Rol:</strong> {usuario.role}</p>  
                                <p><strong>Fecha de Creación:</strong> {new Date(usuario.createdAt).toLocaleString()}</p>  
                                <p><strong>Última Actualización:</strong> {new Date(usuario.updatedAt).toLocaleString()}</p>  
                                <p><strong>Fecha de Eliminación:</strong> {usuario.deletedAt ? new Date(usuario.deletedAt).toLocaleString() : 'No eliminado'}</p>  
                            </div>  
                        ))}  
                    </div>  
                )}  
            </div>  
        </div>  
    );  
}  

export default SearchUsers;