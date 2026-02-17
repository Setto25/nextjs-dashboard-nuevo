"use client";

import { useState, ChangeEvent, useRef } from "react";
import { toast } from "react-toastify";
import { useUploadStore } from "@/app/store/store";

export default function AgregarDocumento() {
  // --- ESTADOS Y REF ---
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Store global para actualizar la lista al terminar
  const alternarActualizarLibros = useUploadStore(
    (state) => state.alternarActualizar
  );

  const [formData, setFormData] = useState({
    tema: "",
    titulo: "",
    selectedFile: null as File | null,
    descripcion: "",
    categorias: "",
    portada: null as File | null,
  });

  // --- HELPER: RESETEAR FORMULARIO ---
  const resetForm = () => {
    setFormData({
      tema: "",
      titulo: "",
      selectedFile: null,
      descripcion: "",
      categorias: "",
      portada: null,
    });
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // ----------------------------------------------------------------
  // --- UTILIDADES PDF (GENERAR PORTADA) ---
  // ----------------------------------------------------------------

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

  // ----------------------------------------------------------------
  // --- HANDLERS ---
  // ----------------------------------------------------------------

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
        const portadaFile = new File([portadaBlob], "portada.webp", {
          type: "image/webp",
        });

        setFormData((prev) => ({
          ...prev,
          selectedFile: file,
          portada: portadaFile,
        }));
      } catch (err) {
        toast.error("No se pudo extraer la portada del PDF.");
        console.error(err);
        setFormData((prev) => ({
          ...prev,
          selectedFile: file,
          portada: null,
        }));
      } finally {
        setIsLoading(false);
      }
    }
  };

  // --- LÓGICA PRINCIPAL DE SUBIDA (CORREGIDA) ---
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!formData.titulo.trim() || !formData.selectedFile || !formData.tema.trim()) {
      toast.error("Completa todos los campos obligatorios.");
      return;
    }

    setIsLoading(true);

    try {
      // 1. OBTENER FIRMAS (Permisos de subida + URLs Finales)
      const firmaResponse = await fetch("/api/books/firmar", {
        method: "POST",
        body: JSON.stringify({
          nombreLibro: formData.selectedFile.name,
          tipoLibro: formData.selectedFile.type,
          nombrePortada: formData.portada?.name,
          tipoPortada: formData.portada?.type,
        }),
      });

      if (!firmaResponse.ok) throw new Error("Error al firmar la subida");

      // 🔥 AQUÍ ESTÁ LA CORRECCIÓN CLAVE:
      // Recibimos las llaves TEMPORALES (paraSubir) y las DEFINITIVAS (publica)
      const { 
        urlParaSubirLibro, 
        urlParaSubirPortada, 
        urlPublicaLibro, 
        urlPublicaPortada 
      } = await firmaResponse.json();

      // 2. SUBIR A LA NUBE (PUT) usando las llaves temporales
      // Subimos el Libro
      await fetch(urlParaSubirLibro, {
        method: "PUT",
        body: formData.selectedFile,
        headers: { "Content-Type": formData.selectedFile.type },
      });

      // Subimos la Portada (si existe)
      if (formData.portada && urlParaSubirPortada) {
        await fetch(urlParaSubirPortada, {
          method: "PUT",
          body: formData.portada,
          headers: { "Content-Type": formData.portada.type },
        });
      }

      // 3. GUARDAR EN BASE DE DATOS (POST) usando las URLs públicas
      const guardarResponse = await fetch("/api/books/guardar", {
        method: "POST",
        body: JSON.stringify({
          titulo: formData.titulo,
          tema: formData.tema,
          descripcion: formData.descripcion,
          categorias: formData.categorias,
          
          // 🔥 ENVIAMOS LA URL PÚBLICA (HTTPS://...) A NEON
          urlFinalLibro: urlPublicaLibro,      
          urlFinalPortada: urlPublicaPortada, 
          
          formatoOriginal: formData.selectedFile.type.split('/')[1]
        }),
      });

      if (!guardarResponse.ok) {
        const errorData = await guardarResponse.json();
        throw new Error(errorData.message || "Error al guardar en BD");
      }

      toast.success("¡Libro subido con éxito!");
      resetForm();
      alternarActualizarLibros();
      
    } catch (error) {
      console.error("Error al subir:", error);
      toast.error(error instanceof Error ? error.message : "Error desconocido");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-wrap bg-gray-100 space-y-6 rounded-lg justify-between px-10 items-center">
      {/* Sección de Instrucciones */}
      <div className="Intrucciones__agregar p-6 rounded-lg flex grow flex-col w-2/4 justify-center items-center space-y-4">
        <p className="text-lg font-semibold text-gray-800 mb-4">
          Sube un nuevo documento a la plataforma.
        </p>
        <ol className="space-y-4 text-gray-700">
          <li className="bg-white p-4 rounded-md shadow-sm">
            <h3 className="font-bold text-blue-600 mb-2">1. Selecciona el archivo</h3>
            <p>Haz clic en "Seleccionar archivo" y elige el PDF.</p>
          </li>
          <li className="bg-white p-4 rounded-md shadow-sm">
            <h3 className="font-bold text-blue-600 mb-2">2. Completa los detalles</h3>
            <p>Ingresa título, tema, descripción y categorías.</p>
          </li>
          <li className="bg-white p-4 rounded-md shadow-sm">
            <h3 className="font-bold text-blue-600 mb-2">3. Sube el documento</h3>
            <p>El sistema lo subirá a Backblaze B2 sin límites.</p>
          </li>
        </ol>
      </div>

      {/* Sección de Formulario */}
      <div className="Formulario__agregar rounded-lg justify-center items-center flex flex-col space-y-4">
        <h1 className="text-2xl font-bold mb-4 text-center">Agregar Nuevo Libro</h1>
        <form onSubmit={handleSubmit} className="space-y-4 flex flex-col">
          <input
            type="text"
            placeholder="Título"
            value={formData.titulo}
            onChange={(e) => setFormData({ ...formData, titulo: e.target.value })}
            className="w-full p-2 border rounded"
            required
          />
          <select
            value={formData.tema}
            onChange={(e) => setFormData({ ...formData, tema: e.target.value })}
            className="w-full p-2 border rounded"
            required
          >
            <option value="" disabled>Tema</option>
            <option value="reanimacion-neonatal">Reanimación Neonatal</option>
            <option value="cuidados-generales">Cuidados Generales</option>
            <option value="soporte-respiratorio">Soporte Respiratorio</option>
            <option value="manejo-de-infecciones">Manejo de Infecciones</option>
            <option value="nutricion-alimentacion">Nutrición / Alimentación</option>
            <option value="administracion-de-medicamentos">Administración de Medicamentos</option>
            <option value="procedimientos-invasivos">Procedimientos Invasivos</option>
            <option value="cuidados-de-piel-termoregulacion">Cuidados de Piel / Termoregulación</option>
            <option value="monitorizacion">Monitorización</option>
            <option value="otros">Otros</option>
          </select>

          <div>
            <label className="block mb-2 text-sm font-medium text-gray-900">
              Seleccionar PDF
            </label>
            <input
              type="file"
              ref={fileInputRef}
              accept=".pdf"
              onChange={handleFileChange}
              className="w-full p-2 border rounded"
              required
            />
            {formData.selectedFile && (
              <p className="mt-2 text-sm text-gray-600">
                Archivo: {formData.selectedFile.name}
              </p>
            )}
            {formData.portada && (
              <img
                src={URL.createObjectURL(formData.portada)}
                alt="Portada generada"
                className="mt-2 rounded shadow w-32 h-auto border"
              />
            )}
          </div>

          <textarea
            placeholder="Descripción"
            value={formData.descripcion}
            onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
            className="w-full p-2 border rounded"
          />
          <input
            type="text"
            placeholder="Categorías (separadas por coma)"
            value={formData.categorias}
            onChange={(e) => setFormData({ ...formData, categorias: e.target.value })}
            className="w-full p-2 border rounded"
          />

          <button
            type="submit"
            disabled={isLoading || !formData.selectedFile}
            className={`w-full py-2 px-4 rounded transition-colors ${
              isLoading || !formData.selectedFile
                ? "bg-gray-300 cursor-not-allowed"
                : "bg-blue-500 text-white hover:bg-blue-600"
            }`}
          >
            {isLoading ? "Subiendo..." : "Agregar Libro"}
          </button>
        </form>
      </div>
    </div>
  );
}