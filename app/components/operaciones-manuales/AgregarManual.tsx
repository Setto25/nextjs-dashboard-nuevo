'use client';   // Indica que este archivo se ejecuta en el cliente (Next.js con React Server Components).  

import { useState, ChangeEvent, useRef } from "react";
import { toast } from "react-toastify";  // Biblioteca para mostrar mensajes de notificación.  
import { useUploadStore } from "@/app/store/store";


/*
 este archivo de código permite a los usuarios subir manuales a una aplicación utilizando React y Next.js. Proporciona un formulario donde los usuarios pueden ingresar información como el título, tema, tipo de manual (local ou online las interacciones del usuario, como la selección de archivos. Al seleccionar un archivo de manual, se realizan validaciones para asegurarse de que cumple con los requisitos de tipo y tamaño. Cuando el formulario se envía, se crea un objeto FormData que se envía a un backend (/manuales/route.ts) a través de una solicitud POST. El componente también muestra notificaciones sobre el estado de la carga y proporciona instrucciones claras para el usuario sobre cómo subir manuales. Además, incluye un indicador de carga que se activa durante el proceso de subida.

*/


export default function AgregarManual() {
  const alternarActualizarManuales = useUploadStore((state) => state.alternarActualizar);
  // Estados para manejar la carga del formulario, la vista previa del manual y los datos del formulario.  
  const [isLoading, setIsLoading] = useState(false);  // Indica si se está cargando un manual.  

  const fileInputRef = useRef<HTMLInputElement>(null);  // Referencia al input de archivo para poder manipularlo.  

  // Estado que guarda los datos del formulario.  
  const [formData, setFormData] = useState({
    titulo: "",
    selectedFile: null as File | null,
    descripcion: '',
    categorias: '',
    portada: null as File | null,
  });

  // Función para reiniciar el formulario y limpiar los datos.  
  const resetForm = () => {
    setFormData({
      titulo: '',
      selectedFile: null,
      descripcion: '',
      categorias: '',
      portada: null,
    });
    if (fileInputRef.current) {
      fileInputRef.current.value = '';  // Limpia el input de archivo.  
    }
  };

  // --- FUNCIONES DE UTILIDAD (PDF) ---
  async function getPdfjsLib() {
    // @ts-ignore
    if (window.pdfjsLib) {
      // @ts-ignore
      return window.pdfjsLib;
    }

    return new Promise((resolve, reject) => {
      const script = document.createElement("script");
      const pdfJsVersion = "3.11.174"; // Versión popular y estable
      script.src = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfJsVersion}/pdf.min.js`;

      script.onload = () => {
        // @ts-ignore
        const pdfjsLib = window.pdfjsLib;
        pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfJsVersion}/pdf.worker.min.js`;
        resolve(pdfjsLib);
      };

      script.onerror = () => {
        reject(new Error("No se pudo cargar la librería PDF.js"));
      };

      document.body.appendChild(script);
    });
  }

  async function obtenerPortadaPDF(file: File): Promise<string> {
    // @ts-ignore
    const pdfjsLib = await getPdfjsLib();

    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    const page = await pdf.getPage(1);
    const viewport = page.getViewport({ scale: 1.0 });

    const canvas = document.createElement("canvas");
    canvas.width = viewport.width;
    canvas.height = viewport.height;
    const context = canvas.getContext("2d");

    await page.render({ canvasContext: context!, viewport }).promise;
     return canvas.toDataURL("image/webp", 0.7);
  }

  function base64ToBlob(base64: string) {
    const arr = base64.split(",");
    const mime = arr[0].match(/:(.*?);/)![1];
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) u8arr[n] = bstr.charCodeAt(n);
    return new Blob([u8arr], { type: mime });
  }

  // Función para manejar el cambio en el input de archivo.  
  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];  // Obtiene el archivo seleccionado.  
    if (file) {
      if (file.type !== "application/pdf") {
        toast.error("El archivo debe ser un PDF para generar una portada.");
        // Aún permitimos otros tipos de manuales, pero sin portada automática
        setFormData(prev => ({
          ...prev,
          selectedFile: file,
          portada: null,
        }));
        return;
      }

      setIsLoading(true); // Muestra spinner mientras genera portada
      try {
        const portadaBase64 = await obtenerPortadaPDF(file);
        const portadaBlob = base64ToBlob(portadaBase64);
        const portadaFile = new File([portadaBlob], "portada.webp", {
          type: "image/webp",
        });

        setFormData((prev) => ({
          ...prev,
          selectedFile: file,
          portada: portadaFile,
        }));
      } catch (err) {
        toast.error("No se pudo extraer la portada del PDF. Se subirá sin vista previa.");
        console.error("Error detallado al extraer portada:", err);
        setFormData((prev) => ({
          ...prev,
          selectedFile: file,
          portada: null,
        }));
      } finally {
        setIsLoading(false); // Oculta spinner
      }
    }
  };

  // Función para manejar el envío del formulario.  
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();  // Evita el comportamiento por defecto del formulario.  

    if (!formData.titulo.trim() || !formData.selectedFile || !formData.categorias.trim()) {
      toast.error("El título, el tema y el archivo son obligatorios.");
      return;
    }
    

    setIsLoading(true);  // Activa el estado de carga.  

    try {
      const formDataToSend = new FormData();  // Crea un objeto FormData para enviar los datos.  

      // Agrega los datos del formulario al FormData.  
      formDataToSend.append("titulo", formData.titulo);
      formDataToSend.append("tema", formData.categorias); // Usamos 'categorias' como 'tema'
      formDataToSend.append("descripcion", formData.descripcion);
      formDataToSend.append("categorias", formData.categorias);

      if (formData.selectedFile) {
        formDataToSend.append('manual', formData.selectedFile);
      }

      if (formData.portada) {
        formDataToSend.append('portada', formData.portada);
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

      toast.success('Manual subido correctamente a Backblaze B2');  // Muestra un mensaje de éxito.  
      resetForm();  // Reinicia el formulario.  
      alternarActualizarManuales();  // Alterna el estado de actualización para que los componentes que dependen de este estado se actualicen.
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
      <option value="" disabled>Tema</option>
      <option value="monitorizacion">Monitorización</option>
      <option value="soporte-respiratorio">Soporte respiratorio</option>
      <option value="equipos-diagnostico">Equipos Diagnostico</option>
      <option value="termorregulacion">Termorregulación</option>
      <option value="adm-medicamentos">Adm. Medicamentos</option>
      <option value="equipos-laboratorio">Equipos laboratorio</option>
      <option value="equipos-reanimacion">Equipos Reanimación</option>
      <option value="equipos-informacion">Equipos Información</option>
      <option value="otros">Otros</option>
          </select> 



   
            <div>
              <label className="block mb-2 text-sm font-medium text-gray-900">
                Seleccionar Manual (PDF recomendado)
              </label>
              <input 
                type="file" 
                ref={fileInputRef} 
                accept=".pdf,.doc,.docx,.txt,.ppt,.pptx" 
                onChange={handleFileChange} 
                className="w-full p-2 border rounded" 
                required 
              />
              {formData.selectedFile && (
                <p className="mt-2 text-sm text-gray-600">Archivo seleccionado: {formData.selectedFile.name}</p>
              )}
              {formData.portada && (
                <img src={URL.createObjectURL(formData.portada)} alt="Portada generada" className="mt-2 rounded shadow w-32 h-auto border" />
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
          <button type="submit" disabled={isLoading ||  !formData.selectedFile} className={`w-full py-2 px-4 rounded transition-colors ${isLoading ||  !formData.selectedFile ? 'bg-gray-300 cursor-not-allowed' : 'bg-blue-500 text-white hover:bg-blue-600'}`}>
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
