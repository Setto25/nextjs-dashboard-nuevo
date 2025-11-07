'use client' // Indica que este archivo se ejecuta en el cliente (Next.js con React Server Components).

import { useState, ChangeEvent, useRef, useEffect } from 'react'
import { toast } from 'react-toastify' // Biblioteca para mostrar mensajes de notificación.
import Image from 'next/image' // Componente de Next.js para manejar imágenes optimizadas.
import { useRouter } from 'next/navigation'
import '@/app/ui/global/containers.css'
import '@/app/ui/global/texts.css'
import { useUploadStore } from '@/app/store/store'

///////////////////////////////// FUNCIONES PARA SUBIR OS VIDEOS A LOS SERVIDORES EXTERNOS /////////////////////////////////
// Función auxiliar para extraer ID de YouTube
function getYouTubeId(url: string | null | undefined): string | null {
  if (!url) return null
  const regExp =
    /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/
  const match = url.match(regExp)
  return match && match[2].length === 11 ? match[2] : null
}

// Función auxiliar para extraer ID de Dailymotion
// Los formatos de Dailymotion son complejos, este cubre la mayoría:
// Ej: https://www.dailymotion.com/video/x8w4z6g
// Ej: https://dai.ly/x8w4z6g
function getDailymotionId(url: string | null | undefined): string | null {
  if (!url) return null
  const regExp =
    /^.+dailymotion.com\/(video|hub)\/([^_]+)[^#]*(#video=([^_&]+))?/
  const match = url.match(regExp)
  if (match && match[2]) {
    return match[2]
  }
  const shortUrlRegExp = /dai.ly\/([a-z0-9]+)/i
  const shortMatch = url.match(shortUrlRegExp)
  return shortMatch ? shortMatch[1] : null
}

// Función para obtener la URL de la miniatura
function getThumbnailUrl(platform: string, videoId: string | null): string | null {
  if (!videoId) return null

  switch (platform) {
    case 'YOUTUBE':
      // Miniatura de alta calidad (hqdefault)
      return `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`
    case 'DAILYMOTION':
      // Miniatura de alta calidad (Ej: 640x360)
      return `https://www.dailymotion.com/thumbnail/video/${videoId}`
    default:
      return null
  }
}

////////////////////////////////////FUNCION PRINCIPAL DEL COMPONENTE////////////////////////////////////

export default function AgregarVideoPage() {
  const alternarActualizarVideos = useUploadStore((state) => state.alternarActualizar)

  // Estados para manejar la carga del formulario, la vista previa del video y los datos del formulario.
  const [isLoading, setIsLoading] = useState(false) // Indica si se está cargando un video.

  const fileInputRef = useRef<HTMLInputElement>(null) // Referencia al input de archivo para poder manipularlo.

  // Estado que guarda los datos del formulario.
  const [formData, setFormData] = useState({
    tema: '',
    temaId: null as number | any,
    titulo: '',
    tipo: 'URL', // El tipo general de subida (local ya no se usa)
    plataforma: 'YOUTUBE', // Nuevo campo: plataforma principal
    url: '', // URL completa que ingresa el usuario
    descripcion: '',
    duracion: '', // La duración ya no se obtiene automáticamente, se llenará manualmente
    categorias: '',
    miniatura: '', // La URL de la miniatura generada
    idYoutube: '', // ID de YouTube
    idDailymotion: '', // ID de Dailymotion
  })

  // Función para reiniciar el formulario y limpiar los datos.
  const resetForm = () => {
    setFormData({
      tema: '..',
      temaId: null,
      titulo: '',
      tipo: 'URL',
      plataforma: 'YOUTUBE',
      url: '',
      descripcion: '',
      duracion: '', // Dejar vacío para rellenar
      categorias: '',
      miniatura: '',
      idYoutube: '',
      idDailymotion: '',
    })
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
  const handleUrlChange = (e: ChangeEvent<HTMLInputElement>) => {
    const newUrl = e.target.value
    const currentPlatform = formData.plataforma

    // Reiniciar IDs y miniatura por si la URL es inválida
    let youtubeId = ''
    let dailymotionId = ''
    let thumbnailUrl = ''
    let duracion = formData.duracion // Mantener duración o reiniciarla

    if (currentPlatform === 'YOUTUBE') {
      youtubeId = getYouTubeId(newUrl) || ''
      thumbnailUrl = getThumbnailUrl('YOUTUBE', youtubeId) || ''
    } else if (currentPlatform === 'DAILYMOTION') {
      dailymotionId = getDailymotionId(newUrl) || ''
      thumbnailUrl = getThumbnailUrl('DAILYMOTION', dailymotionId) || ''
    }

    setFormData((prev) => ({
      ...prev,
      url: newUrl,
      idYoutube: youtubeId,
      idDailymotion: dailymotionId,
      miniatura: thumbnailUrl,
      // Opcional: Si no se pudo obtener el ID, borramos la duración si era automática
      // if (!youtubeId && !dailymotionId) { duracion: '' }
    }))
  }

  // Función para manejar el envío del formulario.
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    // VALIDACIONES DE FORMULARIO//////////////.
    if (!formData.titulo.trim()) {
      toast.error('El título es obligatorio')
      return
    }

    // Validación de ID de video (siempre debe tener un ID)
    const hasVideoId = formData.idYoutube || formData.idDailymotion
    if (!hasVideoId) {
      toast.error(
        `La URL de ${formData.plataforma} es inválida o no se pudo extraer el ID.`
      )
      return
    }

    if (!formData.descripcion.trim()) {
      toast.error('El campo descripción es obligatorio')
      return
    }

    if (!formData.categorias.trim()) {
      toast.error('El campo categorías es obligatorio')
      return
    }
    if (!formData.temaId || formData.temaId === null) {
      toast.error('El campo tema es obligatorio')
      return
    }
    if (!formData.duracion.trim()) {
      toast.error('La duración es obligatoria (formato MM:SS)')
      return
    }

    setIsLoading(true)

    try {
      const formDataToSend = new FormData()

      // Agrega todos los campos relevantes. Ya no enviamos 'videoArchivo'
      Object.keys(formData).forEach((key) => {
        // Excluimos la URL completa, solo enviamos los IDs y miniatura
        if (key !== 'url' && formData[key as keyof typeof formData]) {
          formDataToSend.append(
            key,
            formData[key as keyof typeof formData] as string
          )
        }
      })

      // Asegurar que el ID y la miniatura estén presentes en el FormData
      if (formData.idYoutube) formDataToSend.append('idYoutube', formData.idYoutube)
      if (formData.idDailymotion) formDataToSend.append('idDailymotion', formData.idDailymotion)
      if (formData.miniatura) formDataToSend.append('miniatura', formData.miniatura)


      const response = await fetch('/api/videos', {
        method: 'POST',
        body: formDataToSend,
        credentials: 'include',
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(
          errorData.message || 'Error en la respuesta del servidor'
        )
      }

      toast.success('Video subido correctamente')
      resetForm()
      alternarActualizarVideos()
    } catch (error) {
      console.error('Error al subir video:', error)
      toast.error(
        error instanceof Error ? error.message : 'Error al agregar video'
      )
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex-container container-formulario-global bg-gray-100 ">
      {/* ... Sección de Instrucciones (Actualizar el texto) ... */}
      <div className="Intrucciones__registro conatiner-formulario-parte1 ">
        <p className="subtitle-responsive font-semibold text-gray-800 mb-4">
          En esta sección podrá registrar enlaces de videos externos...
        </p>
        <ol className="container-listado">
          <li className="bg-white p-4 rounded-md shadow-sm">
            <h3 className="font-bold text-blue-600 mb-2">
              1. Seleccione la Plataforma y Pegue la URL.
            </h3>
            <ul className="list-disc list-inside pl-4 space-y-1">
              <li>Seleccione la plataforma (YouTube o Dailymotion).</li>
              <li>Pegue la URL completa del video.</li>
              <li>
                La miniatura se generará automáticamente a partir del enlace.
              </li>
            </ul>
          </li>
          {/* ... Resto de los pasos ... */}
          <li className="bg-white p-4 rounded-md shadow-sm">
            <h3 className="font-bold text-blue-600 mb-2">
              2. Complete los detalles
            </h3>
            <ul className="list-disc list-inside pl-4 space-y-1">
              <li>Ingrese un título descriptivo</li>
              <li>Seleccione el tema al que corresponda el video</li>
              <li>Agregue una descripción</li>
              <li>Ingrese la duración manualmente (Ej: 05:30)</li>
              <li>
                Agregue las categorías.
              </li>
            </ul>
          </li>
        </ol>
      </div>

      {/* Formulario para subir el video */}
      <div className="Formulario__agregar conatiner-formulario-parte2">
        <form onSubmit={handleSubmit} className="container-fomr">
          {/* Título */}
          <input
            type="text"
            placeholder="Título"
            value={formData.titulo}
            onChange={(e) =>
              setFormData({
                ...formData,
                titulo: e.target.value,
              })
            }
            className="w-full p-2 border rounded"
            required
          />

          {/* Selección de Categoría y Tema (Mantener el código) */}
          {/* ... Tu código de select Categoría ... */}
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
          {/* ... Tu código de select Tema ... */}
          <select
            value={formData.temaId ?? ''}
            onChange={e => {
              const selectedTema = temas.find(
                subCate => subCate.id === Number(e.target.value)
              )
              setFormData({
                ...formData,
                temaId: e.target.value ? Number(e.target.value) : null,
                tema: selectedTema ? selectedTema.subCategoria : '',
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


          {/* Selección de Plataforma */}
          <select
            value={formData.plataforma}
            onChange={(e) =>
              setFormData({
                ...formData,
                plataforma: e.target.value,
                url: '', // Reiniciar URL al cambiar de plataforma
                idYoutube: '',
                idDailymotion: '',
                miniatura: '',
              })
            }
            className="w-full p-2 border rounded"
            required
          >
            <option value="YOUTUBE">YouTube</option>
            <option value="DAILYMOTION">Dailymotion</option>
          </select>

          {/* Input de URL del Video */}
          <input
            type="url"
            placeholder={`URL de ${formData.plataforma} (Ej: https://...watch?v=...)`}
            value={formData.url}
            onChange={handleUrlChange}
            className="w-full p-2 border rounded"
            required
          />

          {/* Miniatura generada (Vista Previa) */}
          {formData.miniatura && (
            <div className="mt-4 p-2 border rounded bg-white">
              <p className="text-sm font-semibold mb-2">Vista Previa Miniatura:</p>
              <Image
                src={formData.miniatura}
                alt="Miniatura del video"
                width={320}
                height={180}
                className="w-full h-auto object-cover rounded"
                unoptimized // Opcional: para enlaces externos directos
              />
            </div>
          )}

          {/* Duración y Formato (Mantener el código - Formato se puede dejar por defecto) */}
          <textarea
            placeholder="Descripción"
            value={formData.descripcion}
            onChange={(e) =>
              setFormData({ ...formData, descripcion: e.target.value })
            }
            className="w-full p-2 border rounded"
            required
          />

          <div className="grid grid-cols-2 gap-4">
            <input
              type="text"
              placeholder="Duración (Ej: 05:30)"
              value={formData.duracion}
              onChange={(e) => setFormData({ ...formData, duracion: e.target.value })}
              className="w-full p-2 border rounded"
              required
            />
            <select
              value={formData.tipo}
              onChange={(e) =>
                setFormData({ ...formData, tipo: e.target.value })
              }
              className="w-full p-2 border rounded bg-gray-100"
              disabled
            >
              <option value="URL">URL Externa</option>
            </select>
          </div>

          {/* Categorías (Mantener el código) */}
          <input
            type="text"
            placeholder='Categorías (separadas por coma)'
            value={formData.categorias}
            onChange={e =>
              setFormData({ ...formData, categorias: e.target.value })
            }
            className='w-full p-2 border rounded'
            required
          />


          {/* Botón para enviar el formulario */}
          <button
            type="submit"
            disabled={isLoading || (!formData.idYoutube && !formData.idDailymotion)}
            className={`w-full py-2 px-4 rounded transition-colors ${
              isLoading || (!formData.idYoutube && !formData.idDailymotion)
                ? 'bg-gray-300 cursor-not-allowed'
                : 'bg-blue-500 text-white hover:bg-blue-600'
            }`}
          >
            {isLoading ? 'Agregando...' : 'Agregar Video'}
          </button>
        </form>
      </div>

      {/* Indicador de carga */}
      {isLoading && (
        <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50'>
          <div className='bg-white p-6 rounded-lg shadow-xl'>
            <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4'></div>
            <p className='text-center'>Agregando video...</p>
          </div>
        </div>
      )}

    </div>
  )
}