"use client";

import { useState, ChangeEvent, useRef } from "react";
import { toast } from "react-toastify";
import { useUploadStore } from "@/app/store/store";
// 1. ELIMINAMOS la importación de 'pdfjs-dist' de aquí

export default function AgregarDocumento() {
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
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
  // --- FUNCIONES DE UTILIDAD (PDF) ---
  // ----------------------------------------------------------------

  // 2. SE AÑADE la función getPdfjsLib que faltaba
  /**
   * Carga dinámicamente el script de pdfjs-dist desde un CDN.
   * Carga la librería una sola vez y la reutiliza.
   */
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
        // Configura el worker, que se carga desde el mismo CDN/versión
        pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfJsVersion}/pdf.worker.min.js`;
        resolve(pdfjsLib);
      };

      script.onerror = () => {
        reject(new Error("No se pudo cargar la librería PDF.js"));
      };

      document.body.appendChild(script);
    });
  }

  /**
   * Extrae la primera página de un PDF como una imagen base64.
   */
  async function obtenerPortadaPDF(file: File): Promise<string> {
    // @ts-ignore
    const pdfjsLib = await getPdfjsLib(); // Ahora esta línea funciona

    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    const page = await pdf.getPage(1);
    const viewport = page.getViewport({ scale: 1.5 });

    const canvas = document.createElement("canvas");
    canvas.width = viewport.width;
    canvas.height = viewport.height;
    const context = canvas.getContext("2d");

    await page.render({ canvasContext: context!, viewport }).promise;
    return canvas.toDataURL("image/png");
  }

  /**
   * Convierte una cadena base64 a un objeto Blob.
   */
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
  // --- MANEJADORES DE EVENTOS ---
  // ----------------------------------------------------------------

  /**
   * Manejador para el input de archivo. Genera la portada al seleccionar un PDF.
   */
  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type !== "application/pdf") {
        toast.error("El archivo debe ser un PDF.");
        if (fileInputRef.current) fileInputRef.current.value = "";
        setFormData((prev) => ({ ...prev, selectedFile: null, portada: null }));
        return;
      }

      setIsLoading(true); // Muestra spinner mientras genera portada
      try {
        const portadaBase64 = await obtenerPortadaPDF(file);
        const portadaBlob = base64ToBlob(portadaBase64);
        const portadaFile = new File([portadaBlob], "portada.png", {
          type: "image/png",
        });

        // Guarda el PDF y la Portada en el estado
        setFormData((prev) => ({
          ...prev,
          selectedFile: file,
          portada: portadaFile,
        }));
      } catch (err) {
        toast.error("No se pudo extraer la portada del PDF.");
        console.error("Error detallado al extraer portada:", err);
        // Si falla, al menos guarda el PDF
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

  /**
   * Manejador para enviar el formulario.
   */
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (
      !formData.titulo.trim() ||
      !formData.selectedFile ||
      !formData.tema.trim()
    ) {
      toast.error("El título, el tema y el archivo son obligatorios.");
      return;
    }

    setIsLoading(true);

    try {
      const formDataToSend = new FormData();

      formDataToSend.append("titulo", formData.titulo);
      formDataToSend.append("tema", formData.tema);
      formDataToSend.append("descripcion", formData.descripcion);
      formDataToSend.append("categorias", formData.categorias);

      if (formData.selectedFile) {
        formDataToSend.append("libro", formData.selectedFile);
      }

      // Añade la portada al formulario si se generó
      if (formData.portada) {
        formDataToSend.append("portada", formData.portada);
      }

      const response = await fetch("/api/books", {
        method: "POST",
        body: formDataToSend,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Error en la respuesta del servidor");
      }

      toast.success("Libro subido correctamente a Backblaze B2");
      resetForm();
      alternarActualizarLibros();
      
    // 3. CORRECCION Del bloque catch de handleSubmit
    } catch (error) {
      console.error("Error al subir Libro:", error);
      toast.error(
        error instanceof Error ? error.message : "Error al agregar Libro"
      );
    } finally {
      setIsLoading(false);
    }
  };

  // ----------------------------------------------------------------
  // --- RENDERIZADO DEL COMPONENTE (JSX) ---
  // ----------------------------------------------------------------
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
            <p>
              Haz clic en "Seleccionar archivo" y elige el PDF que deseas subir
              desde tu computador.
            </p>
          </li>
          <li className="bg-white p-4 rounded-md shadow-sm">
            <h3 className="font-bold text-blue-600 mb-2">2. Completa los detalles</h3>
            <ul className="list-disc list-inside pl-4 space-y-1">
              <li>Ingresa un título descriptivo y selecciona un tema.</li>
              <li>Agrega una descripción y categorías para facilitar la búsqueda.</li>
            </ul>
          </li>
          <li className="bg-white p-4 rounded-md shadow-sm">
            <h3 className="font-bold text-blue-600 mb-2">3. Sube el documento</h3>
            <p>
              Haz clic en "Agregar Libro". El sistema lo subirá de forma segura a
              la nube (Backblaze B2).
            </p>
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
            onChange={(e) =>
              setFormData({ ...formData, titulo: e.target.value })
            }
            className="w-full p-2 border rounded"
            required
          />
          <select
            value={formData.tema}
            onChange={(e) => setFormData({ ...formData, tema: e.target.value })}
            className="w-full p-2 border rounded"
            required
          >
            <option value="" disabled>
              Tema
            </option>
            <option value="reanimacion-neonatal">Reanimación Neonatal</option>
            <option value="cuidados-generales">Cuidados Generales</option>
            <option value="soporte-respiratorio">Soporte Respiratorio</option>
            <option value="manejo-de-infecciones">Manejo de Infecciones</option>
            <option value="nutricion-alimentacion">
              Nutrición / Alimentación
            </option>
            <option value="administracion-de-medicamentos">
              Administración de Medicamentos
            </option>
            <option value="procedimientos-invasivos">
              Procedimientos Invasivos
            </option>
            <option value="cuidados-de-piel-termoregulacion">
              Cuidados de Piel / Termoregulación
            </option>
            <option value="monitorizacion">Monitorización</option>
            <option value="otros">Otros</option>
          </select>

          {/* ///////////Seleccion del PDF y vista previa de portada///////////// */}
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
                Archivo seleccionado: {formData.selectedFile.name}
              </p>
            )}

            {/* Muestra la vista previa de la portada generada */}
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
            onChange={(e) =>
              setFormData({ ...formData, descripcion: e.target.value })
            }
            className="w-full p-2 border rounded"
          />
          <input
            type="text"
            placeholder="Categorías (separadas por coma)"
            value={formData.categorias}
            onChange={(e) =>
              setFormData({ ...formData, categorias: e.target.value })
            }
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
            {isLoading ? "Procesando..." : "Agregar Libro"}
          </button>
        </form>
      </div>
    </div>
  );
}