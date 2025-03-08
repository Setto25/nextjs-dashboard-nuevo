// app/registro/page.tsx
'use client';
import { useState } from "react";
import { useRouter } from "next/navigation";
import '@/app/ui/global/containers.css';
import '@/app/ui/global/texts.css';
import { toast } from "react-toastify";

export default function RegistroUsuarios() {  
  const [rut0, setRut] = useState("");  
  const [df, setDf] = useState("");  
  const [nombre, setNombre] = useState("");  
  const [apellido1, setApellido1] = useState("");  
  const [apellido2, setApellido2] = useState("");  
  const [email, setEmail] = useState("");  
  const [password, setPassword] = useState("");  
  const [role, setRole] = useState("");  
  const [showPassword, setShowPassword] = useState(false);  
  const [confirmPassword, setConfirmPassword] = useState("");   
  const router = useRouter();  

  const togglePasswordVisibility = () => {  
    setShowPassword((prev) => !prev);  
  };  

  const ResetFields = () => {  
    setRut("");  
    setDf("");
    setNombre("");  
    setApellido1("");  
    setApellido2("");  
    setEmail("");  
    setPassword("");  
    setConfirmPassword("");  
    setRole("");  
  };  

  const handleSubmit = async (e: React.FormEvent) => {  
    e.preventDefault();  

    if (password !== confirmPassword) {  
      toast.error("Las contraseñas no coinciden");  
      return;  
    }  

    if (df.length !== 1 || (df < "0" || df > "9") && df !== "k") {  
      toast.error("El digito verificador solo se permiten números entre 0 y 9 o k minuscula.");  
      return;  
    }  

    console.log("EL VALOEr de DF", df)

    let rut = rut0.toString().concat(df);  
    console.log("El rut completo es: ", rut);  

    try {  
      const res = await fetch("/api/users", {  
        method: "POST",  
        headers: { "Content-Type": "application/json" },  
        body: JSON.stringify({ rut, nombre, apellido1, apellido2, email, password, role }),  
      });  

      if (res.ok) {  
        ResetFields();  
        toast("Usuario registrado exitosamente");  
        router.push("/dashboard/admin");  
      } else {  
        const errorData = await res.json();  
        toast.error(errorData.error || "Error en el registro.");  
      }  
    } catch (error) {  
      console.log("Error durante la solicitud:", error);  
      toast.error(error instanceof Error ? error.message : "No se pudo ingresar el usuario.");  
    }  
  };  

  return (

<div className="flex-container container-formulario-global bg-gray-100 ">  
  {/* Instrucciones para completar el formulario de registro */}  
  <div className="Intrucciones__registro conatiner-formulario-parte1 ">  
    <p className="font-semibold text-gray-800 mb-4 subtitle-responsive">  
      Complete el siguiente formulario para registrar usuarios...  
    </p>  
    {/* Lista de pasos */}  
    <ol className="container-listado">  
      {/* Paso 1: Rellenar datos personales */}  
      <li className="bg-white p-4 rounded-md shadow-sm">  
        <h3 className="font-bold text-blue-600 mb-2">1. Rellene sus datos personales.</h3>  
        <ul className="list-disc list-inside pl-4 space-y-1">  
          <li>Ingrese el RUT en el primer campo.</li>  
          <li>Luego, proporcione el nombre, seguido de los apellidos.</li>  
          <li>Asegúrese de ingresar la dirección de correo electrónico correctamente.</li>  
          <li>Establezca una contraseña segura que cumpla con los requisitos del sistema.</li>  
        </ul>  
      </li>  
      {/* Paso 2: Seleccionar rol */}  
      <li className="bg-white p-4 rounded-md shadow-sm">  
        <h3 className="font-bold text-blue-600 mb-2">2. Seleccione el rol de usuario.</h3>  
        <ul className="list-disc list-inside pl-4 space-y-1">  
          <li>Elija el rol que mejor se ajuste a las necesidades.</li>  
          <li>Tiene la opción de ser " Administrador, TENS, Matrona, auxiliar".</li>  
        </ul>  
      </li>  
      {/* Paso 3: Enviar formulario */}  
      <li className="bg-white p-4 rounded-md shadow-sm">  
        <h3 className="font-bold text-blue-600 mb-2">3. Envíe el formulario.</h3>  
        <ul className="list-disc list-inside pl-4 space-y-1">  
          <li>Revise que toda la información esté completa y correcta.</li>  
          <li>Haga clic en el botón "Registrar" para enviar tu solicitud.</li>  
        </ul>  
      </li> 
         
    </ol>  
    <p className="mt-6 text-green-700 description-responsive">  
      ¡Listo! El nuevo usuario se encuentra creado y podra acceder a todas las funcionalidades segun su rol.  
    </p>  
  </div>  

  <div className="Formulario__agregar conatiner-formulario-parte2">  
    <form onSubmit={handleSubmit} className="container-fomr">  

      <div className="rut__digito__verificador flex columns-2">
        <input type="number" placeholder="RUT" value={rut0} onChange={(e) => setRut(e.target.value)} required className="w-2/3 p-2 border rounded " />-
        <input type="text" placeholder="D. Verif." value={df} onChange={(e) => setDf(e.target.value)} required className="w-1/3 p-2 border  pl-4 rounded" />
      </div>
      <input type="text" placeholder="Nombre" value={nombre} onChange={(e) => setNombre(e.target.value)} required className="w-full p-2 border rounded" />  
      <input type="text" placeholder="Primer Apellido" value={apellido1} onChange={(e) => setApellido1(e.target.value)} required className="w-full p-2 border rounded" />  
      <input type="text" placeholder="Segundo Apellido" value={apellido2} onChange={(e) => setApellido2(e.target.value)} required className="w-full p-2 border rounded" />  
      <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required className="w-full p-2 border rounded" />  
     
     
     
      <div className="flex flex-col"><input   type={showPassword ? "text" : "password"}   placeholder="Contraseña" value={password} onChange={(e) => setPassword(e.target.value)} required className="w-full p-2 border rounded" />
      <button 
            type="button"  
            onClick={togglePasswordVisibility}  
            className=" flex justify-end pt-1 text-black"  
          >  
            {showPassword ? "Ocultar contraseñas" : "Mostrar contraseñas"}  
          </button>  
      
      
      </div>  

         {/* Campo de confirmación de contraseña */}  
         <div className="relative">  
          <input  
            type={showPassword ? "text" : "password"}  
            placeholder="Confirma Contraseña"  
            value={confirmPassword}  
            onChange={(e) => setConfirmPassword(e.target.value)}  
            required  
            className="w-full border rounded"  
          />  
        </div>  
     
     
     
      <select value={role} onChange={(e) => setRole(e.target.value)} required className="w-full p-2 border rounded">  
        <option value="" disabled>Elija el rol</option>  
        <option value="user">Usuario</option>  
        <option value="admin">Administrador</option>  
      </select>  
      <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">Registrar</button>  
    </form>  
  </div>  
</div>
  );
}