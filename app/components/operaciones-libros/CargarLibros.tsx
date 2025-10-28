'use client';

import { useState, useEffect } from 'react';
// ... tus otras importaciones ...

// 1. Actualizamos la interfaz para usar 'url'
interface Libro {
  id: number;
  titulo: string;
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
  
  return (
    <div className="flex-container container-formulario-global bg-gray-100 p-6">
      {/* ... tu formulario de búsqueda ... */}

      <div className="resultados w-full mt-5">
        <p className="subtitle-responsive p-2">Libros disponibles:</p>
        {/* ... tu manejo de carga y errores ... */}
        {libros.length > 0 && (
          <div className="grid grid-cols-[repeat(auto-fit,minmax(350px,0.3fr))] gap-6 justify-center">
            {libros.map((libro) => (
              // 2. Comprobamos si existe la URL antes de renderizar
              libro.url && (
                <div key={libro.id} className='bg-white rounded-lg overflow-hidden transition-transform hover:scale-105 border-4 p-2 container-sombra'>
                  <h2 className='subtitle2-responsive multi-line-ellipsis-title'>{libro.titulo}</h2>
                  
                  {/*
                    NOTA: El iframe para Google Drive es complejo.
                    Un enlace directo es más confiable y simple.
                  */}
                  <div className='p-2 bg-gray-200 mt-2 text-center'>
                    <p>Vista previa no disponible.</p>
                    <p>Usa el botón para abrir el documento.</p>
                  </div>

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
                      className='bg-blue-500 hover:bg-blue-700 text-white py-1 rounded mt-4 w-full description-responsive text-center'
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
