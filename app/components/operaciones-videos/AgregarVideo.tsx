

"use client";  // Indica que este archivo se ejecuta en el cliente (Next.js con React Server Components).  

import { useState, ChangeEvent, useRef, useEffect } from "react";
import { toast } from "react-toastify";  // Biblioteca para mostrar mensajes de notificación.  
import Image from "next/image";  // Componente de Next.js para manejar imágenes optimizadas.  
import { useRouter } from "next/navigation";
import '@/app/ui/global/containers.css';
import '@/app/ui/global/texts.css';


export default function AgregarVideoPage() {

  // Verificar autenticación al montar
  // const router = useRouter();
  // ... (tus estados existentes)


  // Estados para manejar la carga del formulario, la vista previa del video y los datos del formulario.  
  const [isLoading, setIsLoading] = useState(false);  // Indica si se está cargando un video.  

  const fileInputRef = useRef<HTMLInputElement>(null);  // Referencia al input de archivo para poder manipularlo.  

  // Estado que guarda los datos del formulario.  
  const [formData, setFormData] = useState({
    tema: '',
    titulo: '',  // 
    tipo: '',
    url: '',  // URL del video (si es de YouTube).  
    videoArchivo: null as File | null,
    descripcion: '',
    duracion: '',
    categorias: '',
    miniatura: '',
    formato: 'mp4'
  });

  // Función para reiniciar el formulario y limpiar los datos.  
  const resetForm = () => {
    setFormData({
      tema: '..',
      titulo: '',
      tipo: 'FUENTE',
      url: '',
      videoArchivo: null,
      descripcion: '',
      duracion: '',
      categorias: '',
      miniatura: '',
      formato: 'mp4'
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
      if (!file.type.startsWith('video/')) {  // Verifica que sea un archivo de video.  
        toast.error('El archivo debe ser un video');  // Muestra un error si no es video.  
        return;
      }

      if (file.size > 400 * 1024 * 1024) { // Verifica que el archivo no supere los 400MB.  
        toast.error('El archivo no debe superar los 400MB');
        return;
      }

      // Crear una vista previa del video.  
      const videoUrl = URL.createObjectURL(file);  // Crea una URL temporal para el archivo.  
      const video = document.createElement('video');  // Crea un elemento de video.  

      video.onloadedmetadata = () => {  // Cuando se cargan los metadatos del video.  
        const duracionEnSegundos = Math.round(video.duration);  // Obtiene la duración en segundos.  
        const duracionFormateada = `${Math.floor(duracionEnSegundos / 60)}:${(duracionEnSegundos % 60).toString().padStart(2, '0')}`;  // Formatea la duración como mm:ss.  

        setFormData(prev => ({
          ...prev,
          videoArchivo: file,
          duracion: duracionFormateada,
          formato: file.type.split('/')[1]  // Obtiene el formato del archivo (ejemplo: mp4).  
        }));

        /* // Crear una miniatura del video.  
         const canvas = document.createElement('canvas');  
         canvas.width = video.videoWidth;  
         canvas.height = video.videoHeight;  
         canvas.getContext('2d')?.drawImage(video, 0, 0, canvas.width, canvas.height);  // Dibuja el primer frame del video en un canvas.  
         const thumbnailUrl = canvas.toDataURL('image/jpeg');  // Convierte el canvas en una imagen.  */


        URL.revokeObjectURL(videoUrl);  // Libera la URL temporal.  
      };

      video.onerror = () => {  // Maneja errores al cargar el video.  
        toast.error('Error al cargar el video');
        URL.revokeObjectURL(videoUrl);
      };

      video.src = videoUrl;  // Asigna la URL temporal al elemento de video.  
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

    if (formData.tipo === 'FUENTE') {  // Si el tipo es "LOCAL", verifica que se haya seleccionado un archivo.  
      if (!formData.videoArchivo) {
        toast.error('Debe seleccionar una fuente');
        return;
      }
    }

    if (formData.tipo === 'LOCAL') {  // Si el tipo es "LOCAL", verifica que se haya seleccionado un archivo.  
      if (!formData.videoArchivo) {
        toast.error('Debe seleccionar un archivo de video');
        return;
      }
    }

    if (formData.tipo === 'YOUTUBE') {  // Si el tipo es "YOUTUBE", verifica que se haya seleccionado un archivo.  
      if (!formData.url) {
        toast.error('Debe introducir la url del video de YouTube');
        return;
      }
    }


    if (!formData.descripcion.trim()) {  // Verifica que la descripcion esté vacío.  
      toast.error('El campo descripción es obligatorio');
      return;
    }


    if (!formData.categorias.trim()) {  // Verifica que la descripcion esté vacío.  
      toast.error('El campo categorias es obligatorio');
      return;
    }
    if (!formData.tema || formData.tema === "") {  // Verifica que la descripcion esté vacío.  
      toast.error('El campo tema es obligatorio');
      return;
    }

    setIsLoading(true);  // Activa el estado de carga.  

    try {
      const formDataToSend = new FormData();  // Crea un objeto FormData para enviar los datos.  

      // Agrega los datos del formulario al FormData.  
      Object.keys(formData).forEach(key => {
        if (key !== 'videoArchivo' && formData[key as keyof typeof formData]) {
          formDataToSend.append(key, formData[key as keyof typeof formData] as string);
        }
      });

      if (formData.videoArchivo) {  // Si hay un archivo de video, lo agrega al FormData.  
        formDataToSend.append('video', formData.videoArchivo);
      }

      // Enviar los datos al backend.  
      const response = await fetch('/api/videos', {
        method: 'POST',
        body: formDataToSend,
        credentials: 'include'  // Enviar cookies para mantener la sesión. SE AGREGA ESTA PARTE PARA LA AUTENTICACION
      });

      if (!response.ok) {  // Maneja errores en la respuesta del servidor.  
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error en la respuesta del servidor');
      }

      toast.success('Video subido correctamente');  // Muestra un mensaje de éxito.  
      resetForm();  // Reinicia el formulario.  
    } catch (error) {
      console.error('Error al subir video:', error);
      toast.error(error instanceof Error ? error.message : 'Error al agregar video');  // Muestra un mensaje de error.  
    } finally {
      setIsLoading(false);  // Desactiva el estado de carga.  
    }
  };

  return (
    <div className="flex-container container-formulario-global bg-gray-100 ">
      {/* Instrucciones para agregar un video */}
      <div className="Intrucciones__registro conatiner-formulario-parte1 ">
        <p className="subtitle-responsive  font-semibold text-gray-800 mb-4">En esta sección podrá subir tus videos de manera sencilla...</p>
        {/* Lista de pasos */}
        <ol className="container-listado">
          {/* Paso 1: Seleccionar video */}
          <li className="bg-white p-4 rounded-md shadow-sm">
            <h3 className="font-bold text-blue-600 mb-2">1. Seleccione su video.</h3>
            <ul className="list-disc list-inside pl-4 space-y-1">
              <li>Seleccione la fuente entre YouTube o Local</li>
              <li>Si es YouTube, seleccione la opcion correspondiente y pega el enlace.</li>

              <li>Si es un video local seleccione la opción correspondiente y sube el archivo:</li>

              <ul className="list-circlelist-inside pl-4 space-y-1">

                <li>- Asegúrese de que sea de uno de los formatos permitidos (MP4, AVI, MOV, WebM, MKV).</li>
                <li>- El tamaño máximo es de 400 MB</li>
                <li>- Resolución recomendada: Hasta 1920x1080</li>
              </ul>
            </ul>
          </li>
          {/* Paso 2: Completar detalles */}
          <li className="bg-white p-4 rounded-md shadow-sm">
            <h3 className="font-bold text-blue-600 mb-2">2. Complete los detalles</h3>
            <ul className="list-disc list-inside pl-4 space-y-1">
              <li>Ingrese un título descriptivo</li>
              <li>Seleccione el tema al que corresponda el video</li>
              <li>Agregue una descripción</li>
              <li>Agregue las categorías. Estas permitiran al buscador encontrar el video</li>
            </ul>
          </li>
          {/* Paso 3: Consejos antes de subir */}
          <li className="bg-white p-4 rounded-md shadow-sm">
            <h3 className="font-bold text-blue-600 mb-2">3. Consejos antes de subir</h3>
            <ul className="list-disc list-inside pl-4 space-y-1">
              <li>Use un nombre de archivo simple y claro</li>
              <li>Verifique la calidad del video</li>
              <li>Compruebe que cumple con los requisitos técnicos</li>
            </ul>
          </li>
        </ol>
        <p className="mt-6 text-green-700 description-responsive">¡Listo! Haga clic en "Subir Video" para compartir su contenido.</p>
      </div>




      {/* Formulario para subir el video */}
      <div className="Formulario__agregar conatiner-formulario-parte2">

        <form onSubmit={handleSubmit} className="container-fomr">
          {/* Inputs del formulario */}
          <input type="text" placeholder="Título" value={formData.titulo} onChange={(e) => setFormData({ ...formData, titulo: e.target.value })} className="w-full p-2 border rounded" required />
          <select value={formData.tema} onChange={(e) => setFormData({ ...formData, tema: e.target.value })} className="w-full p-2 border rounded">
            <option value="" disabled >Tema</option>
            <option value="reanimacion">Reanimación Neonatal</option>
            <option value="cuidados_basicos">Cuidados Básicos</option>
            <option value="ventilacion_mecanica">Ventilación Mecánica</option>
            <option value="administracion_medicamentos">Administración de Medicamentos</option>
            <option value="instalacion_picc">Instalación de PICC</option>
            <option value="lavado_manos">Lavado de Manos</option>
            <option value="iass">IASS</option>
            <option value="drenaje_pleural">Drenaje Pleural</option>

          </select>
          <select value={formData.tipo} onChange={(e) => setFormData({ ...formData, tipo: e.target.value })} className="w-full p-2 border rounded">
            <option value="" disabled>Fuente</option>
            <option value="LOCAL">Local</option>
            <option value="YOUTUBE">YouTube</option>
          </select>

          {formData.tipo === 'YOUTUBE' && (
            <input type="url" placeholder="URL de YouTube" value={formData.url} onChange={(e) => setFormData({ ...formData, url: e.target.value })} className="w-full p-2 border rounded" />
          )}

          {formData.tipo === 'LOCAL' && (
            <div>
              <input type="file" ref={fileInputRef} accept="video/*" onChange={handleFileChange} className="w-full p-2 border rounded" />
              {formData.videoArchivo && (
                <p className="mt-2 text-sm">Archivo seleccionado: {formData.videoArchivo.name}</p>
              )}
            </div>
          )}

          <textarea placeholder="Descripción" value={formData.descripcion} onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })} className="w-full p-2 border rounded" />

          <div className="grid grid-cols-2 gap-4">
            <input type="text" placeholder="Duración" value={formData.duracion} readOnly className="w-full p-2 border rounded bg-gray-100" />
            <select value={formData.formato} onChange={(e) => setFormData({ ...formData, formato: e.target.value })} className="w-full p-2 border rounded">
              <option value="mp4">MP4</option>
              <option value="webm">WebM</option>
              <option value="avi">AVI</option>
            </select>
          </div>

          <input type="text" placeholder="Categorías (separadas por coma)" value={formData.categorias} onChange={(e) => setFormData({ ...formData, categorias: e.target.value })} className="w-full p-2 border rounded" />

          {/* Botón para enviar el formulario */}
          <button type="submit" disabled={isLoading || (formData.tipo === 'LOCAL' && !formData.videoArchivo)} className={`w-full py-2 px-4 rounded transition-colors ${isLoading || formData.tipo === 'LOCAL' && !formData.videoArchivo ? 'bg-gray-300 cursor-not-allowed' : 'bg-blue-500 text-white hover:bg-blue-600'}`}>
            {isLoading ? 'Subiendo...' : 'Agregar Video'}
          </button>
        </form>
      </div>

      {/* Indicador de carga */}
      {isLoading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-center">Subiendo video...</p>
          </div>
        </div>
      )}
    </div>
  );
}