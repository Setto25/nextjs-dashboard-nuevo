"use client";

import React, { useState, useEffect } from "react";
import { Plus, Minus, Save, PlusCircle, RefreshCw, Archive, Trash, Search } from "lucide-react";

interface Inventario {
  id: string;
  mes: number;
  anio: number;
  stockActual: number;
}

interface Insumo {
  id: string;
  codigo: string;
  nombre: string;
  stockOriginal: number;
  activo: boolean;
}

export default function OperacionesInsumos() {
  const [insumos, setInsumos] = useState<Insumo[]>([]);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [verInactivos, setVerInactivos] = useState(false);
  const [busqueda, setBusqueda] = useState("");

  // Form states
  const [nuevoCodigo, setNuevoCodigo] = useState("");
  const [nuevoNombre, setNuevoNombre] = useState("");
  const [nuevoStockOriginal, setNuevoStockOriginal] = useState<number | "">("");

  // Staged reference updates: { insumoId: draftReferenceNumber }
  const [stagedStock, setStagedStock] = useState<Record<string, number | "">>({});

  const getCurrentReference = (insumo: Insumo) => {
    return insumo.stockOriginal;
  };

  const fetchInsumos = async () => {
    try {
      setFetching(true);
      const res = await fetch(`/api/insumos?inactivos=${verInactivos}`);
      if (!res.ok) throw new Error("Error obteniendo insumos");
      const data = await res.json();
      setInsumos(data);
      
      const newStagedStock: Record<string, number> = {};
      data.forEach((ins: Insumo) => {
        newStagedStock[ins.id] = getCurrentReference(ins);
      });
      setStagedStock(newStagedStock);
    } catch (error) {
      console.error(error);
    } finally {
      setFetching(false);
    }
  };

  useEffect(() => {
    fetchInsumos();
  }, [verInactivos]);

  const handleCreateInsumo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nuevoCodigo || !nuevoNombre || nuevoStockOriginal === "") return;
    setLoading(true);
    try {
      const res = await fetch("/api/insumos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          codigo: nuevoCodigo, 
          nombre: nuevoNombre, 
          stockOriginal: Number(nuevoStockOriginal) 
        }),
      });
      if (res.ok) {
        setNuevoCodigo("");
        setNuevoNombre("");
        setNuevoStockOriginal("");
        alert("El insumo ha sido registrado exitosamente.");
        fetchInsumos();
      } else {
        const data = await res.json();
        alert(data.error || "Se produjo un error al intentar registrar el insumo.");
      }
    } catch (err) {
      console.error(err);
      alert("Error de conexión al intentar registrar el insumo.");
    } finally {
      setLoading(false);
    }
  };

  const handleStockChange = (id: string, value: string) => {
    if (value === "") {
        setStagedStock((prev) => ({ ...prev, [id]: "" }));
        return;
    }
    const val = parseInt(value, 10);
    if (!isNaN(val)) {
        setStagedStock((prev) => ({ ...prev, [id]: val }));
    }
  };

  const handleIncrement = (id: string, currentVal: number | "") => {
    const val = currentVal === "" ? 0 : currentVal;
    setStagedStock((prev) => ({ ...prev, [id]: val + 1 }));
  };

  const handleDecrement = (id: string, currentVal: number | "") => {
    const val = currentVal === "" ? 0 : currentVal;
    setStagedStock((prev) => ({ ...prev, [id]: Math.max(0, val - 1) }));
  };

  const handleSaveStock = async (insumo: Insumo) => {
    const originStock = getCurrentReference(insumo);
    const finalStockVal = stagedStock[insumo.id];
    const finalStock = finalStockVal === "" ? 0 : Number(finalStockVal);
    
    const diff = finalStock - originStock;
    
    if (diff === 0) {
      alert("No se ha detectado ninguna variación en el stock anual para guardar.");
      return;
    }
    
    try {
      const res = await fetch(`/api/insumos/${insumo.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          stockOriginal: finalStock
        })
      });
      
      if (res.ok) {
        const refreshReq = await fetch("/api/insumos");
        if (refreshReq.ok) {
           const newData = await refreshReq.json();
           setInsumos(newData);
           const updated = newData.find((i: Insumo) => i.id === insumo.id);
           if (updated) {
               setStagedStock(prev => ({...prev, [insumo.id]: getCurrentReference(updated)}));
           }
        }
        alert("La modificación del stock anual ha sido guardada exitosamente.");
      } else {
        const d = await res.json();
        alert(d.error || "Se produjo un error crítico al intentar actualizar el stock anual.");
      }
    } catch (err) {
      console.error(err);
      alert("Error de conexión al procesar la actualización.");
    }
  };

  const handleToggleActivo = async (insumo: Insumo) => {
    const accion = insumo.activo ? "archivar" : "reactivar";
    if (!window.confirm(`¿Confirma que desea ${accion} el insumo con código ${insumo.codigo}?`)) return;

    try {
      const res = await fetch(`/api/insumos/${insumo.id}`, {
         method: "PUT",
         headers: { "Content-Type": "application/json" },
         body: JSON.stringify({ activo: !insumo.activo })
      });
      if (res.ok) {
         fetchInsumos();
      } else {
         alert("Se produjo un error al intentar actualizar el estado del insumo.");
      }
    } catch(e) {
      console.error(e);
      alert("Error de conexión con el servidor.");
    }
  };

  const insumosFiltrados = insumos.filter(ins => 
    ins.nombre.toLowerCase().includes(busqueda.toLowerCase()) || 
    ins.codigo.toLowerCase().includes(busqueda.toLowerCase())
  );

  return (
    <div className="p-6 text-slate-800 bg-gray-50 min-h-screen">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Gestión de Insumos</h1>
          <p className="text-gray-500 mt-1">
            Agregue nuevos insumos o actualice el stock de su inventario.
          </p>
        </div>

        {/* Create Insumo Form */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h2 className="text-lg font-semibold flex items-center mb-4">
            <PlusCircle className="mr-2 h-5 w-5 text-emerald-600" />
            Agregar Nuevo Insumo
          </h2>
          <form className="flex flex-col md:flex-row gap-4 items-end" onSubmit={handleCreateInsumo}>
            <div className="flex-1 w-full relative">
              <label className="block text-sm font-medium text-gray-700 mb-1">Código</label>
              <input
                type="text"
                required
                className="w-full border-gray-300 border rounded-lg p-2 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                placeholder="Ej. INS-001"
                value={nuevoCodigo}
                onChange={(e) => setNuevoCodigo(e.target.value)}
              />
            </div>
            <div className="flex-[2] w-full relative">
              <label className="block text-sm font-medium text-gray-700 mb-1">Nombre del Insumo</label>
              <input
                type="text"
                required
                className="w-full border-gray-300 border rounded-lg p-2 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                placeholder="Ej. Jeringas 5ml"
                value={nuevoNombre}
                onChange={(e) => setNuevoNombre(e.target.value)}
              />
            </div>
            <div className="flex-1 w-full relative">
              <label className="block text-sm font-medium text-gray-700 mb-1">Stock Anual</label>
              <input
                type="number"
                required
                min="0"
                className="w-full border-gray-300 border rounded-lg p-2 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                placeholder="0"
                value={nuevoStockOriginal}
                onChange={(e) => setNuevoStockOriginal(e.target.value === "" ? "" : Number(e.target.value))}
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full md:w-auto bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-2 px-6 rounded-lg transition-colors disabled:opacity-70 h-[42px]"
            >
              {loading ? "Creando..." : "Crear Insumo"}
            </button>
          </form>
        </div>

        {/* Insumos Lista */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-4 gap-4">
            <h2 className="text-lg font-semibold text-gray-900">Directorio de Insumos</h2>
            <div className="flex flex-col sm:flex-row items-center gap-3 w-full lg:w-auto">
               {/* Buscador */}
               <div className="relative w-full sm:w-64">
                 <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                 <input 
                   type="text"
                   placeholder="Buscar por nombre o código..."
                   className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none transition-all"
                   value={busqueda}
                   onChange={(e) => setBusqueda(e.target.value)}
                 />
               </div>

               <div className="flex items-center gap-2 w-full sm:w-auto">
                 <label className="flex flex-1 sm:flex-none items-center justify-center gap-2 cursor-pointer bg-gray-50 border border-gray-200 px-3 py-1.5 rounded-lg shadow-sm hover:bg-gray-100 transition whitespace-nowrap">
                    <span className="text-sm text-gray-700 font-medium">Ver Inactivos</span>
                    <input type="checkbox" checked={verInactivos} onChange={(e) => setVerInactivos(e.target.checked)} className="rounded text-emerald-600 focus:ring-emerald-500 h-4 w-4 border-gray-300"/>
                 </label>
                 <button 
                   onClick={fetchInsumos} 
                   className="flex items-center justify-center text-sm text-gray-600 hover:text-emerald-600 transition px-2 py-1.5"
                   title="Refrescar lista"
                 >
                   <RefreshCw className={`h-4 w-4 mr-1 ${fetching ? "animate-spin" : ""}`} />
                   Actualizar
                 </button>
               </div>
            </div>
          </div>

          {fetching && insumos.length === 0 ? (
            <div className="text-center py-10 text-gray-500">Cargando insumos...</div>
          ) : insumos.length === 0 ? (
            <div className="text-center py-10 text-gray-500">
              No hay insumos creados. Puede agregar uno en la sección superior.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50 text-gray-600 text-sm border-y border-gray-200">
                    <th className="py-3 px-4 font-medium">Código</th>
                    <th className="py-3 px-4 font-medium">Nombre</th>
                    <th className="py-3 px-4 font-medium">Stock Anual: Restante/Total </th>
                    <th className="py-3 px-4 font-medium">Cuota Mensual</th>
                    <th className="py-3 px-4 font-medium w-[260px]">Ajustar Stock Anual</th>
                    <th className="py-3 px-4 font-medium text-right">Acción</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {insumosFiltrados.map((insumo: any) => {
                    const originalStock = getCurrentReference(insumo) as number;
                    const anualRestante = insumo.stockAnualRestante ?? originalStock;
                    const mensualBase = Math.floor(originalStock / 12);
                    const limiteProyectado = insumo.limiteProyectadoMes ?? mensualBase;
                    
                    const currentDraftInfo = stagedStock[insumo.id];
                    const diff = currentDraftInfo === "" ? 0 : (currentDraftInfo - originalStock);
                    
                    return (
                      <tr key={insumo.id} className="hover:bg-gray-50/50 transition-colors">
                        <td className="py-3 px-4 text-sm font-medium text-gray-900">{insumo.codigo}</td>
                        <td className="py-3 px-4 text-sm text-gray-700">{insumo.nombre}</td>
                        <td className="py-3 px-4 text-sm text-gray-600">
                           <div className="flex flex-col">
                              <span className={`inline-flex items-center justify-center font-bold px-2.5 py-1 rounded-full ${anualRestante <= 0 ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-800'}`}>
                                 {anualRestante} <span className="text-gray-400 font-normal ml-1 text-xs">/ {originalStock}</span>
                              </span>
                           </div>
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-600">
                           <div className="flex flex-col">
                              <span className="font-semibold text-emerald-700">{limiteProyectado} <span className="font-normal text-emerald-400 text-xs">/ mes</span></span>
                           </div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center h-9 w-32 border border-gray-300 rounded-lg overflow-hidden bg-white">
                            <button
                              onClick={() => handleDecrement(insumo.id, currentDraftInfo)}
                              className="h-full px-3 text-gray-600 hover:bg-gray-100 transition-colors border-r border-gray-300 focus:outline-none flex-shrink-0"
                            >
                              <Minus className="h-4 w-4" />
                            </button>
                            <input
                              type="number"
                              className="h-full w-full text-center text-sm font-medium focus:outline-none appearance-none m-0 p-0 text-gray-900"
                              value={currentDraftInfo}
                              onChange={(e) => handleStockChange(insumo.id, e.target.value)}
                            />
                            <button
                              onClick={() => handleIncrement(insumo.id, currentDraftInfo)}
                              className="h-full px-3 text-gray-600 hover:bg-gray-100 transition-colors border-l border-gray-300 focus:outline-none flex-shrink-0"
                            >
                              <Plus className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="flex justify-end gap-2 items-center">
                            <button
                              onClick={() => handleSaveStock(insumo)}
                              disabled={diff === 0}
                              className={`inline-flex items-center justify-center px-4 py-2 text-sm font-medium rounded-lg transition-all ${
                                diff === 0 
                                  ? "bg-gray-100 text-gray-400 cursor-not-allowed" 
                                  : diff > 0 
                                    ? "bg-green-600 hover:bg-green-700 text-white shadow-sm"
                                    : "bg-red-600 hover:bg-red-700 text-white shadow-sm"
                              }`}
                            >
                              <Save className="h-4 w-4 mr-2" />
                              {diff === 0 
                                ? "Guardar" 
                                : diff > 0 
                                  ? `+${diff} (Guardar)` 
                                  : `${diff} (Guardar)`}
                            </button>
                            <button
                               onClick={() => handleToggleActivo(insumo)}
                               title={insumo.activo ? "Desactivar/borrar" : "Reactivar"}
                               className={`p-2 rounded-lg transition-colors border ${insumo.activo ? "text-gray-400 hover:text-red-500 hover:bg-red-50 border-gray-200" : "text-amber-600 hover:text-amber-700 hover:bg-amber-50 border-amber-200 bg-amber-50"}`}
                            >
                               <Trash className="h-5 w-5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
