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
    descripcion: "",
    categorias: "",
    portada: null as File | null,
  });

  const resetForm = () => {
    setFormData({ titulo: "", selectedFile: null, descripcion: "", categorias: "", portada: null });
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // --- PDF HELPERS ---
  async function getPdfjsLib() {
    // @ts-ignore
    if (window.pdfjsLib) return window.pdfjsLib;
    return new Promise((resolve, reject) => {
      const script = document.createElement("script");
      script.src = "//cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js";
      script.onload = () => {
        // @ts-ignore
        const pdfjsLib = window.pdfjsLib;
        pdfjsLib.GlobalWorkerOptions.workerSrc = "//cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";
        resolve(pdfjsLib);
      };
      script.onerror = () => reject(new Error("Error cargando PDF.js"));
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
      if (file.type !== "application/pdf") {
        toast.error("El archivo debe ser un PDF.");
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
        toast.warning("No se pudo generar portada automática.");
        setFormData((prev) => ({ ...prev, selectedFile: file, portada: null }));
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!formData.titulo.trim() || !formData.selectedFile || !formData.categorias.trim()) {
      toast.error("Título, Tema y Archivo son obligatorios.");
      return;
    }
    setIsLoading(true);
    try {
      const firmaRes = await fetch("/api/manuals/firmar", {
        method: "POST",
        body: JSON.stringify({
          nombreManual: formData.selectedFile.name,
          tipoManual: formData.selectedFile.type,
          nombrePortada: formData.portada?.name,
          tipoPortada: formData.portada?.type,
        }),
      });
      if (!firmaRes.ok) throw new Error("Error firmando");
      const { urlSubidaManual, urlSubidaPortada, urlPublicaManual, urlPublicaPortada } = await firmaRes.json();

      await fetch(urlSubidaManual, { method: "PUT", body: formData.selectedFile, headers: { "Content-Type": formData.selectedFile.type } });
      if (formData.portada && urlSubidaPortada) await fetch(urlSubidaPortada, { method: "PUT", body: formData.portada, headers: { "Content-Type": formData.portada.type } });

      const guardarRes = await fetch("/api/manuals/guardar", {
        method: "POST",
        body: JSON.stringify({
          titulo: formData.titulo,
          tema: formData.categorias,
          descripcion: formData.descripcion,
          urlFinalManual: urlPublicaManual,
          urlFinalPortada: urlPublicaPortada,
          formato: "pdf",
        }),
      });
      if (!guardarRes.ok) throw new Error("Error guardando");
      toast.success("Manual subido correctamente");
      resetForm();
      alternarActualizarManuales();
    } catch (error) { toast.error("Error al subir manual"); } finally { setIsLoading(false); }
  };

  return (
    <div className="flex flex-wrap bg-gray-100 space-y-6 rounded-lg justify-between px-10 items-center">
      
      {/* --- INSTRUCCIONES ADECUADAS (Manuales) --- */}
      <div className="Intrucciones__agregar p-6 rounded-lg flex grow flex-col w-2/4 justify-center items-center space-y-4">
        <p className="text-lg font-semibold text-gray-800 mb-4">
          Sube un nuevo manual técnico.
        </p>
        <ol className="space-y-4 text-gray-700">
          <li className="bg-white p-4 rounded-md shadow-sm">
            <h3 className="font-bold text-emerald-600 mb-2">1. Selecciona el archivo PDF</h3>
            <p>Asegúrate de que el manual esté en formato <strong>.PDF</strong> para visualizarlo.</p>
          </li>
          <li className="bg-white p-4 rounded-md shadow-sm">
            <h3 className="font-bold text-emerald-600 mb-2">2. Asigna un Tema</h3>
            <p>Selecciona el área clínica correspondiente (ej: Monitorización, Respiratorio).</p>
          </li>
          <li className="bg-white p-4 rounded-md shadow-sm">
            <h3 className="font-bold text-emerald-600 mb-2">3. Sube el Manual</h3>
            <p>El documento quedará disponible inmediatamente en la sección de manuales de la bibliteca.</p>
          </li>
        </ol>
      </div>

      <div className="Formulario__agregar rounded-lg justify-center items-center flex flex-col space-y-4 w-1/3 min-w-[300px]">
        <h1 className="text-2xl font-bold mb-4 text-center">Agregar Manual</h1>
        <form onSubmit={handleSubmit} className="space-y-4 flex flex-col w-full">
          <input type="text" placeholder="Título" value={formData.titulo} onChange={(e) => setFormData({ ...formData, titulo: e.target.value })} className="w-full p-2 border rounded" required />
          
          <select value={formData.categorias} onChange={(e) => setFormData({ ...formData, categorias: e.target.value })} className="w-full p-2 border rounded" required>
            <option value="" disabled>Seleccione Tema</option>
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
             <label className="block mb-2 text-sm font-medium">Archivo PDF</label>
             <input type="file" ref={fileInputRef} accept=".pdf" onChange={handleFileChange} className="w-full p-2 border rounded bg-white" required />
             {formData.portada && <img src={URL.createObjectURL(formData.portada)} alt="Portada" className="mt-2 rounded shadow w-24 h-auto border" />}
          </div>

          <textarea placeholder="Descripción" value={formData.descripcion} onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })} className="w-full p-2 border rounded" />

          <button type="submit" disabled={isLoading || !formData.selectedFile} className="w-full py-2 px-4 rounded bg-emerald-600 text-white hover:bg-emerald-700 disabled:bg-gray-400">
            {isLoading ? "Subiendo..." : "Agregar Manual"}
          </button>
        </form>
      </div>
      {isLoading && (<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"><div className="bg-white p-6 rounded-lg shadow-xl"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500 mx-auto mb-4"></div><p>Subiendo...</p></div></div>)}
    </div>
  );
}