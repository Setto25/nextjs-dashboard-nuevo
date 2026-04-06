"use client";

import React, { useState, useEffect } from "react";
import { Plus, Minus, Save, PlusCircle, RefreshCw } from "lucide-react";

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
  stockReferencia: number;
  stockActual: number;
  ultimoMesReset: number;
  activo: boolean;
}

export default function OperacionesInsumos() {
  const [insumos, setInsumos] = useState<Insumo[]>([]);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  // Form states
  const [nuevoCodigo, setNuevoCodigo] = useState("");
  const [nuevoNombre, setNuevoNombre] = useState("");
  const [nuevoStockReferencia, setNuevoStockReferencia] = useState<number | "">("");

  // Staged reference updates: { insumoId: draftReferenceNumber }
  const [stagedStock, setStagedStock] = useState<Record<string, number | "">>({});

  const getCurrentReference = (insumo: Insumo) => {
    return insumo.stockReferencia;
  };

  const fetchInsumos = async () => {
    try {
      setFetching(true);
      const res = await fetch("/api/insumos");
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
  }, []);

  const handleCreateInsumo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nuevoCodigo || !nuevoNombre || nuevoStockReferencia === "") return;
    setLoading(true);
    try {
      const res = await fetch("/api/insumos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          codigo: nuevoCodigo, 
          nombre: nuevoNombre, 
          stockReferencia: Number(nuevoStockReferencia) 
        }),
      });
      if (res.ok) {
        setNuevoCodigo("");
        setNuevoNombre("");
        setNuevoStockReferencia("");
        alert("Insumo creado correctamente.");
        fetchInsumos();
      } else {
        const data = await res.json();
        alert(data.error || "Error creando insumo");
      }
    } catch (err) {
      console.error(err);
      alert("Error al intentar crear el insumo.");
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
      alert("No has modificado el stock original de este insumo.");
      return;
    }
    
    try {
      const res = await fetch(`/api/insumos/${insumo.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          stockReferencia: finalStock,
          stockActual: insumo.stockActual + diff // Ajustamos en proporción el disponible para que coincida con el aumento
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
        alert("Stock original actualizado.");
      } else {
        const d = await res.json();
        alert(d.error || "Error actualizando stock original.");
      }
    } catch (err) {
      console.error(err);
      alert("Error actualizando stock");
    }
  };

  return (
    <div className="p-6 text-slate-800 bg-gray-50 min-h-screen">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Operaciones de Insumos</h1>
          <p className="text-gray-500 mt-1">
            Agrega nuevos insumos al catálogo o actualiza el stock actual de tu inventario.
          </p>
        </div>

        {/* Create Insumo Form */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h2 className="text-lg font-semibold flex items-center mb-4">
            <PlusCircle className="mr-2 h-5 w-5 text-blue-600" />
            Agregar Nuevo Insumo
          </h2>
          <form className="flex flex-col md:flex-row gap-4 items-end" onSubmit={handleCreateInsumo}>
            <div className="flex-1 w-full relative">
              <label className="block text-sm font-medium text-gray-700 mb-1">Código</label>
              <input
                type="text"
                required
                className="w-full border-gray-300 border rounded-lg p-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
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
                className="w-full border-gray-300 border rounded-lg p-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                placeholder="Ej. Jeringas 5ml"
                value={nuevoNombre}
                onChange={(e) => setNuevoNombre(e.target.value)}
              />
            </div>
            <div className="flex-1 w-full relative">
              <label className="block text-sm font-medium text-gray-700 mb-1">Stock Referencia (Ideal)</label>
              <input
                type="number"
                required
                min="0"
                className="w-full border-gray-300 border rounded-lg p-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                placeholder="0"
                value={nuevoStockReferencia}
                onChange={(e) => setNuevoStockReferencia(e.target.value === "" ? "" : Number(e.target.value))}
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full md:w-auto bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-lg transition-colors disabled:opacity-70 h-[42px]"
            >
              {loading ? "Creando..." : "Crear Insumo"}
            </button>
          </form>
        </div>

        {/* Insumos Lista */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Directorio de Insumos</h2>
            <button 
              onClick={fetchInsumos} 
              className="flex items-center text-sm text-gray-600 hover:text-blue-600 transition"
              title="Refrescar lista"
            >
              <RefreshCw className={`h-4 w-4 mr-1 ${fetching ? "animate-spin" : ""}`} />
              Actualizar
            </button>
          </div>

          {fetching && insumos.length === 0 ? (
            <div className="text-center py-10 text-gray-500">Cargando insumos...</div>
          ) : insumos.length === 0 ? (
            <div className="text-center py-10 text-gray-500">
              No hay insumos creados. Agrega uno arriba.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50 text-gray-600 text-sm border-y border-gray-200">
                    <th className="py-3 px-4 font-medium">Código</th>
                    <th className="py-3 px-4 font-medium">Nombre</th>
                    <th className="py-3 px-4 font-medium">Stock Original Fijo</th>
                    <th className="py-3 px-4 font-medium w-[260px]">Ajustar Stock Fijo</th>
                    <th className="py-3 px-4 font-medium text-right">Acción</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {insumos.map((insumo) => {
                    const originalStock = getCurrentReference(insumo);
                    const currentDraftInfo = stagedStock[insumo.id];
                    const diff = currentDraftInfo === "" ? 0 : (currentDraftInfo - originalStock);
                    
                    return (
                      <tr key={insumo.id} className="hover:bg-gray-50/50 transition-colors">
                        <td className="py-3 px-4 text-sm font-medium text-gray-900">{insumo.codigo}</td>
                        <td className="py-3 px-4 text-sm text-gray-700">{insumo.nombre}</td>
                        <td className="py-3 px-4 text-sm text-gray-600">
                           <span className="inline-flex items-center justify-center bg-gray-100 text-gray-700 px-2.5 py-1 rounded-full font-medium">
                              {originalStock}
                           </span>
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
