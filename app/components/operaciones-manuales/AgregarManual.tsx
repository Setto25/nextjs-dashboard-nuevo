"use client";

import { useState, ChangeEvent, useRef } from "react";
import { toast } from "react-toastify";
import { useUploadStore } from "@/app/store/store";

export default function AgregarManual() {
  const alternarActualizarManuales = useUploadStore((state) => state.alternarActualizar);
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    titulo: "",
    selectedFile: null as File | null,
    descripcion: '',
    categorias: '', // Aquí se guarda el "Tema" seleccionado
    portada: null as File | null,
  });

  const resetForm = () => {
    setFormData({ titulo: '', selectedFile: null, descripcion: '', categorias: '', portada: null });
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // --- FUNCIONES DE UTILIDAD (PDF) ---
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
      script.onerror = () => reject(new Error("No se pudo cargar la librería PDF.js"));
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
      // Intentamos generar portada solo si es PDF
      if (file.type === "application/pdf") {
        setIsLoading(true);
        try {
          const portadaBase64 = await obtenerPortadaPDF(file);
          const portadaBlob = base64ToBlob(portadaBase64);
          const portadaFile = new File([portadaBlob], "portada.webp", { type: "image/webp" });
          setFormData((prev) => ({ ...prev, selectedFile: file, portada: portadaFile }));
        } catch (err) {
          toast.warning("No se pudo generar portada automática (se subirá sin ella).");
          setFormData((prev) => ({ ...prev, selectedFile: file, portada: null }));
        } finally {
          setIsLoading(false);
        }
      } else {
        // Si es docx, ppt, etc., solo lo guardamos sin portada automática
        setFormData((prev) => ({ ...prev, selectedFile: file, portada: null }));
      }
    }
  };

  // --- SUBIDA NUEVA (FIRMA -> SUBIDA -> GUARDAR) ---
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!formData.titulo.trim() || !formData.selectedFile || !formData.categorias.trim()) {
      toast.error("El título, el tema y el archivo son obligatorios.");
      return;
    }

    setIsLoading(true);

    try {
      // 1. SOLICITAR FIRMA (API Notario)
      const firmaResponse = await fetch('/api/manuales/firmar', {
        method: 'POST',
        body: JSON.stringify({
          nombreManual: formData.selectedFile.name,
          tipoManual: formData.selectedFile.type,
          nombrePortada: formData.portada?.name,
          tipoPortada: formData.portada?.type
        })
      });

      if (!firmaResponse.ok) throw new Error('Error al obtener permisos de subida');

      // Recuperamos las URLs (Subida y Pública)
      const { 
        urlSubidaManual, 
        urlSubidaPortada, 
        urlPublicaManual, 
        urlPublicaPortada 
      } = await firmaResponse.json();

      // 2. SUBIR A BACKBLAZE (PUT)
      await fetch(urlSubidaManual, {
        method: 'PUT',
        body: formData.selectedFile,
        headers: { 'Content-Type': formData.selectedFile.type }
      });

      if (formData.portada && urlSubidaPortada) {
        await fetch(urlSubidaPortada, {
          method: 'PUT',
          body: formData.portada,
          headers: { 'Content-Type': formData.portada.type }
        });
      }

      // 3. GUARDAR EN BASE DE DATOS (API Archivista)
      const guardarResponse = await fetch('/api/manuales/guardar', {
        method: 'POST',
        body: JSON.stringify({
          titulo: formData.titulo,
          tema: formData.categorias, // Enviamos lo que seleccionó en el Select
          descripcion: formData.descripcion,
          
          // 🔥 ENVIAMOS LAS URLS PÚBLICAS COMPLETAS
          urlFinalManual: urlPublicaManual,
          urlFinalPortada: urlPublicaPortada,
          
          formato: formData.selectedFile.name.split('.').pop()?.toLowerCase() || 'desconocido'
        })
      });

      if (!guardarResponse.ok) {
        const errorData = await guardarResponse.json();
        throw new Error(errorData.message || 'Error al guardar en base de datos');
      }

      toast.success('Manual subido correctamente');
      resetForm();
      alternarActualizarManuales();

    } catch (error) {
      console.error('Error al subir manual:', error);
      toast.error(error instanceof Error ? error.message : 'Error desconocido');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-wrap bg-gray-100 space-y-6 rounded-lg justify-between px-10 items-center">
      {/* Instrucciones */}
      <div className="Intrucciones__agregar p-6 rounded-lg flex grow flex-col w-2/4 justify-center items-center space-y-4">
        <p className="text-lg font-semibold text-gray-800 mb-4">Sube tus manuales técnicos.</p>
        <ol className="space-y-4 text-gray-700 text-sm">
           <li>1. Selecciona el archivo (PDF, DOCX, PPT).</li>
           <li>2. Si es PDF, generaremos una portada automáticamente.</li>
           <li>3. El archivo se guardará de forma segura en la nube.</li>
        </ol>
      </div>

      {/* Formulario */}
      <div className="Formulario__agregar rounded-lg justify-center items-center flex flex-col space-y-4 w-1/3">
        <h1 className="text-2xl font-bold mb-4 text-center">Agregar Nuevo Manual</h1>
        <form onSubmit={handleSubmit} className="space-y-4 flex flex-col w-full">

          <input type="text" placeholder="Título" value={formData.titulo} onChange={(e) => setFormData({ ...formData, titulo: e.target.value })} className="w-full p-2 border rounded" required />
          
          <select value={formData.categorias} onChange={(e) => setFormData({ ...formData, categorias: e.target.value })} className="w-full p-2 border rounded" required>
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
             <label className="block mb-2 text-sm font-medium text-gray-900">Archivo del Manual</label>
             <input type="file" ref={fileInputRef} accept=".pdf,.doc,.docx,.txt,.ppt,.pptx" onChange={handleFileChange} className="w-full p-2 border rounded bg-white" required />
             {formData.portada && <img src={URL.createObjectURL(formData.portada)} alt="Portada" className="mt-2 rounded shadow w-24 h-auto border" />}
          </div>

          <textarea placeholder="Descripción" value={formData.descripcion} onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })} className="w-full p-2 border rounded" />

          <button type="submit" disabled={isLoading || !formData.selectedFile} className={`w-full py-2 px-4 rounded transition-colors ${isLoading ? 'bg-gray-400' : 'bg-blue-500 hover:bg-blue-600 text-white'}`}>
            {isLoading ? 'Subiendo...' : 'Agregar Manual'}
          </button>
        </form>
      </div>
      
      {/* Loading Overlay */}
      {isLoading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-center">Subiendo manual a la nube...</p>
          </div>
        </div>
      )}
    </div>
  );
}