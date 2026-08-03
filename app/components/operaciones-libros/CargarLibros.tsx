'use client';

import { useState, useEffect } from 'react';
// ... tus otras importaciones ...

// 1. Actualizamos la interfaz para usar 'url'
interface Libro {
  id: number;
  titulo: string;
  portada?: string; // Nueva propiedad para la URL de la portada
  url?: string; // Antes 'rutaLocal', ahora es opcional y se llama 'url'
  descripcion?: string;
  fechaSubida: string;
  formato?: string;
}

function CargarLibros() {
  const [libros, setLibros] = useState<Libro[]>([]);
const [termino, setTermino] = useState('');
  const [tipo, setTipo] = useState('todos');
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState<string | null>(null);





  useEffect(() => {
    const cargarLibrosIniciales = async () => {
          try {
        const response = await fetch(`/api/books?tipo=todos`);  // Realiza busqueda por q(termino) y por tema (tipo)
        const data = await response.json();
        console.log("LA RUTA", data)

        setLibros(data);
          console.log('EL DATA LIBRO ES:', data);  // Verificar los libros cargados
      } catch (error) {
        console.error('Error cargando libros', error);
      } finally {
        setCargando(false);
      }
    

    };
    cargarLibrosIniciales();
  }, []);

  // ...función de búsqueda ...
  
    const buscarLibros = async () => {
    // Prevenir búsqueda vacía  
    if (!termino.trim()) return;

    setCargando(true);
    setError(null);

    try {
      const url = new URL('/api/books', window.location.origin);
      url.searchParams.append('q', termino);
      url.searchParams.append('tipo', tipo);

      const response = await fetch(url.toString(), {
        method: 'GET',
        headers: {
          'Accept': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }

      const resultados: Libro[] = await response.json();
      setLibros(resultados);
    } catch (error) {
      console.error("Error al buscar libros", error);
      setError(error instanceof Error ? error.message : 'Error desconocido');
      setLibros([]);
    } finally {
      setCargando(false);
    }
  }

  const ambasBusquedas = () => {
    buscarLibros();
  };
  
  const recargarFormulario = () => {
    window.location.reload()
  }
  
  return (
    <div className="flex-container flex-row place-items-center">
      {/* Instrucciones para buscar libros */}
      <div className='Instrucciones__registro container-formulario-parte1 p-10'>
        <ol className='container-listado'>
          <li className='bg-white p-4 rounded-md shadow-sm'>
            <h3 className='font-bold text-emerald-600 mb-2'>
              1. Filtrar Libros.
            </h3>
            <ul className='list-disc list-inside pl-4 space-y-1'>
              <li>Ingrese un término a filtrar en el campo correspondiente.</li>
              <li>Seleccione el tipo de filtro (por Título, Categorías, etc.).</li>
              <li>Haga clic en el botón "Filtrar" para obtener los resultados.</li>
            </ul>
          </li>
        </ol>
      </div>

      {/* Formulario de búsqueda */}
      <div className='Formulario__agregar conatiner-formulario-parte2 p-10'>
        <form
          onSubmit={e => {
            e.preventDefault()
            buscarLibros()
          }}
          className='container-form'
        >
          <div className='flex flex-col space-y-4'>
            <div className='w-full'>
              <input
                className='flex w-full p-2 border rounded'
                value={termino}
                onChange={e => setTermino(e.target.value)}
                placeholder='Ingrese el término a buscar'
              />
            </div>
            <div>
              <select
                value={tipo}
                onChange={(e) => setTipo(e.target.value)}
                className='p-2 border rounded w-full'
              >
                <option value='todos'>Mostrar Todo</option>
                <option value='titulo'>Por Título</option>
                <option value='categorias'>Por Categorías</option>
                <option value='descripcion'>Por Descripción</option>
              </select>
            </div>
          </div>
          <button
            type='submit'
            className='bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2 px-4 rounded mt-4 w-full'
          >
            Filtrar
          </button>

          <button
            type='button'
            onClick={recargarFormulario}
            className='bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2 px-4 rounded mt-4 w-full'
          >
            Mostrar todo
          </button>
        </form>
      </div>

      <div className="resultados w-full mt-5">
        <p className="subtitle-responsive p-2">Resultados:</p>
        {error && <p style={{ color: 'red' }}>{error}</p>}
        {cargando ? (
          <p>Buscando...</p>
        ) : libros.length === 0 ? (
          <p>No se encontraron resultados.</p>
        ) : (
          <div className="grid grid-cols-[repeat(auto-fit,minmax(350px,0.3fr))] gap-6 justify-center">
            {libros.map((libro) => (
              // 2. Comprobamos si existe la URL antes de renderizar
              libro.url && (
                <div key={libro.id} className='card-documento'>
                  <h2 className='subtitle2-responsive multi-line-ellipsis-title'>{libro.titulo}</h2>
                  
                  {/*
                    NOTA: El iframe para Google Drive es complejo.
                    Un enlace directo es más confiable y simple.
                  */}
                  {libro.portada? (
               <div className='portada__ portada-documento'>
                    <img
                      src={libro.portada}
                      alt={`Portada de ${libro.titulo}`}
                      loading='lazy'
                      className='w-full h-full object-cover object-top mt-2 aspect-[8.5/11] rounded cursor-pointer'
                      onClick={() => window.open(libro.url, '_blank')}
                    />
                  </div>
                  
) : (
  <div className="w-full h-fit mt-2 aspect-[8.5/11] bg-gray-200 flex items-center justify-center">
    <span className="text-gray-500">Sin portada</span>
  </div>
)}

                  <div className='pt-4 px-2 space-y-2'>
                    <p className='contenedor__descripcion small-text-responsive multi-line-ellipsis h-16'>
                      <span className='font-bold'>Descripcion:</span> {libro.descripcion}
                    </p>
                  </div>
                  <div className='contenedor__centrador flex flex-row justify-center'>
                    {/* 3. Este botón ahora abre la URL de Google Drive directamente */}
                    <a
                      href={libro.url}
                      target="_blank" // Para abrir en una nueva pestaña
                      rel="noopener noreferrer" // Por seguridad
                      className='bg-emerald-600 hover:bg-emerald-700 text-white py-1 rounded mt-4 w-full description-responsive text-center' onClick={() => window.open(`${libro.url}`, "_blank")}
                    >
                      Abrir en nueva ventana
                    </a>
                  </div>
                </div>
              )
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default CargarLibros;
