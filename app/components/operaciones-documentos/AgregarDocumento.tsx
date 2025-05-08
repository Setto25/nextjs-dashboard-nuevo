'use client'

import { useState, ChangeEvent, useRef, useEffect } from 'react'
import { toast } from 'react-toastify'
import Image from 'next/image'

export default function AgregarDocumento () {
  // Estados para manejar la carga del formulario, la vista previa del documento y los datos del formulario.
  const [isLoading, setIsLoading] = useState(false)

  const fileInputRef = useRef<HTMLInputElement>(null) // Referencia al input de archivo para poder manipularlo.

  // Estado que guarda los datos del formulario.
  const [formData, setFormData] = useState({
    tema: '',
    temaId: null as number | any, // ID del tema seleccionado.
    titulo: '', //
    documentoArchivo: null as File | null,
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
      documentoArchivo: null,
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

  // Función para manejar el cambio en el input de archivo.
  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] // Obtiene el archivo seleccionado.
    if (file) {
      // Validaciones del archivo.
      if (
        ![
          'application/pdf',
          'application/msword',
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          'text/plain',
          'application/vnd.ms-powerpoint',
          'application/vnd.openxmlformats-officedocument.presentationml.presentation'
        ].includes(file.type)
      ) {
        // Verifica que sea un archivo de documento con los tipos de MIME.
        toast.error('El archivo debe ser un documento') // Muestra un error si no es documento.
        return
      }

      setFormData(prev => ({
        //Este fragmento de código se utiliza para actualizar el estado del formulario con la información del archivo subido.
        ...prev,
        documentoArchivo: file,
        formato: file.type.split('/')[1] // Obtiene el formato del archivo (ejemplo: PDF).
      }))
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

    if (!formData.documentoArchivo) {
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

      if (formData.documentoArchivo) {
        // Si hay un archivo de documento, lo agrega al FormData.
        formDataToSend.append('documento', formData.documentoArchivo)
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
          En esta sección podrás subir tus documentos de manera sencilla...
        </p>
        {/* Lista de pasos */}
        <ol className='space-y-4 text-gray-700'>
          {/* Paso 1: Seleccionar documento */}
          <li className='bg-white p-4 rounded-md shadow-sm'>
            <h3 className='font-bold text-blue-600 mb-2'>
              1. Selecciona tu documento.
            </h3>
            <ul className='list-disc list-inside pl-4 space-y-1'>
              <li>Selecciona la fuente entre online o Local</li>
              <li>
                Si es online, selecciona laopcion correspondiente y pega el
                enlace.
              </li>

              <li>
                Si es un documento local selecciona la opción correspondiente y
                sube el archivo:
              </li>

              <ul className='list-circlelist-inside pl-4 space-y-1'>
                <li>
                  - Asegúrate de que sea de uno de los formatos permitidos (pdf
                  o docx), de tener otro formato, podría converitrlo, de
                  preferencia a pdf antes de intentar subirlo.
                </li>
                <li>- El tamaño máximo es de 400 MB</li>
              </ul>
            </ul>
          </li>
          {/* Paso 2: Completar detalles */}
          <li className='bg-white p-4 rounded-md shadow-sm'>
            <h3 className='font-bold text-blue-600 mb-2'>
              2. Completa los detalles
            </h3>
            <ul className='list-disc list-inside pl-4 space-y-1'>
              <li>Ingresa un título descriptivo</li>
              <li>Selecciona el tema al que corresponda el documento</li>
              <li>Agrega una descripción</li>
              <li>
                Agrega las categorías. Estas permitiran al buscador encontrar el
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
              <li>Usa un nombre de archivo simple y claro</li>
              <li>Verifica la calidad del documento</li>
              <li>Comprueba que cumple con los requisitos técnicos</li>
            </ul>
          </li>
        </ol>
        <p className='mt-6 text-green-700 font-medium'>
          ¡Listo! Haz clic en "Subir documento" para compartir tu contenido.
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
                tema: selectedTema ? selectedTema.nombre : '' // Asigna el nombre del tema seleccionado
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

          <div>
            <input
              type='file'
              ref={fileInputRef}
              accept='documento/*'
              onChange={handleFileChange}
              className='w-full p-2 border rounded'
            />
            {formData.documentoArchivo && (
              <p className='mt-2 text-sm'>
                Archivo seleccionado: {formData.documentoArchivo.name}
              </p>
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
            placeholder='Categorías (separadas por coma)'
            value={formData.categorias}
            onChange={e =>
              setFormData({ ...formData, categorias: e.target.value })
            }
            className='w-full p-2 border rounded'
          />

          {/* Botón para enviar el formulario */}
          <button
            type='submit'
            disabled={isLoading || !formData.documentoArchivo}
            className={`w-full py-2 px-4 rounded transition-colors ${
              isLoading || !formData.documentoArchivo
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
