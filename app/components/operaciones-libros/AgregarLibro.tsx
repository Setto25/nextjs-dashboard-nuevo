"use client"; 

import { useState, ChangeEvent, useRef } from "react";
import { toast } from "react-toastify"; 
import { useUploadStore } from "@/app/store/store";

export default function AgregarDocumento() {
  const [isLoading, setIsLoading] = useState(false); 
  const fileInputRef = useRef<HTMLInputElement>(null); 
  const alternarActualizarLibros = useUploadStore((state) => state.alternarActualizar);

  // 1. Renombramos 'rutaLocal' a 'selectedFile' para mayor claridad.
  //    Su propósito es guardar el archivo seleccionado por el admin en el navegador.
  const [formData, setFormData] = useState({
    tema: '',
    titulo: '', 
    selectedFile: null as File | null,
    descripcion: '',
    categorias: '',
  });

  const resetForm = () => {
    setFormData({
      tema: '',
      titulo: '',
      selectedFile: null,
      descripcion: '',
      categorias: '',
    });
    if (fileInputRef.current) {
      fileInputRef.current.value = ''; 
    }
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; 
    if (file) {
      // 2. Simplificamos la validación para aceptar solo PDF.
      if (file.type !== 'application/pdf') { 
        toast.error('El archivo debe ser un PDF.'); 
        if(fileInputRef.current) fileInputRef.current.value = '';
        setFormData(prev => ({ ...prev, selectedFile: null }));
        return;
      }
      
      setFormData(prev => ({
        ...prev, 
        selectedFile: file,
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault(); 

    // 3. Actualizamos la validación para que verifique 'selectedFile'.
    if (!formData.titulo.trim() || !formData.selectedFile || !formData.tema.trim()) { 
      toast.error('El título, el tema y el archivo son obligatorios.');
      return;
    }

    setIsLoading(true); 

    try {
      // 4. Usamos FormData para enviar el archivo al backend.
      const formDataToSend = new FormData(); 

      formDataToSend.append('titulo', formData.titulo);
      formDataToSend.append('tema', formData.tema);
      formDataToSend.append('descripcion', formData.descripcion);
      formDataToSend.append('categorias', formData.categorias);
      
      if (formData.selectedFile) { 
        // El backend buscará el archivo con el nombre 'libro'.
        formDataToSend.append('libro', formData.selectedFile); 
      }

      const response = await fetch('/api/books', {
        method: 'POST',
        body: formDataToSend
      });

      if (!response.ok) { 
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error en la respuesta del servidor');
      }

      toast.success('Libro subido correctamente a Backblaze B2'); 
      resetForm(); 
      alternarActualizarLibros(); 
    } catch (error) {
      console.error('Error al subir Libro:', error);
      toast.error(error instanceof Error ? error.message : 'Error al agregar Libro'); 
    } finally {
      setIsLoading(false); 
    }
  };
  
  return (
    <div className="flex flex-wrap bg-gray-100 space-y-6 rounded-lg justify-between px-10 items-center">
      {/* 5. Instrucciones actualizadas. */}
      <div className="Intrucciones__agregar p-6 rounded-lg flex grow flex-col w-2/4 justify-center items-center space-y-4">
        <p className="text-lg font-semibold text-gray-800 mb-4">Sube un nuevo documento a la plataforma.</p>
        <ol className="space-y-4 text-gray-700">
          <li className="bg-white p-4 rounded-md shadow-sm">
            <h3 className="font-bold text-blue-600 mb-2">1. Selecciona el archivo</h3>
            <p>Haz clic en "Seleccionar archivo" y elige el PDF que deseas subir desde tu computador.</p>
          </li>
          <li className="bg-white p-4 rounded-md shadow-sm">
            <h3 className="font-bold text-blue-600 mb-2">2. Completa los detalles</h3>
            <ul className="list-disc list-inside pl-4 space-y-1">
              <li>Ingresa un título descriptivo y selecciona un tema.</li>
              <li>Agrega una descripción y categorías para facilitar la búsqueda.</li>
            </ul>
          </li>
          <li className="bg-white p-4 rounded-md shadow-sm">
            <h3 className="font-bold text-blue-600 mb-2">3. Sube el documento</h3>
            <p>Haz clic en "Agregar Libro". El sistema lo subirá de forma segura a la nube (Backblaze B2).</p>
          </li>
        </ol>
      </div>

      <div className="Formulario__agregar rounded-lg justify-center items-center flex flex-col space-y-4">
        <h1 className="text-2xl font-bold mb-4 text-center">Agregar Nuevo Libro</h1>
        <form onSubmit={handleSubmit} className="space-y-4 flex flex-col">
          <input type="text" placeholder="Título" value={formData.titulo} onChange={(e) => setFormData({ ...formData, titulo: e.target.value })} className="w-full p-2 border rounded" required />
          <select value={formData.tema} onChange={(e) => setFormData({ ...formData, tema: e.target.value })} className="w-full p-2 border rounded" required>
            <option value="" disabled >Tema</option>
            <option value="reanimacion-neonatal">Reanimación Neonatal</option>
            <option value="cuidados-generales">Cuidados Generales</option>
            <option value="soporte-respiratorio">Soporte Respiratorio</option>
            <option value="manejo-de-infecciones">Manejo de Infecciones</option>
            <option value="nutricion-alimentacion">Nutrición / Alimentación</option>
            <option value="administracion-de-medicamentos">Administración de Medicamentos</option>
            <option value="procedimientos-invasivos">Procedimientos Invasivos</option>
            <option value="cuidados-de-piel-termoregulacion">Cuidados de Piel / Termoregulación</option>
            <option value="monitorizacion">Monitorización</option>
            <option value="otros">Otros</option>
          </select>
          
          <div>
            <label className="block mb-2 text-sm font-medium text-gray-900">Seleccionar PDF</label>
            <input type="file" ref={fileInputRef} accept=".pdf" onChange={handleFileChange} className="w-full p-2 border rounded" required />
            {/* 6. Lógica del JSX actualizada para usar 'selectedFile'. */}
            {formData.selectedFile && (
              <p className="mt-2 text-sm text-gray-600">Archivo seleccionado: {formData.selectedFile.name}</p>
            )}
          </div>

          <textarea placeholder="Descripción" value={formData.descripcion} onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })} className="w-full p-2 border rounded" />
          <input type="text" placeholder="Categorías (separadas por coma)" value={formData.categorias} onChange={(e) => setFormData({ ...formData, categorias: e.target.value })} className="w-full p-2 border rounded" />

          <button type="submit" disabled={isLoading || !formData.selectedFile} className={`w-full py-2 px-4 rounded transition-colors ${isLoading || !formData.selectedFile ? 'bg-gray-300 cursor-not-allowed' : 'bg-blue-500 text-white hover:bg-blue-600'}`}>
            {isLoading ? 'Subiendo...' : 'Agregar Libro'}
          </button>
        </form>
      </div>
      {/* ... Tu JSX del indicador de carga se mantiene igual ... */}
    </div>
  );
}

