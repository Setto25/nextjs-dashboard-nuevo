'use client';

import { useEffect, useState } from "react";
import '@/app/ui/global/containers.css';
import { useUploadStore } from "@/app/store/store";

interface Plantilla {
  id: number;
  titulo: string;
  url: string;  // Cambié `rutaLocal` a `archivo` para reflejar la estructura de datos
  descripcion?: string;
  categoria?: string;
  fechaCreacion: string;
  version?: string;
  creadoPor?: string;
}

function BuscarPlantillas() {
  const actualizarPlantillas = useUploadStore((state) => state.actualizarUpload);
  const [termino, setTermino] = useState('');
  const [tipo, setTipo] = useState('todos');
  const [Plantillas, setPlantillas] = useState<Plantilla[]>([]);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function cargarPlantillas() {
      try {
        setCargando(true);
        const response = await fetch('/api/plantillas');
        const data = await response.json();
        setPlantillas(data);
      } catch (error) {
        console.error('Error cargando Plantillas', error);
      } finally {
        setCargando(false);
      }
    }
    cargarPlantillas();
  }, [actualizarPlantillas]);

  const buscarPlantillas = async () => {
    if (!termino.trim()) return;

    setCargando(true);
    setError(null);

    try {
      const url = new URL('/api/plantillas', window.location.origin);
      url.searchParams.append('q', termino);
      url.searchParams.append('tipo', tipo);

      const response = await fetch(url.toString(), {
        method: 'GET',
        headers: { 'Accept': 'application/json' }
      });

      if (!response.ok) throw new Error(`Error: ${response.status}`);

      const resultados: Plantilla[] = await response.json();
      setPlantillas(resultados);
    } catch (error) {
      console.error("Error al buscar Plantillas", error);
      setError(error instanceof Error ? error.message : 'Error desconocido');
      setPlantillas([]);
    } finally {
      setCargando(false);
    }
  };

  const eliminarPlantilla = async (id: number) => {
    if (
      !confirm('¿Está seguro que desea eliminar este Plantilla? Esta acción es irreversible.')
    ) return;

    setCargando(true);
    try {
      const url = `/api/plantillas/${id}`;
      console.log("Eliminar la ID DE PLANTILLA:", id);
      const response = await fetch(url, {
        method: 'DELETE',
        headers: { 'Accept': 'application/json' }
      });

      if (!response.ok) throw new Error(`Error al eliminar Plantilla: ${response.status}`);

      setPlantillas(prev => prev.filter(Plantilla => Plantilla.id !== id));
    } catch (error) {
      console.error("Error al eliminar Plantilla", error);
      setError(error instanceof Error ? error.message : 'Error desconocido');
    } finally {
      setCargando(false);
    }
  };


  return (
    <div className="flex flex-col container-formulario-global bg-gray-100 p-6 items-center">
      {/* Instrucciones para buscar y eliminar Plantillas */}
      <div className="flex flex-row">
        <div className="Instrucciones__registro container-formulario-parte1 p-10">
          <ol className="container-listado">
            <li className="bg-white p-4 rounded-md shadow-sm">
              <h3 className="font-bold text-black-600 mb-2">Filtrar Plantillas</h3>
              <ul className="list-disc list-inside pl-4 space-y-1">
        
              </ul>
            </li>
          </ol>
        </div>
        {/* Formulario de búsqueda */}
        <div className="Formulario__agregar container-formulario-parte2 p-10">
          <form
            onSubmit={(e) => { e.preventDefault(); buscarPlantillas(); }}
            className="container-form"
          >
            <div className="flex flex-col space-y-4">
              <div className="w-full">
        
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
                  <option value="tema">Por tema</option>
                </select>
                {tipo === "titulo"?
                (<input
                  className="flex w-full p-2 border rounded"
                  value={termino}
                  onChange={(e) => setTermino(e.target.value)}
                  placeholder="Ingrese el término a buscar"
                />) : tipo === "categoria" ?
                (<select
                  value={termino}
                        onChange={(e) => {setTermino(e.target.value);}}
                  className="w-full p-2 border rounded-md border-gray-300"
                >
                  <option value="">-- Seleccione Área --</option>
                  <option value="legal_administrativo">Legales y Administrativos</option>
                  <option value="registros_clinicos">Registros Clínicos</option>
                  <option value="escalas_valoracion">Escalas de Valoración y Scores</option>
                  <option value="control_dispositivos">Seguimiento de Dispositivos</option>
                  <option value="listas_chequeo">Listas de Chequeo (Checklists)</option>
                  <option value="educacion_padres">Educación a Padres</option>
                </select>
                ): tipo === "tema"?
                (
                <select
                  value={termino}
                        onChange={(e) => {setTermino(e.target.value);}}
                  className="w-full p-2 border rounded-md border-gray-300"
                >
                  <option value="">-- Seleccione tEMA--</option>
                  <option value="Ingreso">Legales y Administrativos</option>
                  <option value="Alta">Registros Clínicos</option>
                  <option value="Educacion">Escalas de Valoración y Scores</option>
                  <option value="control_dispositivos">Seguimiento de Dispositivos</option>
                  <option value="listas_chequeo">Listas de Chequeo (Checklists)</option>
                  <option value="educacion_padres">Educación a Padres</option>
                </select>
        
                ):
                (<p></p>)}
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
      </div>

      {/* Resultados */}
      <div className="resultados w-1/2 mt-5">
        <p className="subtitle2-responsive">Resultados:</p>
        {error && <p style={{ color: 'red' }}>{error}</p>}

        {cargando ? (
          <p>Buscando...</p>
        ) : Plantillas.length === 0 ? (
          <p>No se encontraron resultados.</p>
        ) : (
          <div className="h-96 overflow-y-scroll space-y-2">
            {Plantillas.map(Plantilla => {
              const urlArchivo  = Plantilla.url ?? '';
             
              return (
                <div
                  key={Plantilla.id}
                  className="resultados bg-white p-4 my-1 flex justify-between items-center border border-gray-300 rounded"
                >
                  <div>
                    <h3 className="font-bold">{Plantilla.titulo}</h3>
                    <p>{Plantilla.descripcion}</p>
                    <p>Categoría: {Plantilla.categoria}</p>
                    <div className="flex space-x-8 mt-1 font-bold">
                {    /*  <a
                        href={urlArchivo}
                        download={`${Plantilla.titulo}.pdf`}
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
                          `¿Está seguro que desea eliminar el Plantilla "${Plantilla.titulo}"? Esta acción es irreversible.`
                        )
                      ) {
                        eliminarPlantilla(Plantilla.id)
                      
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

export default BuscarPlantillas;