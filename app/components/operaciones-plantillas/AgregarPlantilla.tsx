'use client'

import { useState, ChangeEvent, useRef } from 'react'
import { toast } from 'react-toastify'
import { useUploadStore } from '@/app/store/store'

export default function AgregarPlantilla () {
  const alternarActualizarPlantillas = useUploadStore(
    state => state.alternarActualizar
  )
  const [isLoading, setIsLoading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  //IMPORTANTE: El formulario se encarga de manejar toda la logica de subida, desde la seleccion del archivo, extraccion de portada, firma con S3 y guardado en BD. Es el unico que interactua con las APIs de plantillas/firmar y plantillas/guardar. No hay pasos intermedios visibles para el usuario, todo es un proceso continuo. NO SE USA FORMDATA, se envia JSON con los metadatos y luego se sube el archivo directamente a la URL firmada. Esto es mas eficiente y moderno. la const de ee nombtre es formData pero en realidad es un objeto con toda la info, no un FormData tradicional.

  const [formData, setFormData] = useState({
    tema: '', // Palabras clave
    titulo: '',
    portada: null as File | null,
    selectedFile: null as File | null,
    descripcion: '',
    palabrasClave: '',
    categoria: '', // Tipo de Documento
    formato: ''
  })

  const resetForm = () => {
    setFormData({
      tema: '',
      titulo: '',
      portada: null,
      selectedFile: null,
      descripcion: '',
      palabrasClave: '',
      categoria: '',
      formato: ''
    })
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  // --- PDF HELPERS ---
  async function getPdfjsLib () {
    // @ts-ignore
    if (window.pdfjsLib) return window.pdfjsLib
    return new Promise((resolve, reject) => {
      const script = document.createElement('script')
      script.src = '//cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js'
      script.onload = () => {
        // @ts-ignore
        const pdfjsLib = window.pdfjsLib
        pdfjsLib.GlobalWorkerOptions.workerSrc =
          '//cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js'
        resolve(pdfjsLib)
      }
      script.onerror = () => reject(new Error('Error cargando PDF.js'))
      document.body.appendChild(script)
    })
  }

  async function obtenerPortadaPDF (file: File): Promise<string> {
    // @ts-ignore
    const pdfjsLib = await getPdfjsLib()
    const arrayBuffer = await file.arrayBuffer()
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise
    const page = await pdf.getPage(1)
    const viewport = page.getViewport({ scale: 1.0 })
    const canvas = document.createElement('canvas')
    canvas.width = viewport.width
    canvas.height = viewport.height
    const context = canvas.getContext('2d')
    await page.render({ canvasContext: context!, viewport }).promise
    return canvas.toDataURL('image/webp', 0.7)
  }

  function base64ToBlob (base64: string) {
    const arr = base64.split(',')
    const mime = arr[0].match(/:(.*?);/)![1]
    const bstr = atob(arr[1])
    let n = bstr.length
    const u8arr = new Uint8Array(n)
    while (n--) u8arr[n] = bstr.charCodeAt(n)
    return new Blob([u8arr], { type: mime })
  }

  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.type !== 'application/pdf') {
        toast.error('El archivo debe ser un PDF.')
        if (fileInputRef.current) fileInputRef.current.value = ''
        setFormData(prev => ({ ...prev, selectedFile: null, portada: null }))
        return
      }
      setIsLoading(true)
      try {
        const portadaBase64 = await obtenerPortadaPDF(file)
        const portadaBlob = base64ToBlob(portadaBase64)
        const portadaFile = new File([portadaBlob], 'portada.webp', {
          type: 'image/webp'
        })
        setFormData(prev => ({
          ...prev,
          selectedFile: file,
          portada: portadaFile
        }))
      } catch (err) {
        toast.warning('No se pudo extraer portada.')
        setFormData(prev => ({ ...prev, selectedFile: file, portada: null }))
      } finally {
        setIsLoading(false)
      }
    }
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (
      !formData.titulo.trim() ||
      !formData.selectedFile ||
      !formData.categoria.trim()
    ) {
      toast.error('Título, Archivo y Tipo son obligatorios')
      return
    }
    setIsLoading(true)
    try {
      const firmaRes = await fetch('/api/plantillas/firmar', {
        method: 'POST',
        body: JSON.stringify({
          nombrePlantilla: formData.selectedFile.name,
          tipoPlantilla: formData.selectedFile.type,
          nombrePortada: formData.portada?.name,
          tipoPortada: formData.portada?.type
        })
      })
      if (!firmaRes.ok) throw new Error('Error firmando')
      const {
        urlSubidaPlantilla,
        urlSubidaPortada,
        urlPublicaPlantilla,
        urlPublicaPortada
      } = await firmaRes.json()

      await fetch(urlSubidaPlantilla, {
        method: 'PUT',
        body: formData.selectedFile,
        headers: { 'Content-Type': formData.selectedFile.type }
      })
      if (formData.portada && urlSubidaPortada)
        await fetch(urlSubidaPortada, {
          method: 'PUT',
          body: formData.portada,
          headers: { 'Content-Type': formData.portada.type }
        })

      const guardarRes = await fetch('/api/plantillas/guardar', {
        method: 'POST',
        body: JSON.stringify({
          titulo: formData.titulo,
          tema: formData.tema,
          categoria: formData.categoria,
          descripcion: formData.descripcion,
          palabrasClave: formData.palabrasClave,
          urlFinalPlantilla: urlPublicaPlantilla,
          urlFinalPortada: urlPublicaPortada
        })
      })
      if (!guardarRes.ok) throw new Error('Error guardando')
      toast.success('Plantilla subida correctamente')
      resetForm()
      alternarActualizarPlantillas()
    } catch (error) {
      toast.error('Error al agregar plantilla')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className='flex flex-wrap bg-gray-100 space-y-6 rounded-lg justify-between px-10 items-center'>
      {/* --- INSTRUCCIONES ADECUADAS (Plantillas) --- */}
      <div className='Intrucciones__agregar p-6 rounded-lg flex grow flex-col w-2/4 justify-center items-center space-y-4'>
        <p className='text-lg font-semibold text-gray-800 mb-4'>
          Sube una nueva plantilla o formato.
        </p>
        <ol className='space-y-4 text-gray-700'>
          <li className='bg-white p-4 rounded-md shadow-sm'>
            <h3 className='font-bold text-blue-600 mb-2'>
              1. Selecciona la Plantilla (PDF)
            </h3>
            <p>
              El formato debe ser <strong>.PDF</strong>. Se generará una vista
              previa automática.
            </p>
          </li>
          <li className='bg-white p-4 rounded-md shadow-sm'>
            <h3 className='font-bold text-blue-600 mb-2'>2. Clasificación</h3>
            <p>
              Elige el <strong>Tipo de Documento</strong> (Legal, Clínico, etc.)
              y agrega <strong>palabras clave</strong>.
            </p>
          </li>
          <li className='bg-white p-4 rounded-md shadow-sm'>
            <h3 className='font-bold text-blue-600 mb-2'>3. Sube a la Nube</h3>
            <p>El archivo estará disponible para descarga inmediata.</p>
          </li>
        </ol>
      </div>

      <div className='Formulario__agregar rounded-lg justify-center items-center flex flex-col space-y-4 w-1/3 min-w-[300px]'>
        <h1 className='text-2xl font-bold mb-4 text-center'>
          Agregar Plantilla
        </h1>
        <form
          onSubmit={handleSubmit}
          className='space-y-4 flex flex-col w-full'
        >
          <input
            type='text'
            placeholder='Título'
            value={formData.titulo}
            onChange={e => setFormData({ ...formData, titulo: e.target.value })}
            className='w-full p-2 border rounded'
            required
          />

          <select
            value={formData.categoria}
            onChange={e =>
              setFormData({ ...formData, categoria: e.target.value })
            }
            className='w-full p-2 border rounded'
            required
          >
            <option value='' disabled>
              Seleccione Tipo de Documento
            </option>
            <option value='legal_administrativo'>
              Legales y Administrativos
            </option>
            <option value='registros_clinicos'>Registros Clínicos</option>
            <option value='escalas_valoracion'>Escalas de Valoración</option>
            <option value='control_dispositivos'>
              Seguimiento de Dispositivos
            </option>
            <option value='listas_chequeo'>Listas de Chequeo</option>
            <option value='educacion_padres'>Educación a Padres</option>
          </select>

          <div>
            <label className='block mb-2 text-sm font-medium'>
              Archivo PDF
            </label>
            <input
              type='file'
              ref={fileInputRef}
              accept='.pdf'
              onChange={handleFileChange}
              className='w-full p-2 border rounded bg-white'
              required
            />
            {formData.portada && (
              <img
                src={URL.createObjectURL(formData.portada)}
                alt='Portada'
                className='mt-2 rounded shadow w-24 h-auto border'
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
            value={formData.palabrasClave}
            onChange={e => setFormData({ ...formData, palabrasClave: e.target.value })}
            className='w-full p-2 border rounded'
          />

          <button
            type='submit'
            disabled={isLoading || !formData.selectedFile}
            className='w-full py-2 px-4 rounded bg-blue-500 text-white hover:bg-blue-600 disabled:bg-gray-400'
          >
            {isLoading ? 'Subiendo...' : 'Agregar plantilla'}
          </button>
        </form>
      </div>
      {isLoading && (
        <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50'>
          <div className='bg-white p-6 rounded-lg shadow-xl'>
            <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4'></div>
            <p>Subiendo...</p>
          </div>
        </div>
      )}
    </div>
  )
}
