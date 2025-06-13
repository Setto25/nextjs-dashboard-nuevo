'use client'
import { useEffect, useState } from 'react'
import { toast } from 'react-toastify'

type Categoria = {
  id: number
  nombre: string
  categoria: string
}

type Tema = {
  id: number
  nombre: string
  subCategoria: string
  categoriaId: number
}

export default function TemasManager () {
  const [categorias, setCategorias] = useState<Categoria[]>([])
  const [temas, setTemas] = useState<Tema[]>([])
  const [nombre, setNombre] = useState('')
  const [categoriaId, setCategoriaId] = useState<number | ''>('')
  const [eliminandoId, setEliminandoId] = useState<number | null>(null)

  // Generar subCategoria sin espacios ni caracteres especiales
  const generarSubCategoria = (nombre: string) => {
    if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ ]*$/.test(nombre)) return null
    return nombre.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ]/g, '').replace(/\s+/g, '')
  }

  // Cargar categorías para select
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

  const handleAgregar = async (e: React.FormEvent) => {
    e.preventDefault()

    const nombreTrim = nombre.trim()

    if (!nombreTrim) {
      toast.error('El nombre no puede estar vacío')
      return
    }
    if (!categoriaId) {
      toast.error('Seleccione una categoría')
      return
    }
    if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ ]+$/.test(nombreTrim)) {
      toast.error('El nombre sólo puede contener letras y espacios')
      return
    }
    if (nombreTrim.length > 20) {
      toast.error('El nombre no puede superar los 20 caracteres')
      return
    }

    const subCategoriaGenerada = generarSubCategoria(nombreTrim)
    if (!subCategoriaGenerada) {
      toast.error('El nombre contiene caracteres inválidos')
      return
    }
    if (subCategoriaGenerada.length > 20) {
      toast.error(
        'El identificador generado no puede superar los 20 caracteres'
      )
      return
    }

    try {
      const res = await fetch('/api/temas-categorias', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nombre: nombreTrim,
          subCategoria: subCategoriaGenerada,
          categoriaId
        })
      })

      if (res.ok) {
        toast.success('Tema agregado')
        setNombre('')
        fetchTemas()
      } else {
        const errorData = await res.json()
        toast.error(errorData.error || 'Error al agregar tema')
      }
    } catch {
      toast.error('Fallo en la solicitud para agregar tema')
    }
  }

  const handleEliminar = async (id: number) => {
    if (!confirm('¿Seguro que quieres eliminar este tema?')) return
    setEliminandoId(id)

    try {
      const res = await fetch(`/api/temas-categorias/${id}`, {
        method: 'DELETE'
      })
      if (res.ok) {
        toast.success('Tema eliminado')
        fetchTemas()
      } else {
        toast.error('Error al eliminar tema')
      }
    } catch {
      toast.error('Fallo en la solicitud para eliminar tema')
    } finally {
      setEliminandoId(null)
    }
  }

  const cleanContenido=async () => {
    await fetch("/api/delete-contenido-gestion", { method: "POST" });
    ;
  }

  return (
    <div className='p-4 max-w-lg mx-auto bg-white rounded shadow-md'>
      <h2 className='text-xl font-bold mb-4'>Gestión de Temas</h2>

      <form onSubmit={handleAgregar} className='mb-6 flex flex-col gap-3'>
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

        <input
          type='text'
          placeholder='Nombre del tema (solo letras y espacios, max 20)'
          value={nombre}
          onChange={e => setNombre(e.target.value)}
          maxLength={20}
          required
          className='p-2 border rounded'
        />

        <button
          type='submit'
          className='px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700'
        >
          Agregar Tema
        </button>
      </form>

      <ul>
        {temas.length === 0 && (
          <li className='text-gray-500'>No hay temas disponibles.</li>
        )}
        {temas.map(tema => (
          <li
            key={tema.id}
            className='flex justify-between items-center border-b py-2'
          >
            <span>
              {tema.nombre}{' '}
              <small className='text-gray-400'>({tema.subCategoria})</small>
            </span>
            <button
              onClick={() => {handleEliminar(tema.id);
                cleanContenido(); // Llamada a la función de limpieza de videos
              }}
              disabled={eliminandoId === tema.id}
              className='text-red-600 hover:text-red-800 disabled:opacity-50 disabled:cursor-not-allowed'
            >
              {eliminandoId === tema.id ? 'Eliminando...' : 'Eliminar'}
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}
