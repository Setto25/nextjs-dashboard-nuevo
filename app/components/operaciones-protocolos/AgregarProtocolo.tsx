"use client";

import { useUploadStore } from "@/app/store/store";
import { useState, ChangeEvent, useRef } from "react";
import { toast } from "react-toastify";

export default function AgregarProtocolo() {
    const alternarActualizarProtocolos = useUploadStore((state) => state.alternarActualizar);
    const [isLoading, setIsLoading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Estado inicial con campos específicos para Protocolos Médicos
    const [formData, setFormData] = useState({
        titulo: '',
        descripcion: '',
        categoria: '',
        fechaCreacion: '',
        fechaRevision: '',
        version: '',
        codigo: '',
        creadoPor: '',
        selectedFile: null as File | null,
        portada: null as File | null,
    });

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
            selectedFile: null,
            portada: null,
        });
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    // --- FUNCIONES DE UTILIDAD (PDF) ---
    // (Misma lógica que en Libros: carga PDF.js y genera portadas)
    async function getPdfjsLib() {
        // @ts-ignore
        if (window.pdfjsLib) return window.pdfjsLib;

        return new Promise((resolve, reject) => {
            const script = document.createElement("script");
            const pdfJsVersion = "3.11.174";
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

    const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (!['application/pdf'].includes(file.type)) {
                toast.error('El archivo debe ser un PDF');
                if (fileInputRef.current) fileInputRef.current.value = "";
                setFormData((prev) => ({ ...prev, selectedFile: null, portada: null }));
                return;
            }

            setIsLoading(true);
            try {
                const portadaBase64 = await obtenerPortadaPDF(file);
                const portadaBlob = base64ToBlob(portadaBase64);
                const portadaFile = new File([portadaBlob], "portada.webp", { type: "image/webp" });
                setFormData((prev) => ({ ...prev, selectedFile: file, portada: portadaFile }));
            } catch (err) {
                toast.error("No se pudo extraer la portada del PDF.");
                setFormData((prev) => ({ ...prev, selectedFile: file, portada: null }));
            } finally {
                setIsLoading(false);
            }
        }
    };

    // Función opcional para limpiar/sincronizar archivos en el servidor si fuera necesario
    const limpiarArchivos = async () => {
        try {
            const response = await fetch('/api/sync', {
                method: 'POST',
                headers: { 'Accept': 'application/json' }
            });
            if (!response.ok) throw new Error(`Error al limpiar archivos: ${response.status}`);
        } catch (error) {
            console.error("Error al limpiar archivos", error);
        }
    };

    // --- MANEJADOR DE ENVÍO PARA PROTOCOLOS (ARQUITECTURA PRESIGNED URL) ---
    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        // Validaciones de campos obligatorios
        if (!formData.titulo.trim()) { toast.error('El título es obligatorio'); return; }
        if (!formData.selectedFile) { toast.error('Debe seleccionar un archivo'); return; }
        // ... (resto de validaciones) ...

        setIsLoading(true);

        try {
            // PASO 1: Solicitud de Firma a la API de Protocolos
            // Se piden las credenciales temporales para subir a B2.
            const firmaRes = await fetch('/api/protocolos/firmar', {
                method: 'POST',
                body: JSON.stringify({
                    nombreProtocolo: formData.selectedFile.name,
                    tipoProtocolo: formData.selectedFile.type,
                    nombrePortada: formData.portada?.name,
                    tipoPortada: formData.portada?.type
                })
            });

            if (!firmaRes.ok) throw new Error('Error al obtener firma de subida');
            
            // Se recuperan las URLs de subida (PutObject) y las rutas finales de guardado
            const { urlSubidaProtocolo, urlSubidaPortada, rutaFinalProtocolo, rutaFinalPortada } = await firmaRes.json();

            // PASO 2: Subida del Protocolo (PDF) Directa a B2
            // Esto evita el error 413 de Vercel.
            await fetch(urlSubidaProtocolo, {
                method: 'PUT',
                body: formData.selectedFile,
                headers: { 'Content-Type': formData.selectedFile.type }
            });

            // Subida de la Portada Directa a B2 (si existe)
            if (formData.portada && urlSubidaPortada) {
                await fetch(urlSubidaPortada, {
                    method: 'PUT',
                    body: formData.portada,
                    headers: { 'Content-Type': formData.portada.type }
                });
            }

            // PASO 3: Registro en Base de Datos (Prisma)
            // Se envían todos los metadatos clínicos más las rutas finales de los archivos en la nube.
            const guardarRes = await fetch('/api/protocolos/guardar', {
                method: 'POST',
                body: JSON.stringify({
                    codigo: formData.codigo,
                    titulo: formData.titulo,
                    descripcion: formData.descripcion,
                    categoria: formData.categoria,
                    version: formData.version,
                    creadoPor: formData.creadoPor,
                    rutaFinalProtocolo: rutaFinalProtocolo, // Ruta generada en el paso 1
                    rutaFinalPortada: rutaFinalPortada,     // Ruta generada en el paso 1
                    fechaCreacion: formData.fechaCreacion,
                    fechaRevision: formData.fechaRevision
                })
            });

            if (!guardarRes.ok) {
                const errorData = await guardarRes.json();
                throw new Error(errorData.message || 'Error al guardar protocolo en BD');
            }

            // Éxito: notifica al usuario, limpia el formulario y actualiza la lista.
            toast.success('Protocolo subido correctamente');
            resetForm();
            alternarActualizarProtocolos();
            
            // Llama a la sincronización en segundo plano (no detiene el flujo)
            limpiarArchivos(); 

        } catch (error) {
            console.error('Error al subir protocolo:', error);
            toast.error(error instanceof Error ? error.message : 'Error al agregar protocolo');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex flex-wrap bg-gray-100 space-y-6 rounded-lg justify-between px-10 items-center">
            {/* ... JSX del formulario (se mantiene idéntico visualmente) ... */}
            
            <div className="Intrucciones__agregar p-6 rounded-lg flex grow flex-col w-2/4 justify-center items-center space-y-4">
                <p className="text-lg font-semibold text-gray-800 mb-4">En esta sección podrá subir protocolos de manera sencilla...</p>
                 {/* ... Instrucciones ... */}
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
                        <option value="protocolos_institucionales">Protocolos institucionales</option>
                        <option value="otros_protocolos">Otros Protocolos</option>
                    </select>

                    <div className="relative">
                        <input type="date" value={formData.fechaCreacion} onChange={(e) => setFormData({ ...formData, fechaCreacion: e.target.value })} className="w-full p-2 border rounded" required />
                        <span className="absolute left-2 top-1 text-black transform -translate-y-4 bg-white rounded-md">Fecha de Creación</span>
                    </div>

                    <div className="relative">
                        <input type="date" value={formData.fechaRevision} onChange={(e) => setFormData({ ...formData, fechaRevision: e.target.value })} className="w-full p-2 border rounded" required />
                        <span className="absolute left-2 top-1 text-black transform -translate-y-4 bg-white rounded-md">Fecha de Revisión</span>
                    </div>

                    <input type="text" placeholder="Versión" value={formData.version} onChange={(e) => setFormData({ ...formData, version: e.target.value })} className="w-full p-2 border rounded" required />
                    <input type="text" placeholder="Creado por" value={formData.creadoPor} onChange={(e) => setFormData({ ...formData, creadoPor: e.target.value })} className="w-full p-2 border rounded" required />
                    
                    <div>
                        <label className="block mb-2 text-sm font-medium text-gray-900">Seleccionar PDF del Protocolo</label>
                        <input type="file" ref={fileInputRef} accept=".pdf" onChange={handleFileChange} className="w-full p-2 border rounded" required />
                        {formData.selectedFile && (<p className="mt-2 text-sm text-gray-600">Archivo seleccionado: {formData.selectedFile.name}</p>)}
                        {formData.portada && (<img src={URL.createObjectURL(formData.portada)} alt="Portada generada" className="mt-2 rounded shadow w-32 h-auto border" />)}
                    </div>
                    
                    <button type="submit" disabled={isLoading || !formData.selectedFile} className={`w-full py-2 px-4 rounded transition-colors ${isLoading || !formData.selectedFile ? 'bg-gray-300 cursor-not-allowed' : 'bg-blue-500 text-white hover:bg-blue-600'}`}>
                        {isLoading ? 'Subiendo...' : 'Agregar protocolo'}
                    </button>
                </form>
            </div>
             {/* Indicador de carga */}
             {isLoading && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded-lg shadow-xl">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
                        <p className="text-center">Subiendo protocolo a la nube...</p>
                    </div>
                </div>
            )}
        </div>
    );
}