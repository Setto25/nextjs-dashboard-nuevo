'use client';  
import { useEffect, useState } from "react";  
import { toast } from "react-toastify";  

type Categoria = {  
  id: number;  
  categoria: string;  
  nombre: string;  
};  

export default function GestionCategorias() {  
  const [categorias, setCategorias] = useState<Categoria[]>([]);  
  const [nombre, setNombre] = useState("");  

  // Genera el campo 'categoria' desde 'nombre' eliminando espacios y caracteres especiales  
  // Permitimos solo letras y espacios, esta función quita espacios y no letras:  
  const generarCategoria = (nombre: string) => {  
    // Filtrar solo letras y quitar espacios  
    // Primero validar que nombre solo tenga letras y espacios  
    if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ ]*$/.test(nombre)) {  
      return null; // nombre inválido  
    }  
    // Quitar espacios y caracteres especiales (dejamos solo letras)  
    return nombre.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ]/g, "").replace(/\s+/g, "");  
  };  

  const fetchCategorias = async () => {  
    try {  
      const res = await fetch("/api/categorias");  
      if (res.ok) {  
        const data = await res.json();  
        setCategorias(data);  
      } else {  
        toast.error("Error al cargar categorías");  
      }  
    } catch (e) {  
      toast.error("Error de red al cargar categorías");  
    }  
  };  

  useEffect(() => {  
    fetchCategorias();  
  }, []);  

  const handleAgregar = async (e: React.FormEvent) => {  
   // e.preventDefault();  
    const nombreTrim = nombre.trim();  

    if (!nombreTrim) {  
      toast.error("El nombre no puede estar vacío");  
      return;  
    }  

    // Validar solo letras y espacios  
    if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ ]+$/.test(nombreTrim)) {  
      toast.error("El nombre sólo puede contener letras y espacios");  
      return;  
    }  

    if (nombreTrim.length > 20) {  
      toast.error("El nombre no puede superar los 20 caracteres");  
      return;  
    }  

    // Generar categoria  
    const categoriaGenerada = generarCategoria(nombreTrim);  

    if (!categoriaGenerada) {  
      toast.error("El nombre contiene caracteres inválidos");  
      return;  
    }  
    if (categoriaGenerada.length > 20) {  
      toast.error(  
        "El identificador de categoría generado no puede superar los 20 caracteres"  
      );  
      return;  
    }  

    try {  
      const res = await fetch("/api/categorias", {  
        method: "POST",  
        headers: { "Content-Type": "application/json" },  
        body: JSON.stringify({  
          nombre: nombreTrim,  
          categoria: categoriaGenerada,  
        }),  
      });  

      if (res.ok) {  
        toast.success("Categoría agregada");  
        setNombre("");  
        fetchCategorias();  
      } else {  
        const errorData = await res.json();  
        toast.error(errorData.error || "Error al agregar categoría");  
      }  
    } catch (e) {  
      toast.error("Fallo en la solicitud para agregar categoría");  
    }  
  };  

  const handleEliminar = async (id: number) => {  
    if (!confirm("¿Seguro que quieres eliminar esta categoría?")) return;  

    try {  
      const res = await fetch(`/api/categorias/${id}`, {  
        method: "DELETE",  
      });  
      if (res.ok) {  
        toast.success("Categoría eliminada");  
        fetchCategorias();  
      } else {  
        toast.error("Error al eliminar categoría");  
      }  
    } catch {  
      toast.error("Fallo en la solicitud para eliminar categoría");  
    }  
  };  

    const cleanContenido=async () => {
    await fetch("/api/delete-contenido-gestion", { method: "POST" });
    ;
  }

  return (  
    <div className="p-4 max-w-lg mx-auto bg-white rounded shadow-md">  
      <h2 className="text-xl font-bold mb-4">Gestión de Categorías</h2>  

      <form onSubmit={handleAgregar} className="mb-6 flex gap-2">  
        <input  
          type="text"  
          placeholder="Nombre (solo letras y espacios, max 20)"  
          value={nombre}  
          onChange={(e) => setNombre(e.target.value)}  
          maxLength={20}  
          required  
          className="flex-grow p-2 border rounded"  
        />  
        <button  
          type="submit"  
          className="px-4 bg-blue-600 text-white rounded hover:bg-blue-700"  
        >  
          Agregar  
        </button>  
      </form>  

      <ul>  
        {categorias.length === 0 && (  
          <li className="text-gray-500">No hay categorías aún.</li>  
        )}  
        {categorias.map((cat) => (  
          <li  
            key={cat.id}  
            className="flex justify-between items-center border-b py-2"  
          >  
            <span>{cat.nombre} <small className="text-gray-400">({cat.categoria})</small></span>  
            <button  
              onClick={() => {handleEliminar(cat.id); cleanContenido()}}  
              className="text-red-600 hover:text-red-800"  
            >  
              Eliminar  
            </button>  
          </li>  
        ))}  
      </ul>  
    </div>  
  );  
}  