"use client";  // Indica que este archivo se ejecuta en el cliente (Next.js con React Server Components).  

import { useState, ChangeEvent, useRef } from "react";
import { toast } from "react-toastify";  // Biblioteca para mostrar mensajes de notificación.  

export default function AgregarProtocolo() {
    const [isLoading, setIsLoading] = useState(false);  // Indica si se está cargando un documento.  
    const fileInputRef = useRef<HTMLInputElement>(null);  // Referencia al input de archivo para poder manipularlo.  

    // Estado que guarda los datos del formulario.  
    const [formData, setFormData] = useState({
        titulo: '',
        descripcion: '',
        categoria: '',
        fechaCreacion: '',
        fechaRevision: '',
        version: '',
        codigo: '',
        creadoPor: '',
        vigencia: '',
        rutaLocal: null as File | null,
    });

    // Función para reiniciar el formulario y limpiar los datos.  
    const resetForm = () => {
        setFormData({
            titulo: '',
            descripcion: '',
            categoria: '',
            fechaCreacion: '',
            fechaRevision: '',
            version: '',
            codigo: '',
            creadoPor: '',
            vigencia: '',
            rutaLocal: null,
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
            if (!['application/pdf'].includes(file.type)) {  // Verifica que sea un archivo PDF.  
                toast.error('El archivo debe ser un PDF');  // Muestra un error si no es PDF.  
                return;
            }

            setFormData(prev => ({
                ...prev,
                rutaLocal: file,
            }));
        }
    };

    // Función para manejar el envío del formulario.  
    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();  // Evita el comportamiento por defecto del formulario.  

        // VALIDACIONES DE FORMULARIO  
        if (!formData.titulo.trim()) {
            toast.error('El título es obligatorio');
            return;
        }
        if (!formData.rutaLocal) {
            toast.error('Debe seleccionar un archivo de protocolo');
            return;
        }
        if (!formData.descripcion.trim()) {
            toast.error('El campo descripción es obligatorio');
            return;
        }
        if (!formData.categoria.trim()) {
            toast.error('El campo categoría es obligatorio');
            return;
        }
        if (!formData.version.trim()) {
            toast.error('El campo versión es obligatorio');
            return;
        }
        if (!formData.creadoPor.trim()) {
            toast.error('El campo creado por es obligatorio');
            return;
        }

        setIsLoading(true);  // Activa el estado de carga.  

        try {
            const formDataToSend = new FormData();  // Crea un objeto FormData para enviar los datos.  
            // Agrega los datos del formulario al FormData.  
            Object.keys(formData).forEach(key => {
                if (key !== 'archivo' && formData[key as keyof typeof formData]) {
                    formDataToSend.append(key, formData[key as keyof typeof formData] as string);
                }
            });

            if (formData.rutaLocal) {  // Si hay un archivo de protocolo, lo agrega al FormData.  
                formDataToSend.append('archivo', formData.rutaLocal);
            }

            // Enviar los datos al backend.  
            const response = await fetch('/api/protocolos', {
                method: 'POST',
                body: formDataToSend
            });

            if (!response.ok) {  // Maneja errores en la respuesta del servidor.  
                const errorData = await response.json();
                throw new Error(errorData.message || 'Error en la respuesta del servidor');
            }

            toast.success('Protocolo subido correctamente');  // Muestra un mensaje de éxito.  
            resetForm();  // Reinicia el formulario.  
        } catch (error) {
            console.error('Error al subir protocolo:', error);
            toast.error(error instanceof Error ? error.message : 'Error al agregar protocolo');  // Muestra un mensaje de error.  
        } finally {
            setIsLoading(false);  // Desactiva el estado de carga.  
        }
    };

    return (
        <div className="flex flex-wrap bg-gray-100 space-y-6 rounded-lg justify-between px-10 items-center">
            <div className="Intrucciones__agregar p-6 rounded-lg flex grow flex-col w-2/4 justify-center items-center space-y-4">
                <p className="text-lg font-semibold text-gray-800 mb-4">En esta sección podrá subir protocolos de manera sencilla...</p>
                <ol className="space-y-4 text-gray-700">
                    <li className="bg-white p-4 rounded-md shadow-sm">
                        <h3 className="font-bold text-blue-600 mb-2">1. Selecciona tu archivo.</h3>
                        <ul className="list-disc list-inside pl-4 space-y-1">
                            <li>Elige un archivo en formato PDF.</li>
                            <li>El tamaño máximo es de 400 MB.</li>
                        </ul>
                    </li>
                    <li className="bg-white p-4 rounded-md shadow-sm">
                        <h3 className="font-bold text-blue-600 mb-2">2. Completa los detalles</h3>
                        <ul className="list-disc list-inside pl-4 space-y-1">
                            <li>Ingresa un título descriptivo.</li>
                            <li>Agrega una descripción.</li>
                            <li>Selecciona la categoría correspondiente.</li>
                            <li>Indica la versión del protocolo.</li>
                            <li>Especifica quién creó el protocolo.</li>
                        </ul>
                    </li>
                </ol>
                <p className="mt-6 text-green-700 font-medium">¡Listo! Haz clic en "Agregar protocolo" para compartir tu contenido.</p>
            </div>

            <div className="Formulario__agregar rounded-lg justify-center items-center flex flex-col space-y-4">
                <h1 className="text-2xl font-bold mb-4 text-center">Agregar Nuevo Protocolo</h1>
                <form onSubmit={handleSubmit} className="space-y-4 flex flex-col">
                    <input type="text" placeholder="Título" value={formData.titulo} onChange={(e) => setFormData({ ...formData, titulo: e.target.value })} className="w-full p-2 border rounded" required />
                    <textarea placeholder="Descripción" value={formData.descripcion} onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })} className="w-full p-2 border rounded" required />


                    <select value={formData.categoria} onChange={(e) => setFormData({ ...formData, categoria: e.target.value })} className="w-full p-2 border rounded">
                        <option value="" disabled>Categoria</option>
                        <option value="cuidados_generales">Cuidados Generales</option>
                        <option value="soporte_respiratorio">Soporte Respiratorio</option>
                        <option value="manejo_infecciones">Manejo de Infecciones</option>
                        <option value="nutricion_alimentacion">Nutrición / Alimentación</option>
                        <option value="administracion_medicamentos">Administración de Medicamentos</option>
                        <option value="procedimientos_invasivos">Procedimientos Invasivos</option>
                        <option value="cuidados_piel_termoregulacion">Cuidados de Piel / Termoregulación</option>
                        <option value="monitorizacion_uci">Monitorización UCI</option>
                    </select>

                    

                    <div className="relative">
                        <input
                            type="date"
                            value={formData.fechaCreacion}
                            id="fechaCreacion"
                            onChange={(e) => setFormData({ ...formData, fechaCreacion: e.target.value })}
                            className="w-full p-2 border rounded"
                            required
                        />
                        <span className="absolute left-2 top-1 text-black transform -translate-y-4 transition-all duration-200 ease-in-out bg-white rounded-md">
                            Fecha de Creación
                        </span>
                    </div>



                    <div className="relative">
                        <input
                            type="date"
                            value={formData.fechaRevision}
                            id="fechaRevision"
                            onChange={(e) => setFormData({ ...formData, fechaRevision: e.target.value })}
                            className="w-full p-2 border rounded"
                            required
                        />
                        <span className="absolute left-2 top-1 text-black transform -translate-y-4 transition-all duration-200 ease-in-out bg-white rounded-md">
                            Fecha de Revisión
                        </span>
                    </div>


                    <input type="text" placeholder="Vigencia" value={formData.vigencia} onChange={(e) => setFormData({ ...formData, vigencia: e.target.value })} className="w-full p-2 border rounded" required />
                    <input type="text" placeholder="Versión" value={formData.version} onChange={(e) => setFormData({ ...formData, version: e.target.value })} className="w-full p-2 border rounded" required />
                    <input type="text" placeholder="codigo" value={formData.codigo} onChange={(e) => setFormData({ ...formData, codigo: e.target.value })} className="w-full p-2 border rounded" required />
                    <input type="text" placeholder="Creado por" value={formData.creadoPor} onChange={(e) => setFormData({ ...formData, creadoPor: e.target.value })} className="w-full p-2 border rounded" required />
                    <div>
                        <input type="file" ref={fileInputRef} accept="protocolo/*" onChange={handleFileChange} className="w-full p-2 border rounded" />
                        {formData.rutaLocal && (
                            <p className="mt-2 text-sm">Archivo seleccionado: {formData.rutaLocal.name}</p>
                        )}
                    </div>
                    <button type="submit" disabled={isLoading || !formData.rutaLocal} className={`w-full py-2 px-4 rounded transition-colors ${isLoading || !formData.rutaLocal ? 'bg-gray-300 cursor-not-allowed' : 'bg-blue-500 text-white hover:bg-blue-600'}`}>
                        {isLoading ? 'Subiendo...' : 'Agregar protocolo'}
                    </button>
                </form>
            </div>

            {/* Indicador de carga */}
            {isLoading && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded-lg shadow-xl">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
                        <p className="text-center">Subiendo protocolo...</p>
                    </div>
                </div>
            )}
        </div>
    );
}