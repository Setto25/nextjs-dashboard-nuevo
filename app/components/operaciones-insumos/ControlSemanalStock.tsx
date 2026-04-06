"use client";

import React, { useState, useEffect } from 'react';
import { 
  startOfWeek, 
  endOfWeek, 
  addWeeks, 
  subWeeks, 
  format, 
  isWithinInterval,
  addDays,
  setHours,
  endOfMonth,
  isSameWeek
} from 'date-fns';
import { ChevronLeft, ChevronRight, Search, AlertTriangle } from 'lucide-react';

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
  stockReferencia: number; // Tratado aquí como el Stock Determinado Fijo 
  stockActual: number;
  ultimoMesReset: number;
  activo: boolean;
}

interface Movimiento {
  id: string;
  insumoId: string;
  fecha: string;
  cantidad: number;
  tipo: 'INGRESO' | 'RETIRO';
}

export default function ControlSemanalStock() {
  const [currentWeekStart, setCurrentWeekStart] = useState<Date>(startOfWeek(new Date(), { weekStartsOn: 1 }));
  const [insumos, setInsumos] = useState<Insumo[]>([]);
  const [movimientos, setMovimientos] = useState<Movimiento[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  
  const [loading, setLoading] = useState(true);

  const fetchDatos = async () => {
    setLoading(true);
    try {
      const [resInsumos, resMovs] = await Promise.all([
        fetch('/api/insumos').then(res => res.json()),
        fetch('/api/movimientos').then(res => res.json())
      ]);
      if (Array.isArray(resInsumos)) setInsumos(resInsumos);
      if (Array.isArray(resMovs)) setMovimientos(resMovs);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDatos();
  }, []);

  const handlePrevWeek = () => setCurrentWeekStart(prev => subWeeks(prev, 1));
  const handleNextWeek = () => setCurrentWeekStart(prev => addWeeks(prev, 1));
  
  const handleJumpToWeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.value) {
      const date = new Date(e.target.value);
      if (!isNaN(date.getTime())) {
        setCurrentWeekStart(startOfWeek(date, { weekStartsOn: 1 }));
      }
    }
  };

  const weekEnd = endOfWeek(currentWeekStart, { weekStartsOn: 1 });

  const getStockDisponible = (insumo: Insumo) => {
    return insumo.stockActual;
  };

  const insumosProcesados = insumos.map(ins => {
    // Calculamos el total inicial del mes (stock determinado aproximado)
    const stockDeterminado = ins.stockReferencia;
    
    // Escaneamos solo los movimientos de la semana actual visualizada
    const movsSemana = movimientos.filter(m => {
      const fechaMov = new Date(m.fecha);
      return m.insumoId === ins.id && isWithinInterval(fechaMov, { start: currentWeekStart, end: weekEnd });
    });

    let reti1 = 0, ing1 = 0;
    let reti2 = 0, ing2 = 0;

    movsSemana.forEach(m => {
      const day = new Date(m.fecha).getDay(); 
      // getDay() -> 0: Sun, 1: Mon, 2: Tue, 3: Wed, 4: Thu, 5: Fri, 6: Sat
      if (day >= 1 && day <= 3) {
        // Lunes, Martes, Miercoles -> 1ra Instancia
        if (m.tipo === 'RETIRO') reti1 += m.cantidad;
        if (m.tipo === 'INGRESO') ing1 += m.cantidad;
      } else {
        // Jueves, Viernes, Sabado, Domingo -> 2da Instancia
        if (m.tipo === 'RETIRO') reti2 += m.cantidad;
        if (m.tipo === 'INGRESO') ing2 += m.cantidad;
      }
    });

    const netoInstancia1 = reti1 - ing1; // Total sustraído en el momento 1
    const netoInstancia2 = reti2 - ing2; // Total sustraído en el momento 2

    return {
      ...ins,
      stockDisponible: getStockDisponible(ins),
      netoInstancia1,
      netoInstancia2
    };
  }).filter(ins => {
    const q = searchQuery.toLowerCase();
    return ins.nombre.toLowerCase().includes(q) || ins.codigo.toLowerCase().includes(q);
  });

  const endOfCurrentMonth = endOfMonth(currentWeekStart);
  const isLastWeekOfMonth = isSameWeek(currentWeekStart, endOfCurrentMonth, { weekStartsOn: 1 });
  const insumosAlerta = isLastWeekOfMonth ? insumosProcesados.filter(ins => ins.stockDisponible > 0) : [];

  const registrarMovimiento = async (insumoId: string, tipo: 'INGRESO'|'RETIRO', cantidad: number, instancia: 1|2) => {
    if (cantidad <= 0 || isNaN(cantidad)) return;

    // Asignamos una fecha artificial en medio de los buckets para segmentar las instancias en la BD
    // Instancia 1 -> Lunes de la semana en pantalla a las 12 PM
    // Instancia 2 -> Jueves de la semana en pantalla a las 12 PM
    const targetDate = instancia === 1 
      ? setHours(currentWeekStart, 12) 
      : setHours(addDays(currentWeekStart, 3), 12); 

    try {
      const resp = await fetch('/api/movimientos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          insumoId,
          tipo,
          cantidad,
          fecha: targetDate.toISOString() 
        })
      });

      if (resp.ok) {
        fetchDatos(); // Refrescar stock e instancias
      } else {
        const errorData = await resp.json();
        alert(errorData.error || "Error al procesar el movimiento.");
      }
    } catch (error) {
      console.error(error);
      alert("Error de conexión con el backend.");
    }
  };

  return (
    <div className="w-full h-full bg-white rounded-lg shadow-sm p-6 border border-gray-100 ring-1 ring-gray-900/5">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-8 gap-4 border-b pb-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-gray-900 text-transparent bg-clip-text">Gestión del Número de Insumos</h2>
          <p className="text-sm text-gray-500 mt-1">Registra hasta dos momentos de retiro en la semana descontando del stock.</p>
        </div>
        
        <div className="flex flex-wrap items-center gap-2 bg-gray-50 border border-gray-200 p-2 rounded-xl shadow-sm">
          <button 
            onClick={handlePrevWeek} 
            className="p-2 hover:bg-white hover:text-blue-600 rounded-lg transition-all focus:outline-none"
            aria-label="Semana Anterior"
          >
            <ChevronLeft size={20}/>
          </button>
          <div className="text-sm font-semibold text-gray-700 px-3 whitespace-nowrap">
            {format(currentWeekStart, 'dd MMM')} — {format(weekEnd, 'dd MMM, yyyy')}
          </div>
          <button 
            onClick={handleNextWeek} 
            className="p-2 hover:bg-white hover:text-blue-600 rounded-lg transition-all focus:outline-none"
            aria-label="Semana Siguiente"
          >
            <ChevronRight size={20}/>
          </button>
          <div className="h-6 w-px bg-gray-300 mx-1 hidden sm:block"></div>
          <input 
            type="date" 
            title="Buscar fecha"
            className="text-sm text-gray-600 border-none bg-transparent rounded-lg py-1 px-2 focus:ring-2 focus:ring-blue-500 hover:bg-gray-100 transition-colors cursor-pointer w-full sm:w-auto"
            onChange={handleJumpToWeek}
          />
        </div>
      </div>

      <div className="relative mb-8 bg-gray-50/50 p-4 rounded-xl border border-gray-100 max-w-sm">
        <div className="absolute inset-y-0 left-0 pl-7 flex items-center pointer-events-none text-gray-400">
          <Search className="h-5 w-5" />
        </div>
        <input
          type="text"
          className="block w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg leading-5 bg-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm shadow-sm transition-shadow"
          placeholder="Buscar por código o nombre..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {isLastWeekOfMonth && insumosAlerta.length > 0 && (
        <div className="mb-8 p-5 rounded-xl border border-red-200 bg-orange-50 text-orange-900 shadow-sm flex flex-col gap-2">
          <div className="flex items-center gap-2 font-bold text-red-700 text-lg">
            <AlertTriangle className="h-6 w-6 text-red-600" />
            Alerta de Cierre de Mes
          </div>
          <p className="text-sm">Existen insumos que no han sido retirados totalmente o no han llegado a 0 en la última semana de este mes:</p>
          <ul className="list-disc pl-5 text-sm font-medium mt-1 text-red-800">
            {insumosAlerta.map(ins => (
              <li key={ins.id}>{ins.codigo} - {ins.nombre} <span className="text-gray-500 font-normal">(Sobrante: {ins.stockDisponible})</span></li>
            ))}
          </ul>
        </div>
      )}

      <div className="overflow-hidden bg-white border border-gray-200 rounded-xl shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-[#f8fafc]">
              <tr>
                <th scope="col" className="px-5 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider w-20">Código</th>
                <th scope="col" className="px-5 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Insumo</th>
                <th scope="col" className="px-5 py-4 text-center text-xs font-semibold text-slate-600 uppercase tracking-wider w-36 leading-tight">Stock<br/>Determinado</th>
                <th scope="col" className="px-5 py-4 text-center text-xs font-semibold text-slate-600 uppercase tracking-wider w-36 leading-tight">Stock<br/>Disponible</th>
                <th scope="col" className="px-5 py-4 text-center text-xs font-semibold text-slate-600 uppercase tracking-wider border-l border-gray-200 bg-blue-50/30">1° Retiro<br/>(Semana)</th>
                <th scope="col" className="px-5 py-4 text-center text-xs font-semibold text-slate-600 uppercase tracking-wider border-l border-gray-200 bg-blue-50/30">2° Retiro<br/>(Semana)</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-sm text-gray-500">
                    <div className="flex justify-center items-center gap-2">
                       <svg className="animate-spin h-5 w-5 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                       Sincronizando...
                    </div>
                  </td>
                </tr>
              ) : insumosProcesados.length === 0 ? (
                <tr><td colSpan={6} className="text-center py-12 text-gray-400 text-sm">No se encontraron insumos.</td></tr>
              ) : (
                insumosProcesados.map(insumo => (
                  <tr key={insumo.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-5 py-4 whitespace-nowrap text-sm font-semibold text-gray-800">{insumo.codigo}</td>
                    <td className="px-5 py-4 whitespace-nowrap text-sm text-gray-600">{insumo.nombre}</td>
                    
                    <td className="px-5 py-4 whitespace-nowrap text-center text-sm font-medium text-gray-500">
                      {insumo.stockReferencia}
                    </td>
                    
                    <td className="px-5 py-4 whitespace-nowrap text-center">
                      <span className={`inline-flex items-center px-3 py-1 rounded border shadow-sm text-sm font-bold ${insumo.stockDisponible > 0 ? 'bg-white border-blue-200 text-blue-700' : 'bg-red-50 border-red-200 text-red-700'}`}>
                        {insumo.stockDisponible}
                      </span>
                    </td>
                    
                    <td className="px-5 py-3 whitespace-nowrap text-center border-l border-gray-100 bg-gray-50/30">
                      <ControlesInstancia 
                         stockDisponible={insumo.stockDisponible}
                         netoDescontado={insumo.netoInstancia1}
                         onAction={(tipo, cant) => registrarMovimiento(insumo.id, tipo, cant, 1)}
                      />
                    </td>

                    <td className="px-5 py-3 whitespace-nowrap text-center border-l border-gray-100 bg-gray-50/30">
                      <ControlesInstancia 
                         stockDisponible={insumo.stockDisponible}
                         netoDescontado={insumo.netoInstancia2}
                         onAction={(tipo, cant) => registrarMovimiento(insumo.id, tipo, cant, 2)}
                      />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// Subcomponente individual para la instancia de retiro (Instancia 1 o 2)
function ControlesInstancia(
  { stockDisponible, netoDescontado, onAction }: 
  { stockDisponible: number, netoDescontado: number, onAction: (tipo: 'INGRESO'|'RETIRO', cant: number) => void }
) {
  const [valStr, setValStr] = useState("1");

  const handleRetirar = () => {
    const val = parseInt(valStr);
    if (isNaN(val) || val <= 0) return;
    if (val > stockDisponible) {
      alert(`Stock insuficiente. Solo quedan ${stockDisponible}.`);
      return;
    }
    // Descontar = RETIRO
    onAction('RETIRO', val);
    setValStr("1");
  };

  const handleDevolver = () => {
    const val = parseInt(valStr);
    if (isNaN(val) || val <= 0) return;
    // Agregar = INGRESO (devuelve al stock)
    onAction('INGRESO', val);
    setValStr("1");
  };

  return (
    <div className="flex flex-col items-center justify-center space-y-2">
      <div className="text-xs font-semibold text-gray-500">
        Neto extraído: <span className={netoDescontado > 0 ? "text-red-500" : "text-gray-500"}>{netoDescontado}</span>
      </div>
      
      <div className="flex items-center rounded-lg border border-gray-300 shadow-sm bg-white overflow-hidden focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500 transition-all">
        {/* Botón menos (RETIRO) */}
        <button 
          onClick={handleRetirar}
          className="px-3 py-1.5 text-red-500 hover:bg-red-50 font-bold transition-colors disabled:opacity-50"
          title="Descontar retiro del stock disponible"
          disabled={stockDisponible <= 0}
        >
          -
        </button>
        
        {/* Input Text central */}
        <input 
          type="number" 
          min="1" 
          value={valStr}
          onChange={(e) => setValStr(e.target.value)}
          className="w-12 text-center text-sm font-semibold border-x border-gray-200 outline-none text-gray-800 appearance-none py-1.5 p-0"
        />
        
        {/* Botón más (INGRESO / Corrección) */}
        <button 
          onClick={handleDevolver}
          className="px-3 py-1.5 text-green-600 hover:bg-green-50 font-bold transition-colors"
          title="Restaurar al stock disponible (Corrección)"
        >
          +
        </button>
      </div>
    </div>
  );
}
