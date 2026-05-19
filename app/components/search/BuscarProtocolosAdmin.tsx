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
                  className="bg-white rounded-xl p-5 my-3 shadow-sm hover:shadow-md border border-gray-100 hover:border-emerald-100 transition-all duration-300 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-bold text-gray-800">{protocolo.titulo}</h3>
                      {protocolo.categoria && (
                        <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs px-2 py-1 rounded-full font-medium whitespace-nowrap">
                          {protocolo.categoria}
                        </span>
                      )}
                    </div>
                    {protocolo.descripcion && (
                      <p className="text-gray-600 text-sm mb-3">
                        {protocolo.descripcion}
                      </p>
                    )}
                    <div className="flex gap-3">
                      <a
                        href={urlArchivo}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center justify-center px-4 py-2 bg-emerald-50 text-emerald-700 hover:bg-emerald-600 hover:text-white rounded-lg transition-colors font-semibold text-sm"
                      >
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                        Abrir Documento
                      </a>
                    </div>
                  </div>
                  <button
                    className="inline-flex items-center px-4 py-2 bg-red-50 text-red-600 hover:bg-red-600 hover:text-white font-bold rounded-lg transition-colors shrink-0"
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
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
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