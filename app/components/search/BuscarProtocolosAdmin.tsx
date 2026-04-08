'use client';

import { useEffect, useState } from "react";
import '@/app/ui/global/containers.css';
import { useUploadStore } from "@/app/store/store";

interface Protocolo {
  id: number;
  titulo: string;
  url: string;  // Cambié `rutaLocal` a `archivo` para reflejar la estructura de datos
  descripcion?: string;
  categoria?: string;
  fechaCreacion: string;
  version?: string;
  creadoPor?: string;
}

function BuscadorProtocolosAdmin() {
  const actualizarProtocolos = useUploadStore((state) => state.actualizarUpload);
  const [termino, setTermino] = useState('');
  const [tipo, setTipo] = useState('todos');
  const [protocolos, setProtocolos] = useState<Protocolo[]>([]);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function cargarProtocolos() {
      try {
        setCargando(true);
        const response = await fetch('/api/protocolos');
        const data = await response.json();
        setProtocolos(data);
      } catch (error) {
        console.error('Error cargando protocolos', error);
      } finally {
        setCargando(false);
      }
    }
    cargarProtocolos();
  }, [actualizarProtocolos]);

  const buscarProtocolos = async () => {
    if (!termino.trim()) return;

    setCargando(true);
    setError(null);

    try {
      const url = new URL('/api/protocolos', window.location.origin);
      url.searchParams.append('q', termino);
      url.searchParams.append('tipo', tipo);

      const response = await fetch(url.toString(), {
        method: 'GET',
        headers: { 'Accept': 'application/json' }
      });

      if (!response.ok) throw new Error(`Error: ${response.status}`);

      const resultados: Protocolo[] = await response.json();
      setProtocolos(resultados);
    } catch (error) {
      console.error("Error al buscar protocolos", error);
      setError(error instanceof Error ? error.message : 'Error desconocido');
      setProtocolos([]);
    } finally {
      setCargando(false);
    }
  };

  const eliminarProtocolo = async (id: number) => {
    if (
      !confirm('¿Está seguro que desea eliminar este protocolo? Esta acción es irreversible.')
    ) return;

    setCargando(true);
    try {
      const url = `/api/protocolos/${id}`;
      const response = await fetch(url, {
        method: 'DELETE',
        headers: { 'Accept': 'application/json' }
      });

      if (!response.ok) throw new Error(`Error al eliminar protocolo: ${response.status}`);

      setProtocolos(prev => prev.filter(protocolo => protocolo.id !== id));
    } catch (error) {
      console.error("Error al eliminar protocolo", error);
      setError(error instanceof Error ? error.message : 'Error desconocido');
    } finally {
      setCargando(false);
    }
  };

  const limpiarArchivos = async () => {
    setCargando(true);
    try {
      const response = await fetch('/api/delete-contenido-gestion', {
        method: 'POST',
        headers: { 'Accept': 'application/json' }
      });

      if (!response.ok) throw new Error(`Error al limpiar archivos: ${response.status}`);

      await buscarProtocolos();
    } catch (error) {
      console.error("Error al limpiar archivos", error);
      setError(error instanceof Error ? error.message : 'Error desconocido');
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="flex-container container-formulario-global bg-gray-100 p-6">
      {/* Instrucciones para buscar y eliminar protocolos */}
      <div className="Instrucciones__registro container-formulario-parte1 p-10">
        <ol className="container-listado">
          <li className="bg-white p-4 rounded-md shadow-sm">
            <h3 className="font-bold text-emerald-600 mb-2">1. Buscar Protocolos.</h3>
            <ul className="list-disc list-inside pl-4 space-y-1">
              <li>Ingrese un término de búsqueda en el campo correspondiente.</li>
              <li>Seleccione el tipo de búsqueda (por Título, Categorías, etc.).</li>
              <li>Haga clic en el botón "Buscar" para obtener los resultados.</li>
            </ul>
          </li>
          <li className="bg-white p-4 rounded-md shadow-sm mt-4">
            <h3 className="font-bold text-emerald-600 mb-2">2. Eliminar Protocolos.</h3>
            <ul className="list-disc list-inside pl-4 space-y-1">
              <li>Para eliminar un protocolo, haga clic en el botón "Eliminar".</li>
              <li>Confirme la acción en el mensaje que aparece.</li>
              <li>Recuerde que la eliminación es irreversible.</li>
            </ul>
          </li>
        </ol>
      </div>

      {/* Formulario de búsqueda */}
      <div className="Formulario__agregar container-formulario-parte2 p-10">
        <form
          onSubmit={(e) => { e.preventDefault(); buscarProtocolos(); }}
          className="container-form"
        >
          <div className="flex flex-col space-y-4">
            <div className="w-full">
              <input
                className="flex w-full p-2 border rounded"
                value={termino}
                onChange={(e) => setTermino(e.target.value)}
                placeholder="Ingrese el término a buscar"
              />
            </div>
            <div>
              <select
                value={tipo}
                onChange={(e) => setTipo(e.target.value)}
                className="p-2 border rounded w-full"
              >
                <option value="todos">Buscar en Todo</option>
                <option value="titulo">Por Título</option>
                <option value="categoria">Por Categoría</option>
                <option value="descripcion">Por Descripción</option>
              </select>
            </div>
          </div>
          <button
            type="submit"
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2 px-4 rounded mt-4 w-full"
          >
            Buscar
          </button>
        </form>
      </div>

      {/* Resultados */}
      <div className="resultados w-1/2 mt-5">
        <p className="subtitle2-responsive">Resultados:</p>
        {error && <p style={{ color: 'red' }}>{error}</p>}

        {cargando ? (
          <p>Buscando...</p>
        ) : protocolos.length === 0 ? (
          <p>No se encontraron resultados.</p>
        ) : (
          <div className="h-96 overflow-y-scroll space-y-2">
            {protocolos.map(protocolo => {
              const urlArchivo  = protocolo.url ?? '';
             
              return (
                <div
                  key={protocolo.id}
                  className="resultados bg-white p-4 my-1 flex justify-between items-center border border-gray-300 rounded"
                >
                  <div>
                    <h3 className="font-bold">{protocolo.titulo}</h3>
                    <p>{protocolo.descripcion}</p>
                    <p>Categoría: {protocolo.categoria}</p>
                    <div className="flex space-x-8 mt-1 font-bold">
                {    /*  <a
                        href={urlArchivo}
                        download={`${protocolo.titulo}.pdf`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-emerald-600 hover:underline"
                      >
                        Descargar
                      </a> */}
                      <a
                        href={urlArchivo}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-emerald-600 hover:underline"
                      >
                        Abrir en nueva pestaña
                      </a>
                    </div>
                  </div>
                  <button
                    className="bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-3 rounded ml-2"
                    onClick={() => {
                      if (
                        confirm(
                          `¿Está seguro que desea eliminar el protocolo "${protocolo.titulo}"? Esta acción es irreversible.`
                        )
                      ) {
                        eliminarProtocolo(protocolo.id)
                      
                      }
                    }}
                  >
                    Eliminar
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default BuscadorProtocolosAdmin;