'use client'

import { useState, ChangeEvent, useRef, useEffect } from 'react'
import { toast } from 'react-toastify'
import Image from 'next/image'
import { useUploadStore } from '@/app/store/store';

export default function AgregarDocumento () {
   const alternarActualizarDocumentos = useUploadStore((state) => state.alternarActualizar);
  // Estados para manejar la carga del formulario, la vista previa del documento y los datos del formulario.
  const [isLoading, setIsLoading] = useState(false)

  const fileInputRef = useRef<HTMLInputElement>(null) // Referencia al input de archivo para poder manipularlo.

  // Estado que guarda los datos del formulario.
  const [formData, setFormData] = useState({
    tema: '',
    temaId: null as number | any, // ID del tema seleccionado.
    titulo: '', //
    portada: null as File | null, // Archivo de portada generado a partir del PDF.
    selectedFile: null as File | null, // Archivo PDF seleccionado por el usuario.
    descripcion: '',
    categorias: '',
    formato: ''
  })

  // Función para reiniciar el formulario y limpiar los datos.
  const resetForm = () => {
    setFormData({
      temaId: null ,
      tema: '..',
      titulo: '',
      portada: null,
      selectedFile: null,
      descripcion: '',
      categorias: '',
      formato: ''
    })
    if (fileInputRef.current) {
      fileInputRef.current.value = '' // Limpia el input de archivo.
    }
  }

  //-------------------------------------------------------------------------
  interface SubMenuItem {
    id: number
    nombre: string
    subCategoria: string // nombre subcategoria para mostrar
  }

  interface Categoria {
    id: number
    nombre: string
    categoria: string
    menuCategorias: SubMenuItem[]
  }

  //-------------------------------------------------------------------------
  const [categorias, setCategorias] = useState<Categoria[]>([])
  const [temas, setTemas] = useState<SubMenuItem[]>([])
  const [categoriaId, setCategoriaId] = useState<number | ''>('')
  const [temaNombre, setTemaNombre] = useState<string | ''>('')

  console.log('categorias ID', categoriaId)

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

  // Cargar temas filtrados por categoría seleccionada
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
    const viewport = page.getViewport({ scale: 1.0 });

    const canvas = document.createElement("canvas");
    canvas.width = viewport.width;
    canvas.height = viewport.height;
    const context = canvas.getContext("2d");

    await page.render({ canvasContext: context!, viewport }).promise;
    return canvas.toDataURL("image/webp", 0.7);
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


  //MANEJADORES DE EVENTOS///////////////////////

  // Función para manejar el cambio en el input de archivo.
  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] // Obtiene el archivo seleccionado.
    if (file) {
      // Validaciones del archivo.
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
        const portadaFile = new File([portadaBlob], "portada.webp", {
          type: "image/webp",
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
  }



  
  // Función para manejar el envío del formulario.
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault() // Evita el comportamiento por defecto del formulario.

    // VALIDACIONES DE FORMULARIO//////////////.
    if (!formData.titulo.trim()) {
      // Verifica que el título no esté vacío.
      toast.error('El título es obligatorio')
      return
    }

    if (!formData.selectedFile) {
      toast.error('Debe seleccionar un archivo de documento')
      return
    }

    if (!formData.descripcion.trim()) {
      // Verifica que la descripcion esté vacío.
      toast.error('El campo descripción es obligatorio')
      return
    }

    if (!formData.categorias.trim()) {
      // Verifica que categorias esté vacío.
      toast.error('El campo categorias es obligatorio')
      return
    }
    if (!formData.tema.trim()) {
      // Verifica que la descripcion esté vacío.
      toast.error('El campo tema es obligatorio')
      return
    }
    // FIN DE VALIDACIONES DE FORMULARIO///////////.

    setIsLoading(true) // Activa el estado de carga.

    try {
      const formDataToSend = new FormData() // Crea un objeto FormData para enviar los datos.

      // Agrega los datos del formulario al FormData.
      Object.keys(formData).forEach(key => {
        if (
          key !== 'documentoArchivo' &&
          formData[key as keyof typeof formData]
        ) {
          formDataToSend.append(
            key,
            formData[key as keyof typeof formData] as string
          )
        }
      })

      if (formData.selectedFile) {
        // Si hay un archivo de documento, lo agrega al FormData.
        formDataToSend.append('documento', formData.selectedFile)
      }

      // Enviar los datos al backend.
      const response = await fetch('/api/documents', {
        method: 'POST',
        body: formDataToSend
      })

      if (!response.ok) {
        // Maneja errores en la respuesta del servidor.
        const errorData = await response.json()
        throw new Error(
          errorData.message || 'Error en la respuesta del servidor'
        )
      }

      toast.success('documento subido correctamente') // Muestra un mensaje de éxito.
      resetForm() // Reinicia el formulario.
      alternarActualizarDocumentos() // Alterna el estado de actualización para que los componentes que dependen de este estado se actualicen.  
    } catch (error) {
      console.error('Error al subir documento:', error)
      toast.error(
        error instanceof Error ? error.message : 'Error al agregar documento'
      ) // Muestra un mensaje de error.
    } finally {
      setIsLoading(false) // Desactiva el estado de carga.
    }
  }

  return (
    <div className='flex flex-wrap bg-gray-100 space-y-6 rounded-lg justify-between px-10 items-center'>
      {/* Instrucciones para agregar un documento */}
      <div className='Intrucciones__agregar p-6 rounded-lg flex grow flex-col w-2/4 justify-center items-center space-y-4'>
        <p className='text-lg font-semibold text-gray-800 mb-4'>
          En esta sección podrá subir sus documentos de manera sencilla...
        </p>
        {/* Lista de pasos */}
        <ol className='space-y-4 text-gray-700'>
          {/* Paso 1: Seleccionar documento */}
          <li className='bg-white p-4 rounded-md shadow-sm'>
            <h3 className='font-bold text-blue-600 mb-2'>
              1. Seleccione tu documento.
            </h3>
            <ul className='list-disc list-inside pl-4 space-y-1'>
              <li>Seleccione la fuente Local</li>

              <ul className='list-circlelist-inside pl-4 space-y-1'>
                <li>
                  - Asegúrese de que sea formato pdf, de tener otro formato, deberá converitrlo a pdf antes de intentar subirlo.
                </li>
                <li>- El tamaño máximo es de 5 MB</li>
              </ul>
            </ul>
          </li>
          {/* Paso 2: Completar detalles */}
          <li className='bg-white p-4 rounded-md shadow-sm'>
            <h3 className='font-bold text-blue-600 mb-2'>
              2. Complete los detalles
            </h3>
            <ul className='list-disc list-inside pl-4 space-y-1'>
              <li>Ingrese un título descriptivo</li>
              <li>Seleccione la categoría y el tema a la que corresponda el documento</li>
              <li>Agregue una descripción</li>
              <li>
                Agregue las palabras clave. Estas permitiran al buscador encontrar el
                documento
              </li>
            </ul>
          </li>
          {/* Paso 3: Consejos antes de subir */}
          <li className='bg-white p-4 rounded-md shadow-sm'>
            <h3 className='font-bold text-blue-600 mb-2'>
              3. Consejos antes de subir
            </h3>
            <ul className='list-disc list-inside pl-4 space-y-1'>
              <li>Use un nombre de archivo simple y claro</li>
              <li>Verifique la calidad del documento</li>
              <li>Compruebe que cumple con los requisitos técnicos</li>
            </ul>
          </li>
        </ol>
        <p className='mt-6 text-green-700 font-medium'>
          ¡Listo! Haga clic en "Subir documento" para compartir su contenido.
        </p>
      </div>

      {/* Formulario para subir el documento */}
      <div className='Formulario__agregar rounded-lg justify-center items-center flex flex-col space-y-4'>
        <h1 className='text-2xl font-bold mb-4 text-center'>
          Agregar Nuevo documento
        </h1>
        <form onSubmit={handleSubmit} className='space-y-4 flex flex-col'>
          {/* Inputs del formulario */}
          <input
            type='text'
            placeholder='Título'
            value={formData.titulo}
            onChange={e => setFormData({ ...formData, titulo: e.target.value })}
            className='w-full p-2 border rounded'
            required
          />

          {/* Selección de categoria */}
          <select
            value={categoriaId}
            onChange={e =>
              setCategoriaId(e.target.value ? Number(e.target.value) : '')
            }
            required
            className='p-2 border rounded'
          >
            <option value=''>Seleccione una categoría</option>
            {categorias.map(cat => (
              <option key={cat.id} value={cat.id}>
                {cat.nombre} ({cat.categoria})
              </option>
            ))}
          </select>

          {/* Selección de tema */}
          <select
            value={formData.temaId ?? ''}
            onChange={e => {
              const selectedTema = temas.find(
                subCate => subCate.id === Number(e.target.value)
              ) // Encuentra el tema seleccionado por su ID
              setFormData({
                ...formData,
                temaId: e.target.value ? Number(e.target.value) : null,
                tema: selectedTema ? selectedTema.subCategoria: '' // Asigna el nombre del tema seleccionado
              })
            }}
            className='w-full p-2 border rounded'
          >
            <option value=''>Seleccione un tema</option>
            {temas.map(subCate => (
              <option key={subCate.id} value={subCate.id}>
                {subCate.nombre} ({subCate.subCategoria})
              </option>
            ))}
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
            placeholder='Descripción'
            value={formData.descripcion}
            onChange={e =>
              setFormData({ ...formData, descripcion: e.target.value })
            }
            className='w-full p-2 border rounded'
          />

          <input
            type='text'
            placeholder='Palabras clave (separadas por coma)'
            value={formData.categorias}
            onChange={e =>
              setFormData({ ...formData, categorias: e.target.value })
            }
            className='w-full p-2 border rounded'
          />

          {/* Botón para enviar el formulario */}
          <button
            type='submit'
            disabled={isLoading || !formData.selectedFile}
            className={`w-full py-2 px-4 rounded transition-colors ${
              isLoading || !formData.selectedFile
                ? 'bg-gray-300 cursor-not-allowed'
                : 'bg-blue-500 text-white hover:bg-blue-600'
            }`}
          >
            {isLoading ? 'Subiendo...' : 'Agregar documento'}
          </button>
        </form>
      </div>

      {/* Indicador de carga */}
      {isLoading && (
        <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50'>
          <div className='bg-white p-6 rounded-lg shadow-xl'>
            <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4'></div>
            <p className='text-center'>Subiendo documento...</p>
          </div>
        </div>
      )}
    </div>
  )
}
