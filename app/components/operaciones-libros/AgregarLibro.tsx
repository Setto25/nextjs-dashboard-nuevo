"use client";

import { useState, ChangeEvent, useRef } from "react";
import { toast } from "react-toastify";
import { useUploadStore } from "@/app/store/store";

export default function AgregarLibro() {
  // Usamos el actualizador del Store (asegúrate de que tu store tenga esta propiedad o la genérica)
  const alternarActualizarLibros = useUploadStore((state) => state.alternarActualizar);
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    tema: "",
    titulo: "",
    selectedFile: null as File | null,
    descripcion: "",
    categorias: "",
    portada: null as File | null,
  });

  const resetForm = () => {
    setFormData({ tema: "", titulo: "", selectedFile: null, descripcion: "", categorias: "", portada: null });
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // --- PDF HELPERS (Para generar portada del libro) ---
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
        toast.error("El libro debe estar en formato PDF.");
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
        toast.warning("No se pudo generar la portada del libro.");
        setFormData((prev) => ({ ...prev, selectedFile: file, portada: null }));
      } finally {
        setIsLoading(false);
      }
    }
  };

  // --- SUBIDA DE LIBROS (Notario -> Backblaze -> Archivista) ---
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!formData.titulo.trim() || !formData.selectedFile || !formData.tema) {
      toast.error("Título, Tema y Archivo son obligatorios.");
      return;
    }

    setIsLoading(true);

    try {
      // 1. FIRMAR (Endpoint de Libros)
      const firmaRes = await fetch("/api/books/firmar", {
        method: "POST",
        body: JSON.stringify({
          nombreLibro: formData.selectedFile.name,
          tipoLibro: formData.selectedFile.type,
          nombrePortada: formData.portada?.name,
          tipoPortada: formData.portada?.type,
        }),
      });

      if (!firmaRes.ok) throw new Error("Error obteniendo permisos de subida");
      
      const { 
        urlParaSubirLibro,   // Llave temporal
        urlParaSubirPortada, // Llave temporal
        urlPublicaLibro,     // URL Definitiva (HTTPS)
        urlPublicaPortada    // URL Definitiva (HTTPS)
      } = await firmaRes.json();

      // 2. SUBIR A BACKBLAZE (PUT)
      await fetch(urlParaSubirLibro, {
        method: "PUT",
        body: formData.selectedFile,
        headers: { "Content-Type": formData.selectedFile.type },
      });

      if (formData.portada && urlParaSubirPortada) {
        await fetch(urlParaSubirPortada, {
          method: "PUT",
          body: formData.portada,
          headers: { "Content-Type": formData.portada.type },
        });
      }

      // 3. GUARDAR EN BD (Endpoint de Libros)
      const guardarRes = await fetch("/api/books/guardar", {
        method: "POST",
        body: JSON.stringify({
          titulo: formData.titulo,
          tema: formData.tema,
          descripcion: formData.descripcion,
          categorias: formData.categorias,
          
          // Enviamos las URLs públicas a Neon
          urlFinalLibro: urlPublicaLibro,
          urlFinalPortada: urlPublicaPortada,
          
          formatoOriginal: "pdf"
        }),
      });

      if (!guardarRes.ok) throw new Error("Error al guardar libro en base de datos");

      toast.success("Libro agregado correctamente");
      resetForm();
      alternarActualizarLibros(); // Refresca la lista de libros

    } catch (error) {
      console.error("Error:", error);
      toast.error("Error al subir el libro");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-wrap bg-gray-100 space-y-6 rounded-lg justify-between px-10 items-center">
      
      {/* --- INSTRUCCIONES PARA LIBROS --- */}
      <div className="Intrucciones__agregar p-6 rounded-lg flex grow flex-col w-2/4 justify-center items-center space-y-4">
        <p className="text-lg font-semibold text-gray-800 mb-4">
          Agrega un nuevo libro a la biblioteca digital.
        </p>
        <ol className="space-y-4 text-gray-700">
          <li className="bg-white p-4 rounded-md shadow-sm">
            <h3 className="font-bold text-blue-600 mb-2">1. Selecciona el Libro</h3>
            <p>El archivo debe ser un <strong>PDF</strong>. Se generará una portada automáticamente.</p>
          </li>
          <li className="bg-white p-4 rounded-md shadow-sm">
            <h3 className="font-bold text-blue-600 mb-2">2. Clasificación</h3>
            <p>Elige el <strong>Tema</strong> principal (ej: Neonatología, Farmacología) y añade etiquetas.</p>
          </li>
          <li className="bg-white p-4 rounded-md shadow-sm">
            <h3 className="font-bold text-blue-600 mb-2">3. Publicar</h3>
            <p>El libro quedará disponible inmediatamente en la sección de Biblioteca.</p>
          </li>
        </ol>
      </div>

      {/* --- FORMULARIO LIBROS --- */}
      <div className="Formulario__agregar rounded-lg justify-center items-center flex flex-col space-y-4 w-1/3 min-w-[300px]">
        <h1 className="text-2xl font-bold mb-4 text-center">Agregar Libro</h1>
        <form onSubmit={handleSubmit} className="space-y-4 flex flex-col w-full">
          <input type="text" placeholder="Título del Libro" value={formData.titulo} onChange={(e) => setFormData({ ...formData, titulo: e.target.value })} className="w-full p-2 border rounded" required />
          
          <select value={formData.tema} onChange={(e) => setFormData({ ...formData, tema: e.target.value })} className="w-full p-2 border rounded" required>
            <option value="" disabled>Seleccione un Tema</option>
            <option value="reanimacion-neonatal">Reanimación Neonatal</option>
            <option value="cuidados-generales">Cuidados Generales</option>
            <option value="soporte-respiratorio">Soporte Respiratorio</option>
            <option value="manejo-de-infecciones">Manejo de Infecciones</option>
            <option value="nutricion-alimentacion">Nutrición / Alimentación</option>
            <option value="administracion-de-medicamentos">Farmacología</option>
            <option value="procedimientos-invasivos">Procedimientos</option>
            <option value="cuidados-de-piel-termoregulacion">Piel y Termorregulación</option>
            <option value="monitorizacion">Monitorización</option>
            <option value="otros">Otros</option>
          </select>

          <div>
            <label className="block mb-2 text-sm font-medium">Archivo PDF</label>
            <input type="file" ref={fileInputRef} accept=".pdf" onChange={handleFileChange} className="w-full p-2 border rounded bg-white" required />
            {formData.portada && <img src={URL.createObjectURL(formData.portada)} alt="Portada Libro" className="mt-2 rounded shadow w-24 h-auto border" />}
          </div>

          <textarea placeholder="Descripción o Resumen" value={formData.descripcion} onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })} className="w-full p-2 border rounded" />
          
          <input type="text" placeholder="Etiquetas / Categorías (ej: 2024, Guía Minsal)" value={formData.categorias} onChange={(e) => setFormData({ ...formData, categorias: e.target.value })} className="w-full p-2 border rounded" />

          <button type="submit" disabled={isLoading || !formData.selectedFile} className="w-full py-2 px-4 rounded bg-blue-500 text-white hover:bg-blue-600 disabled:bg-gray-400">
            {isLoading ? "Subiendo..." : "Guardar Libro"}
          </button>
        </form>
      </div>

      {isLoading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-center">Subiendo libro...</p>
          </div>
        </div>
      )}
    </div>
  );
}