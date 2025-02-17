'use client';   // Indica que este archivo se ejecuta en el cliente (Next.js con React Server Components).  

import { useState, ChangeEvent, useRef } from "react";
import { toast } from "react-toastify";  // Biblioteca para mostrar mensajes de notificación.  
import Image from "next/image";  // Componente de Next.js para manejar imágenes optimizadas.  


/*
 este archivo de código permite a los usuarios subir manuales a una aplicación utilizando React y Next.js. Proporciona un formulario donde los usuarios pueden ingresar información como el título, tema, tipo de manual (local ou online las interacciones del usuario, como la selección de archivos. Al seleccionar un archivo de manual, se realizan validaciones para asegurarse de que cumple con los requisitos de tipo y tamaño. Cuando el formulario se envía, se crea un objeto FormData que se envía a un backend (/manuales/route.ts) a través de una solicitud POST. El componente también muestra notificaciones sobre el estado de la carga y proporciona instrucciones claras para el usuario sobre cómo subir manuales. Además, incluye un indicador de carga que se activa durante el proceso de subida.

*/


export default function AgregarManual() {
  // Estados para manejar la carga del formulario, la vista previa del manual y los datos del formulario.  
  const [isLoading, setIsLoading] = useState(false);  // Indica si se está cargando un manual.  

  const fileInputRef = useRef<HTMLInputElement>(null);  // Referencia al input de archivo para poder manipularlo.  

  // Estado que guarda los datos del formulario.  
  const [formData, setFormData] = useState({
    titulo: '',  // 
   rutaLocal: null as File | null,
    descripcion: '',
    categorias: '',
  });

  // Función para reiniciar el formulario y limpiar los datos.  
  const resetForm = () => {
    setFormData({
      titulo: '',
     rutaLocal: null,
      descripcion: '',
      categorias: '',
    });
    if (fileInputRef.current) {
      fileInputRef.current.value = '';  // Limpia el input de archivo.  
    }
  };

  // Función para manejar el cambio en el input de archivo.  
  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];  // Obtiene el archivo seleccionado.  
    if (file) {
      // Validaciones del archivo.  
      if (!['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain', 'application/vnd.ms-powerpoint', 'application/vnd.openxmlformats-officedocument.presentationml.presentation'].includes(file.type)) {  // Verifica que sea un archivo de manual con los tipos de MIME.  
        toast.error('El archivo debe ser un manual');  // Muestra un error si no es manual.  
        return;
      }

  
        setFormData(prev => ({ //Este fragmento de código se utiliza para actualizar el estado del formulario con la información del archivo subido.
          ...prev, 
         rutaLocal: file,
          formato: file.type.split('/')[1]  // Obtiene el formato del archivo (ejemplo: PDF).  
        }));

      
    }
  };

  // Función para manejar el envío del formulario.  
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();  // Evita el comportamiento por defecto del formulario.  

    // VALIDACIONES DE FORMULARIO//////////////.  
    if (!formData.titulo.trim()) {  // Verifica que el título no esté vacío.  
      toast.error('El título es obligatorio');
      return;
    }


      if (!formData.rutaLocal) {
        toast.error('Debe seleccionar un archivo de manual');
        return;
      }
    


    if (!formData.descripcion.trim()) {  // Verifica que la descripcion esté vacío.  
      toast.error('El campo descripción es obligatorio');
      return;
    }


    if (!formData.categorias.trim()) {  // Verifica que categorias esté vacío.  
      toast.error('El campo categorias es obligatorio');
      return;
    }
    

    setIsLoading(true);  // Activa el estado de carga.  

    try {
      const formDataToSend = new FormData();  // Crea un objeto FormData para enviar los datos.  

      // Agrega los datos del formulario al FormData.  
      Object.keys(formData).forEach(key => {
        if (key !== 'rutaLocal' && formData[key as keyof typeof formData]) {
          formDataToSend.append(key, formData[key as keyof typeof formData] as string);
        }
      });

      if (formData.rutaLocal) {  // Si hay un archivo de manual, lo agrega al FormData.  
        formDataToSend.append('manual', formData.rutaLocal);
      }

      // Enviar los datos al backend.  
      const response = await fetch('/api/manuals', {
        method: 'POST',
        body: formDataToSend
      });

      if (!response.ok) {  // Maneja errores en la respuesta del servidor.  
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error en la respuesta del servidor');
      }

      toast.success('manual subido correctamente');  // Muestra un mensaje de éxito.  
      resetForm();  // Reinicia el formulario.  
    } catch (error) {
      console.error('Error al subir manual:', error);
      toast.error(error instanceof Error ? error.message : 'Error al agregar manual');  // Muestra un mensaje de error.  
    } finally {
      setIsLoading(false);  // Desactiva el estado de carga.  
    }
  };

  return (
    <div className="flex flex-wrap bg-gray-100 space-y-6 rounded-lg justify-between px-10 items-center">
      {/* Instrucciones para agregar un manual */}
      <div className="Intrucciones__agregar p-6 rounded-lg flex grow flex-col w-2/4 justify-center items-center space-y-4">
        <p className="text-lg font-semibold text-gray-800 mb-4">En esta sección podrás subir tus manuales de manera sencilla...</p>
        {/* Lista de pasos */}
        <ol className="space-y-4 text-gray-700">
          {/* Paso 1: Seleccionar manual */}
          <li className="bg-white p-4 rounded-md shadow-sm">
            <h3 className="font-bold text-blue-600 mb-2">1. Selecciona tu manual.</h3>
            <ul className="list-disc list-inside pl-4 space-y-1">
              <li>Selecciona la fuente entre online o Local</li>
              <li>Si es online, selecciona laopcion correspondiente y pega el enlace.</li>

              <li>Si es un manual local selecciona la opción correspondiente y sube el archivo:</li>

              <ul className="list-circlelist-inside pl-4 space-y-1">

                <li>- Asegúrate de que sea de uno de los formatos permitidos (pdf o docx), de tener otro formato, podría converitrlo, de preferencia a pdf antes de intentar subirlo.</li>
                <li>- El tamaño máximo es de 400 MB</li>
                <li>- Resolución recomendada: Hasta 1920x1080</li>
              </ul>
            </ul>
          </li>
          {/* Paso 2: Completar detalles */}
          <li className="bg-white p-4 rounded-md shadow-sm">
            <h3 className="font-bold text-blue-600 mb-2">2. Completa los detalles</h3>
            <ul className="list-disc list-inside pl-4 space-y-1">
              <li>Ingresa un título descriptivo</li>
              <li>Selecciona el tema al que corresponda el manual</li>
              <li>Agrega una descripción</li>
              <li>Agrega las categorías. Estas permitiran al buscador encontrar el manual</li>
            </ul>
          </li>
          {/* Paso 3: Consejos antes de subir */}
          <li className="bg-white p-4 rounded-md shadow-sm">
            <h3 className="font-bold text-blue-600 mb-2">3. Consejos antes de subir</h3>
            <ul className="list-disc list-inside pl-4 space-y-1">
              <li>Usa un nombre de archivo simple y claro</li>
              <li>Verifica la calidad del manual</li>
              <li>Comprueba que cumple con los requisitos técnicos</li>
            </ul>
          </li>
        </ol>
        <p className="mt-6 text-green-700 font-medium">¡Listo! Haz clic en "Subir manual" para compartir tu contenido.</p>
      </div>

      {/* Formulario para subir el manual */}
      <div className="Formulario__agregar rounded-lg justify-center items-center flex flex-col space-y-4">
        <h1 className="text-2xl font-bold mb-4 text-center">Agregar Nuevo manual</h1>
        <form onSubmit={handleSubmit} className="space-y-4 flex flex-col">

          {/* Inputs del formulario */}
          <input type="text" placeholder="Título" value={formData.titulo} onChange={(e) => setFormData({ ...formData, titulo: e.target.value })} className="w-full p-2 border rounded" required />
          
          
          <select value={formData.categorias} onChange={(e) => setFormData({ ...formData, categorias: e.target.value })} className="w-full p-2 border rounded">
            <option value="" disabled >Tema</option>
            <option value="general">General</option>
            <option value="reanimacion">Reanimación</option>
            <option value="trauma">Trauma</option>
          </select>



   
            <div>
              <input type="file" ref={fileInputRef} accept="manual/*" onChange={handleFileChange} className="w-full p-2 border rounded" />
              {formData.rutaLocal && (
                <p className="mt-2 text-sm">Archivo seleccionado: {formData.rutaLocal.name}</p>
              )}
            </div>
    

          <textarea placeholder="Descripción" value={formData.descripcion} onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })} className="w-full p-2 border rounded" />

    {   /*   <div className="grid grid-cols-2 gap-4">
          
            <select value={formData.formato} onChange={(e) => setFormData({ ...formData, formato: e.target.value })} className="w-full p-2 border rounded">
            <option value="" disabled >Tipo</option>
              <option value="pdf">PDF</option>
              <option value="docx">DOCX</option>
            </select>
          </div>*/}
{
          /*<input type="text" placeholder="Categorías (separadas por coma)" value={formData.categorias} onChange={(e) => setFormData({ ...formData, categorias: e.target.value })} className="w-full p-2 border rounded" />*/}

          {/* Botón para enviar el formulario */}
          <button type="submit" disabled={isLoading ||  !formData.rutaLocal} className={`w-full py-2 px-4 rounded transition-colors ${isLoading ||  !formData.rutaLocal ? 'bg-gray-300 cursor-not-allowed' : 'bg-blue-500 text-white hover:bg-blue-600'}`}>
            {isLoading ? 'Subiendo...' : 'Agregar manual'}
          </button>
        </form>
      </div>

      {/* Indicador de carga */}
      {isLoading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-center">Subiendo manual...</p>
          </div>
        </div>
      )}
    </div>
  );
}

