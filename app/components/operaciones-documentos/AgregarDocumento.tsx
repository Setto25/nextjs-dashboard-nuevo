"use client";

import { useState, ChangeEvent, useRef, useEffect } from "react";
import { toast } from "react-toastify";
import { useUploadStore } from "@/app/store/store";

export default function AgregarDocumento() {
  const alternarActualizarDocumentos = useUploadStore((state) => state.alternarActualizar);
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    tema: "",
    temaId: null as number | null,
    titulo: "",
    portada: null as File | null,
    selectedFile: null as File | null,
    descripcion: "",
    categorias: "",
    formato: "",
  });

  interface SubMenuItem { id: number; nombre: string; subCategoria: string; }
  interface Categoria { id: number; nombre: string; categoria: string; menuCategorias: SubMenuItem[]; }

  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [temas, setTemas] = useState<SubMenuItem[]>([]);
  const [categoriaId, setCategoriaId] = useState<number | "">("");

  const fetchCategorias = async () => {
    try {
      const res = await fetch("/api/categorias");
      if (res.ok) setCategorias(await res.json());
    } catch { toast.error("Error cargando categorías"); }
  };

  const fetchTemas = async () => {
    try {
      let url = "/api/temas-categorias";
      if (categoriaId) url += `?categoriaId=${categoriaId}`;
      const res = await fetch(url);
      if (res.ok) setTemas(await res.json());
    } catch { toast.error("Error cargando temas"); }
  };

  useEffect(() => { fetchCategorias(); }, []);
  useEffect(() => { fetchTemas(); }, [categoriaId]);

  const resetForm = () => {
    setFormData({ temaId: null, tema: "", titulo: "", portada: null, selectedFile: null, descripcion: "", categorias: "", formato: "" });
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
        toast.warning("No se pudo generar portada, se subirá sin ella.");
        setFormData((prev) => ({ ...prev, selectedFile: file, portada: null }));
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!formData.titulo.trim() || !formData.selectedFile || !formData.temaId) {
      toast.error("Complete Título, Archivo y Tema.");
      return;
    }
    setIsLoading(true);
    try {
      const firmaRes = await fetch("/api/documents/firmar", {
        method: "POST",
        body: JSON.stringify({
          nombreDocumento: formData.selectedFile.name,
          tipoDocumento: formData.selectedFile.type,
          nombrePortada: formData.portada?.name,
          tipoPortada: formData.portada?.type,
        }),
      });
      if (!firmaRes.ok) throw new Error("Error firmando");
      const { urlSubidaDocumento, urlSubidaPortada, urlPublicaDocumento, urlPublicaPortada } = await firmaRes.json();

      await fetch(urlSubidaDocumento, { method: "PUT", body: formData.selectedFile, headers: { "Content-Type": formData.selectedFile.type } });
      if (formData.portada && urlSubidaPortada) await fetch(urlSubidaPortada, { method: "PUT", body: formData.portada, headers: { "Content-Type": formData.portada.type } });

      const guardarRes = await fetch("/api/documents/guardar", {
        method: "POST",
        body: JSON.stringify({
          titulo: formData.titulo,
          tema: formData.tema,
          temaId: Number(formData.temaId),
          descripcion: formData.descripcion,
          categorias: formData.categorias,
          urlFinalDocumento: urlPublicaDocumento,
          urlFinalPortada: urlPublicaPortada,
        }),
      });
      if (!guardarRes.ok) throw new Error("Error guardando");
      toast.success("Documento subido correctamente");
      resetForm();
      alternarActualizarDocumentos();
    } catch (error) { toast.error("Error al subir documento"); } finally { setIsLoading(false); }
  };

  return (
    <div className="flex flex-wrap bg-gray-100 space-y-6 rounded-lg justify-between px-10 items-center">
      
      {/* --- INSTRUCCIONES ADECUADAS (Documentos) --- */}
      <div className="Intrucciones__agregar p-6 rounded-lg flex grow flex-col w-2/4 justify-center items-center space-y-4">
        <p className="text-lg font-semibold text-gray-800 mb-4">
          Sube un nuevo documento a la biblioteca.
        </p>
        <ol className="space-y-4 text-gray-700">
          <li className="bg-white p-4 rounded-md shadow-sm">
            <h3 className="font-bold text-emerald-600 mb-2">1. Selecciona el archivo PDF</h3>
            <p>El sistema solo acepta formato <strong>.PDF</strong> para generar la vista previa.</p>
          </li>
          <li className="bg-white p-4 rounded-md shadow-sm">
            <h3 className="font-bold text-emerald-600 mb-2">2. Clasificación</h3>
            <p>Selecciona la <strong>Categoría</strong> principal y luego el <strong>Tema</strong> específico.</p>
          </li>
          <li className="bg-white p-4 rounded-md shadow-sm">
            <h3 className="font-bold text-emerald-600 mb-2">3. Detalles y Subida</h3>
            <p>Ingresa título, descripción y palabras clave para facilitar la búsqueda.</p>
          </li>
        </ol>
      </div>

      {/* FORMULARIO */}
      <div className="Formulario__agregar rounded-lg justify-center items-center flex flex-col space-y-4">
        <h1 className="text-2xl font-bold mb-4 text-center">Agregar Documento</h1>
        <form onSubmit={handleSubmit} className="space-y-4 flex flex-col">
          <input type="text" placeholder="Título" value={formData.titulo} onChange={(e) => setFormData({ ...formData, titulo: e.target.value })} className="w-full p-2 border rounded" required />
          
          <select value={categoriaId} onChange={(e) => setCategoriaId(e.target.value ? Number(e.target.value) : "")} required className="p-2 border rounded">
            <option value="">Seleccione Categoría</option>
            {categorias.map((cat) => (<option key={cat.id} value={cat.id}>{cat.nombre}</option>))}
          </select>

          <select value={formData.temaId ?? ""} onChange={(e) => {
              const selectedTema = temas.find((t) => t.id === Number(e.target.value));
              setFormData({ ...formData, temaId: e.target.value ? Number(e.target.value) : null, tema: selectedTema ? selectedTema.subCategoria : "" });
            }} className="w-full p-2 border rounded" required>
            <option value="">Seleccione Tema</option>
            {temas.map((t) => (<option key={t.id} value={t.id}>{t.subCategoria}</option>))}
          </select>

          <div>
            <label className="block mb-2 text-sm font-medium">Archivo PDF</label>
            <input type="file" ref={fileInputRef} accept=".pdf" onChange={handleFileChange} className="w-full p-2 border rounded" required />
            {formData.portada && <img src={URL.createObjectURL(formData.portada)} alt="Portada" className="mt-2 rounded shadow w-32 h-auto border" />}
          </div>

          <textarea placeholder="Descripción" value={formData.descripcion} onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })} className="w-full p-2 border rounded" />
          <input type="text" placeholder="Palabras clave (separadas por coma)" value={formData.categorias} onChange={(e) => setFormData({ ...formData, categorias: e.target.value })} className="w-full p-2 border rounded" />

          <button type="submit" disabled={isLoading || !formData.selectedFile} className="w-full py-2 px-4 rounded bg-emerald-600 text-white hover:bg-emerald-700 disabled:bg-gray-400">
            {isLoading ? "Subiendo..." : "Agregar Documento"}
          </button>
        </form>
      </div>
      {isLoading && (<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"><div className="bg-white p-6 rounded-lg shadow-xl"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500 mx-auto mb-4"></div><p>Subiendo...</p></div></div>)}
    </div>
  );
}