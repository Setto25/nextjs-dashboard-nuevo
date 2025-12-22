'use client'

import { useState, ChangeEvent, useRef, useEffect } from 'react'
import { toast } from 'react-toastify'
import { useUploadStore } from '@/app/store/store';
// Asegúrate de tener configurado pdfjs en tu proyecto o usar la función del CDN incluida abajo

export default function AgregarPlantilla() {
  const alternarActualizarPlantillas = useUploadStore((state) => state.alternarActualizar);
  const [isLoading, setIsLoading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // ----------------------------------------------------------------
  // 1. AJUSTE DE ESTADO: Agregamos 'palabrasClave' y separamos 'categoria'
  // ----------------------------------------------------------------
  const [formData, setFormData] = useState({
    tema: '',
    temaId: null as number | null, // Ajustado tipo
    titulo: '',
    portada: null as File | null,
    selectedFile: null as File | null,
    descripcion: '',
    categoria: '',      // Para el Dropdown (Schema: Categoria)
    palabrasClave: '',  // Para el Input de Texto (Schema: palabrasClave)
    formato: ''
  })

  // Función para reiniciar el formulario
  const resetForm = () => {
    setFormData({
      temaId: null,
      tema: '',
      titulo: '',
      portada: null,
      selectedFile: null,
      descripcion: '',
      categoria: '',
      palabrasClave: '', // Limpiamos también las palabras clave
      formato: ''
    })
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  // Interfaces
  interface SubMenuItem {
    id: number
    nombre: string
    subCategoria: string
  }

  interface Categoria {
    id: number
    nombre: string
    categoria: string
    menuCategorias: SubMenuItem[]
  }

  // Estados de datos externos
  const [categorias, setCategorias] = useState<Categoria[]>([])
  const [temas, setTemas] = useState<SubMenuItem[]>([])
  
  // Nota: Si ya no usas 'categoriaId' para filtrar temas dinámicamente porque
  // las categorías ahora son hardcoded, quizás debas revisar cómo cargas los temas.
  // Por ahora lo mantengo funcional según tu lógica anterior.
  const [categoriaId, setCategoriaId] = useState<number | ''>('') 

  // --- FETCH DATA (Mantenido igual) ---
  const fetchCategorias = async () => {
    try {
      const res = await fetch('/api/categorias')
      if (res.ok) {
        const data = await res.json()
        setCategorias(data)
      } else {
        toast.error('Error cargando categorías')
      }
    } catch {
      toast.error('Error red al cargar categorías')
    }
  }

  const fetchTemas = async () => {
    try {
      let url = '/api/temas-categorias'
      if (categoriaId) url += `?categoriaId=${categoriaId}`
      const res = await fetch(url)
      if (res.ok) {
        const data = await res.json()
        setTemas(data)
      } else {
        toast.error('Error cargando temas')
      }
    } catch {
      toast.error('Error red al cargar temas')
    }
  }

  useEffect(() => {
    fetchCategorias()
  }, [])

  useEffect(() => {
    fetchTemas()
  }, [categoriaId])

  // ----------------------------------------------------------------
  // --- FUNCIONES DE UTILIDAD (PDF) ---
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

  // --- MANEJADORES ---
  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
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
        toast.error("No se pudo extraer la portada del PDF.");
        setFormData((prev) => ({ ...prev, selectedFile: file, portada: null }));
      } finally {
        setIsLoading(false);
      }
    }
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    // VALIDACIONES
    if (!formData.titulo.trim()) {
      toast.error('El título es obligatorio')
      return
    }
    if (!formData.selectedFile) {
      toast.error('Debe seleccionar un archivo de plantilla')
      return
    }
    if (!formData.categoria) {
       toast.error('Debe seleccionar una categoría')
       return
    }
    // IMPORTANTE: Tu schema pide temaId, así que debemos validar el tema
    if (!formData.temaId) {
      toast.error('El campo tema es obligatorio')
      return
    }

    setIsLoading(true)

    try {
      const formDataToSend = new FormData()

      // Agrega los datos al FormData
      Object.keys(formData).forEach(key => {
        const value = formData[key as keyof typeof formData];
        // Excluimos nulls y el archivo raw original si no es necesario duplicarlo
        if (value !== null && value !== undefined && key !== 'selectedFile' && key !== 'portada') {
            formDataToSend.append(key, value.toString());
        }
      });

      // Aseguramos de enviar los archivos binarios correctamente
      if (formData.selectedFile) formDataToSend.append('plantilla', formData.selectedFile);
      if (formData.portada) formDataToSend.append('portada', formData.portada);

      // NOTA: Verifica que tu backend espere 'plantilla' como nombre del archivo PDF

      const response = await fetch('/api/documents', {
        method: 'POST',
        body: formDataToSend
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Error en la respuesta del servidor')
      }

      toast.success('Plantilla subida correctamente')
      resetForm()
      alternarActualizarPlantillas()
    } catch (error) {
      console.error('Error al subir plantilla:', error)
      toast.error(error instanceof Error ? error.message : 'Error al agregar plantilla')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className='flex flex-wrap bg-gray-100 space-y-6 rounded-lg justify-between px-10 items-center'>
      
      {/* --- INSTRUCCIONES --- */}
      <div className='Intrucciones__agregar p-6 rounded-lg flex grow flex-col w-2/4 justify-center items-center space-y-4'>
        {/* ... (Tu contenido de instrucciones se mantiene igual) ... */}
        <p className='text-lg font-semibold text-gray-800 mb-4'>
          Instrucciones para subir documentos
        </p>
        <ol className='space-y-4 text-gray-700'>
            {/* Resumido para el ejemplo, mantén tu texto original aquí */}
            <li>1. Seleccione archivo PDF (Máx 5MB).</li>
            <li>2. Clasifique correctamente (Categoría y Tema).</li>
            <li>3. Añada palabras clave para facilitar la búsqueda.</li>
        </ol>
      </div>

      {/* --- FORMULARIO --- */}
      <div className='Formulario__agregar rounded-lg justify-center items-center flex flex-col space-y-4 w-full md:w-5/12'>
        <h1 className='text-2xl font-bold mb-4 text-center'>
          Agregar Nueva Plantilla
        </h1>
        <form onSubmit={handleSubmit} className='space-y-4 flex flex-col w-full'>
          
          {/* TÍTULO */}
          <input
            type='text'
            placeholder='Título'
            value={formData.titulo}
            onChange={e => setFormData({ ...formData, titulo: e.target.value })}
            className='w-full p-2 border rounded'
            required
          />

          {/* 2. AJUSTE DE CATEGORÍA: Dropdown estricto */}
          <select 
            value={formData.categoria} 
            onChange={(e) => setFormData({ ...formData, categoria: e.target.value })} 
            className="w-full p-2 border rounded"
            required
          >
            <option value="" disabled>Seleccione Categoría del Documento</option>
            <option value="legal_administrativo">Legales y Administrativos</option>
            <option value="registros_clinicos">Registros Clínicos</option>
            <option value="escalas_valoracion">Escalas de Valoración y Scores</option>
            <option value="control_dispositivos">Seguimiento de Dispositivos / Invasivos</option>
            <option value="listas_chequeo">Listas de Chequeo (Checklists)</option>
            <option value="educacion_padres">Educación a Padres y Familia</option>
          </select>

          {/* SELECCIÓN DE TEMA (Requerido por tu Schema) */}
          {/* He descomentado esto porque tu DB pide 'temaId'. Sin esto, el formulario fallará al enviar. */}
          <select
            value={formData.temaId ?? ''}
            onChange={e => {
              const selectedTema = temas.find(t => t.id === Number(e.target.value))
              setFormData({
                ...formData,
                temaId: e.target.value ? Number(e.target.value) : null,
                tema: selectedTema ? selectedTema.subCategoria : ''
              })
            }}
            className='w-full p-2 border rounded'
            required
          >
            <option value=''>Seleccione un tema</option>
            {temas.map(subCate => (
              <option key={subCate.id} value={subCate.id}>
                {subCate.nombre} ({subCate.subCategoria})
              </option>
            ))}
          </select>

          {/* ARCHIVO PDF */}
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
              <div className='flex justify-center mt-2'>
                 <img
                    src={URL.createObjectURL(formData.portada)}
                    alt="Portada generada"
                    className="rounded shadow w-32 h-auto border"
                />
              </div>
            )}
          </div>

          {/* DESCRIPCIÓN */}
          <textarea
            placeholder='Descripción'
            value={formData.descripcion}
            onChange={e => setFormData({ ...formData, descripcion: e.target.value })}
            className='w-full p-2 border rounded'
          />

          {/* 3. AJUSTE DE PALABRAS CLAVE: Nuevo Input vinculado a 'palabrasClave' */}
          <div className="w-full">
            <input
                type='text'
                placeholder='Palabras clave (Ej: picc, ingreso, consentimiento)'
                value={formData.palabrasClave} // AQUI: Usamos la nueva variable
                onChange={e => setFormData({ ...formData, palabrasClave: e.target.value })}
                className='w-full p-2 border rounded'
            />
            <p className="text-xs text-gray-500 mt-1 pl-1">Separa las palabras con comas.</p>
          </div>

          {/* BOTÓN SUBMIT */}
          <button
            type='submit'
            disabled={isLoading || !formData.selectedFile}
            className={`w-full py-2 px-4 rounded transition-colors ${
              isLoading || !formData.selectedFile
                ? 'bg-gray-300 cursor-not-allowed'
                : 'bg-blue-500 text-white hover:bg-blue-600'
            }`}
          >
            {isLoading ? 'Subiendo...' : 'Agregar plantilla'}
          </button>
        </form>
      </div>

      {/* INDICADOR DE CARGA */}
      {isLoading && (
        <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50'>
          <div className='bg-white p-6 rounded-lg shadow-xl'>
            <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4'></div>
            <p className='text-center'>Procesando documento...</p>
          </div>
        </div>
      )}
    </div>
  )
}