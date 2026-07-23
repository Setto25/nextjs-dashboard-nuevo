"use client";
import React, { useState, useEffect } from "react";
import { Search, ChevronDown, ChevronUp, AlertCircle, AlertTriangle, ChevronRight } from "lucide-react";

interface AutoControlProps {
  itemsCalculados?: any[];
  loading?: boolean;
}

export default function AutoControlSemanalStock({ itemsCalculados, loading: loadingProp }: AutoControlProps) {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(loadingProp ?? !itemsCalculados);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [showQuiebre, setShowQuiebre] = useState<boolean>(false);

  useEffect(() => {
    if (itemsCalculados) {
      setItems(itemsCalculados);
      setLoading(loadingProp ?? false);
      return;
    }

    async function fetchPacks() {
      try {
        setLoading(true);
        const res = await fetch("/api/insumos-auto");
        if (!res.ok) throw new Error("Error al obtener los insumos automáticos.");
        const data = await res.json();
        setItems(Array.isArray(data) ? data : []);
      } catch (err: any) {
        console.error(err);
        setError(err.message || "Error al conectar con el servidor.");
      } finally {
        setLoading(false);
      }
    }

    fetchPacks();
  }, [itemsCalculados, loadingProp]);

  // Insumos que entran en quiebre de stock antes de Diciembre
  const insumosQuiebre = items.filter((item) => {
    if (!item.desgloses || item.desgloses.length === 0) return false;
    // Si consumió todo el stock anual o el saldo es 0 o negativo
    if (item.consumo >= item.total) return true;
    // O si el stock disponible para solicitar llega a 0 en algún mes antes de Diciembre (numMes < 12)
    //return item.desgloses.some((d: any) => d.numMes < 12 && d.restanteMes === 0 && item.consumo === 0); //LOGICA PRODUCE QUE SI UN MES TIENE  Y LOS MESES SIGUIENTES NO, LO MARCA COMO QUIEBRE.

  })

  const itemsFiltrados = items.filter((item) => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    const desc = item.articulo?.descripcion?.toLowerCase() || "";
    const idArt = String(item.articulo?.idArticulo || "");
    return desc.includes(q) || idArt.includes(q);
  });

  if (loading) {
    return (
      <div className="bg-white p-12 rounded-xl border shadow-sm flex justify-center items-center gap-3 text-slate-500">
        <svg className="animate-spin h-6 w-6 text-emerald-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <span>Cargando insumos automáticos...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 p-6 rounded-xl border border-red-200 text-red-700">
        <p className="font-bold">Error de sincronización</p>
        <p className="text-sm">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Banner Colapsable de Alerta de Quiebre de Stock */}
      {insumosQuiebre.length > 0 && (
        <div className="p-4 rounded-xl border border-red-300 bg-red-50 text-red-900 shadow-sm flex flex-col gap-3 transition-all animate-in fade-in duration-300">
          <div
            className="flex items-center justify-between cursor-pointer select-none"
            onClick={() => setShowQuiebre(!showQuiebre)}
          >
            <div className="flex items-center gap-2.5 font-bold text-red-800 text-base">
              <AlertTriangle className="h-5 w-5 text-red-600 animate-pulse shrink-0" />
              <span>Alerta: Quiebre de Stock Prematuro ({insumosQuiebre.length} insumos)</span>
            </div>
            <button className="text-red-700 hover:bg-red-100 p-1.5 rounded-lg transition-colors flex items-center gap-1 text-xs font-semibold">
              <span>{showQuiebre ? "Ocultar listado" : "Ver listado"}</span>
              <ChevronRight className={`h-4 w-4 transition-transform duration-200 ${showQuiebre ? "rotate-90" : ""}`} />
            </button>
          </div>

          {showQuiebre && (
            <div className="mt-1 border-t border-red-200 pt-3">
              <p className="text-xs text-red-700 mb-2 font-medium">
                Los siguientes insumos agotan su cuota anual antes del mes de Diciembre. Se sugiere gestionar su reposición:
              </p>
              <div className="max-h-52 overflow-y-auto pr-2 space-y-2 text-xs font-medium text-red-800 scrollbar-thin scrollbar-thumb-red-200">
                {insumosQuiebre.map((ins: any) => {
                  // Determinar el primer mes donde el saldo restante llegó a 0

                  return (
                    <div
                      key={ins.idPack || ins.articulo?.idArticulo}
                      className="flex flex-col sm:flex-row sm:items-center justify-between bg-white p-3 rounded-lg border border-red-200 shadow-2xs gap-1"
                    >
                      <div>
                        <span className="font-bold text-red-900">Código / Nº {ins.articulo?.idArticulo}</span> - {ins.articulo?.descripcion}
                      </div>
                      <div className="text-right text-[11px] shrink-0 font-bold text-red-700 bg-red-100 px-2 py-1 rounded">
                        Agotado en: <span className="capitalize font-extrabold"></span> ({ins.consumo} / {ins.total})
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Buscador por código de insumo o nombre */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-4 rounded-xl border shadow-sm">
        <div className="relative w-full sm:w-96">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
            <Search className="h-4 w-4" />
          </div>
          <input
            type="text"
            className="block w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-gray-50/50"
            placeholder="Buscar por código (Nº artículo) o nombre..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="text-xs text-gray-500 font-medium">
          Mostrando {itemsFiltrados.length} de {items.length} insumos
        </div>
      </div>

      {itemsFiltrados.length === 0 ? (
        <div className="bg-white p-12 rounded-xl border border-dashed text-center text-slate-500">
          <p className="font-semibold text-base text-slate-700">No se encontraron insumos coincidentes</p>
          <p className="text-sm mt-1 text-slate-400">Intenta buscar por otro número de artículo o descripción.</p>
        </div>
      ) : (
        itemsFiltrados.map((packItem: any) => (
          <TablaSinglePack key={packItem.idPack || packItem.articulo?.idArticulo} itemCalculado={packItem} />
        ))
      )}
    </div>
  );
}

function TablaSinglePack({ itemCalculado }: { itemCalculado: any }) {
  // Cuota mensual y consumo real contraídas por defecto
  const [showDetalles, setShowDetalles] = useState<boolean>(false);

  if (!itemCalculado || !itemCalculado.desgloses) return null;

  const mesActualNum = itemCalculado.mesActualNum || new Date().getMonth() + 1;

  return (
    <div className="bg-white p-6 rounded-xl border shadow-sm space-y-4">
      {/* Encabezado del Insumo */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b pb-3">
        <div>
          <h3 className="text-lg font-bold text-gray-800">
            {itemCalculado.articulo?.descripcion || "Insumo sin descripción"}
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            Código / Nº Insumo: <span className="font-mono font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">{itemCalculado.articulo?.idArticulo}</span>
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-3 text-xs bg-slate-50 border p-2 px-3 rounded-lg">
            <div>Total Anual: <strong className="text-slate-800">{itemCalculado.total}</strong></div>
            <div className="h-4 w-px bg-slate-200"></div>
            <div>Consumo Total: <strong className="text-amber-600">{itemCalculado.consumo}</strong></div>
          </div>

          {/* Botón para expandir/contraer Cuota y Consumo */}
          <button
            onClick={() => setShowDetalles(!showDetalles)}
            className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 bg-gray-100 hover:bg-gray-200 py-2 px-3 rounded-lg transition-colors cursor-pointer"
          >
            {showDetalles ? (
              <>
                <ChevronUp className="h-4 w-4 text-slate-500" /> Ocultar Detalles
              </>
            ) : (
              <>
                <ChevronDown className="h-4 w-4 text-slate-500" /> Ver Cuota / Consumo
              </>
            )}
          </button>
        </div>
      </div>

      {/* Tabla de 12 Meses */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm border-collapse border border-gray-200">
          <thead>
            <tr className="bg-slate-100 text-slate-700 uppercase text-xs">
              <th className="p-3 border text-left min-w-[160px]">Concepto</th>
              {itemCalculado.desgloses.map((m: any) => {
                const esMesActual = m.numMes === mesActualNum;
                return (
                  <th
                    key={m.mesNombre}
                    className={`p-2 border text-center capitalize transition-colors ${esMesActual ? "bg-emerald-600 text-white font-bold" : ""
                      }`}
                  >
                    <div className="flex flex-col items-center justify-center">
                      <span>{m.mesNombre}</span>
                      {esMesActual && (
                        <span className="text-[9px] bg-emerald-800 text-emerald-100 font-extrabold px-1.5 py-0.2 rounded uppercase mt-0.5 tracking-wider">
                          Actual
                        </span>
                      )}
                    </div>
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {/* Filas Expandibles: Cuota Mensual y Consumo Real (contraídas por defecto) */}
            {showDetalles && (
              <>
                <tr className="bg-gray-50/50">
                  <td className="p-3 border font-semibold text-gray-600">Cuota Mensual</td>
                  {itemCalculado.desgloses.map((m: any) => {
                    const esMesActual = m.numMes === mesActualNum;
                    return (
                      <td
                        key={m.mesNombre}
                        className={`p-2 border text-center text-gray-500 ${esMesActual ? "bg-emerald-50/50 font-medium" : ""
                          }`}
                      >
                        {m.cuotaMensual}
                      </td>
                    );
                  })}
                </tr>

                <tr className="bg-amber-50/30">
                  <td className="p-3 border font-bold text-amber-700">Consumo Real</td>
                  {itemCalculado.desgloses.map((m: any) => {
                    const esMesActual = m.numMes === mesActualNum;
                    return (
                      <td
                        key={m.mesNombre}
                        className={`p-2 border text-center font-semibold text-amber-600 ${esMesActual ? "bg-emerald-50/50" : ""
                          }`}
                      >
                        {m.consumoMes}
                      </td>
                    );
                  })}
                </tr>
              </>
            )}

            {/* Fila Principal: Restante a Solicitar (Siempre visible) */}
            <tr className="bg-white">
              <td className="p-3 border font-bold text-emerald-800">Restante a Solicitar</td>
              {itemCalculado.desgloses.map((m: any) => {
                const esMesPasado = m.numMes < mesActualNum;
                const esMesActual = m.numMes === mesActualNum;
                const tienePendientePasado = esMesPasado && m.restanteMes > 0;

                let cellClass = "bg-white text-emerald-700 font-bold";

                if (tienePendientePasado) {
                  // Rojo si es un mes pasado y su restante es mayor a 0
                  cellClass = "bg-red-100 text-red-700 font-black border-red-300 ring-1 ring-red-400/50";
                } else if (esMesActual) {
                  // Señalizador verde destacado para el mes actual
                  cellClass = "bg-emerald-100 text-emerald-900 font-black border-emerald-400 ring-2 ring-emerald-500/40";
                } else if (m.restanteMes === 0) {
                  cellClass = "bg-gray-50 text-gray-400 font-normal";
                }

                return (
                  <td key={m.mesNombre} className={`p-2 border text-center transition-all ${cellClass}`}>
                    <div className="flex items-center justify-center gap-1">
                      {tienePendientePasado && (
                        <span title="Pendiente no retirado en mes pasado">
                          <AlertCircle className="h-3.5 w-3.5 text-red-600 shrink-0" />
                        </span>
                      )}
                      <span>{m.restanteMes}</span>
                    </div>
                  </td>
                );
              })}
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
