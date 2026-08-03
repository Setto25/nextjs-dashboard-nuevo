"use client";

import { useUploadStore } from "@/app/store/store";
import { useState, ChangeEvent, useRef } from "react";
import { toast } from "react-toastify";

export default function AgregarProtocolo() {
  const alternarActualizarProtocolos = useUploadStore((state) => state.alternarActualizar);
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    titulo: "",
    descripcion: "",
    categoria: "",
    fechaCreacion: "",
    fechaRevision: "",
    version: "",
    codigo: "",
    creadoPor: "",
    selectedFile: null as File | null,
    portada: null as File | null,
  });

  const resetForm = () => {
    setFormData({ titulo: "", descripcion: "", categoria: "", fechaCreacion: "", fechaRevision: "", version: "", codigo: "", creadoPor: "", selectedFile: null, portada: null });
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
        toast.error("Solo se permiten archivos PDF");
        if (fileInputRef.current) fileInputRef.current.value = "";
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
        setFormData((prev) => ({ ...prev, selectedFile: file }));
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!formData.titulo.trim() || !formData.selectedFile || !formData.categoria) {
      toast.error("Título, categoría y archivo son obligatorios");
      return;
    }
    setIsLoading(true);
    try {
      const firmaRes = await fetch("/api/protocolos/firmar", {
        method: "POST",
        body: JSON.stringify({
          nombreProtocolo: formData.selectedFile.name,
          tipoProtocolo: formData.selectedFile.type,
          nombrePortada: formData.portada?.name,
          tipoPortada: formData.portada?.type,
        }),
      });
      if (!firmaRes.ok) throw new Error("Error obteniendo firma");
      const { urlSubidaProtocolo, urlSubidaPortada, urlPublicaProtocolo, urlPublicaPortada } = await firmaRes.json();

      await fetch(urlSubidaProtocolo, { method: "PUT", body: formData.selectedFile, headers: { "Content-Type": formData.selectedFile.type } });
      if (formData.portada && urlSubidaPortada) await fetch(urlSubidaPortada, { method: "PUT", body: formData.portada, headers: { "Content-Type": formData.portada.type } });

      const guardarRes = await fetch("/api/protocolos/guardar", {
        method: "POST",
        body: JSON.stringify({
          codigo: formData.codigo,
          titulo: formData.titulo,
          descripcion: formData.descripcion,
          categoria: formData.categoria,
          version: formData.version,
          creadoPor: formData.creadoPor,
          fechaCreacion: formData.fechaCreacion,
          fechaRevision: formData.fechaRevision,
          rutaFinalProtocolo: urlPublicaProtocolo,
          rutaFinalPortada: urlPublicaPortada,
        }),
      });
      if (!guardarRes.ok) throw new Error("Error guardando");
      toast.success("Protocolo subido correctamente");
      resetForm();
      alternarActualizarProtocolos();
    } catch (error) { toast.error("Error desconocido"); } finally { setIsLoading(false); }
  };

  return (
    <div className="flex flex-wrap bg-gray-100 space-y-6 rounded-lg justify-between px-10 items-center">
      
      {/* --- INSTRUCCIONES ADECUADAS (Protocolos) --- */}
      <div className="Intrucciones__agregar p-6 rounded-lg flex grow flex-col w-2/4 justify-center items-center space-y-4">
        <p className="text-lg font-semibold text-gray-800 mb-4">
          Sube un nuevo protocolo médico.
        </p>
        <ol className="space-y-4 text-gray-700">
          <li className="bg-white p-4 rounded-md shadow-sm">
            <h3 className="font-bold text-emerald-600 mb-2">1. Selecciona el PDF</h3>
            <p>El formato debe ser <strong>.PDF</strong> para garantizar la visualización estándar.</p>
          </li>
          <li className="bg-white p-4 rounded-md shadow-sm">
            <h3 className="font-bold text-emerald-600 mb-2">2. Ficha Técnica</h3>
            <p>Completa las fechas de creación/revisión, versión y código del protocolo.</p>
          </li>
          <li className="bg-white p-4 rounded-md shadow-sm">
            <h3 className="font-bold text-emerald-600 mb-2">3. Sube el Protocolo</h3>
            <p>El protocolo aparecerá inmediatamente en la sección correspondiente.</p>
          </li>
        </ol>
      </div>

      <div className="Formulario__agregar rounded-lg justify-center items-center flex flex-col space-y-4 w-1/3 min-w-[300px]">
        <h1 className="text-2xl font-bold mb-4 text-center">Agregar Protocolo</h1>
        <form onSubmit={handleSubmit} className="space-y-4 flex flex-col w-full">
          <input type="text" placeholder="Título" value={formData.titulo} onChange={(e) => setFormData({ ...formData, titulo: e.target.value })} className="w-full p-2 border rounded" required />
          
          <textarea placeholder="Descripción" value={formData.descripcion} onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })} className="w-full p-2 border rounded" required />
          
          <select value={formData.categoria} onChange={(e) => setFormData({ ...formData, categoria: e.target.value })} className="w-full p-2 border rounded" required>
            <option value="" disabled>Categoría</option>
            <option value="cuidados_generales">Cuidados Generales</option>
            <option value="soporte_respiratorio">Soporte Respiratorio</option>
            <option value="manejo_infecciones">Manejo de Infecciones</option>
            <option value="nutricion_alimentacion">Nutrición / Alimentación</option>
            <option value="administracion_medicamentos">Administración de Medicamentos</option>
            <option value="procedimientos_invasivos">Procedimientos Invasivos</option>
            <option value="cuidados_piel_termoregulacion">Cuidados de Piel / Termoregulación</option>
            <option value="monitorizacion_uci">Monitorización UCI</option>
            <option value="protocolos_institucionales">Protocolos Institucionales</option>
            <option value="otros_protocolos">Otros</option>
          </select>

          <div className="flex gap-2">
            <div className="w-1/2">
              <label className="text-xs text-gray-500">Creación</label>
              <input type="date" value={formData.fechaCreacion} onChange={(e) => setFormData({ ...formData, fechaCreacion: e.target.value })} className="w-full p-2 border rounded" required />
            </div>
            <div className="w-1/2">
              <label className="text-xs text-gray-500">Revisión</label>
              <input type="date" value={formData.fechaRevision} onChange={(e) => setFormData({ ...formData, fechaRevision: e.target.value })} className="w-full p-2 border rounded" required />
            </div>
          </div>

          <div className="flex gap-2">
            <input type="text" placeholder="Versión (ej: 1.0)" value={formData.version} onChange={(e) => setFormData({ ...formData, version: e.target.value })} className="w-1/2 p-2 border rounded" required />
            <input type="text" placeholder="Código (ej: PRO-001)" value={formData.codigo} onChange={(e) => setFormData({ ...formData, codigo: e.target.value })} className="w-1/2 p-2 border rounded" required />
          </div>

          <input type="text" placeholder="Creado por" value={formData.creadoPor} onChange={(e) => setFormData({ ...formData, creadoPor: e.target.value })} className="w-full p-2 border rounded" required />
          
          <div>
            <label className="block mb-1 text-sm font-medium">Documento PDF</label>
            <input type="file" ref={fileInputRef} accept=".pdf" onChange={handleFileChange} className="w-full p-2 border rounded bg-white" required />
            {formData.portada && <img src={URL.createObjectURL(formData.portada)} alt="Preview" className="mt-2 h-20 w-auto shadow border rounded" />}
          </div>
          
          <button type="submit" disabled={isLoading || !formData.selectedFile} className="w-full py-2 px-4 rounded font-bold text-white bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-400">
            {isLoading ? "Subiendo..." : "Guardar Protocolo"}
          </button>
        </form>
      </div>
      {isLoading && (<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"><div className="bg-white p-6 rounded-lg shadow-xl"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500 mx-auto mb-4"></div><p>Subiendo...</p></div></div>)}
    </div>
  );
}