"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { 
  startOfWeek, 
  endOfWeek, 
  addWeeks, 
  subWeeks, 
  format, 
  isWithinInterval,
  endOfMonth,
  startOfMonth,
  isSameWeek,
  parseISO,
  setHours,
  max,
  min,
  subDays,
  addDays,
  setDate,
  addMonths
} from 'date-fns';
import { es } from 'date-fns/locale';
import { ChevronLeft, ChevronRight, Search, AlertTriangle, Plus, Trash2 } from 'lucide-react';
import "@/app/ui/global/texts.css";

interface MovimientosMes {
  mes: number;
  anio: number;
  stockAjustado: number;
  stockModificable: number;
}

interface Insumo {
  id: string;
  codigo: string;
  nombre: string;
  stockOriginal: number;
  stockAnualRestante?: number;
  limiteProyectadoMes?: number;
  movimientosMes: MovimientosMes[];
}

interface Movimiento {
  id: string;
  idInsumo: string;
  fecha: string;
  balanceRetiros: number;
}

export default function ControlSemanalStock() {
  const [activeDate, setActiveDate] = useState<Date>(new Date());
  
  // Variables dependientes del activeDate
  const activeMonth = activeDate.getMonth();
  const activeYear = activeDate.getFullYear();

  // Aquí calculo cuándo empieza y termina la semana, pero ajustado a lunes (weekStartsOn: 1)
  const rawWeekStart = startOfWeek(activeDate, { weekStartsOn: 1 });
  const rawWeekEnd = endOfWeek(activeDate, { weekStartsOn: 1 });
  
  // Esto es clave: si la semana se pasa del mes, la corto para que solo me muestre días del mes actual
  const viewStart = max([rawWeekStart, startOfMonth(activeDate)]);
  const viewEnd = min([rawWeekEnd, endOfMonth(activeDate)]);

  const [insumos, setInsumos] = useState<Insumo[]>([]);
  const [movimientos, setMovimientos] = useState<Movimiento[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [mesDesbloqueado, setMesDesbloqueado] = useState(false);
  const [addingDay, setAddingDay] = useState(false);
  
  // Custom manual dates added by user contextually in the current week view
  const [manualFechas, setManualFechas] = useState<string[]>([]);
  
  const [loading, setLoading] = useState(true);

// Función central para traer todo: insumos, sus movimientos y si el mes está bloqueado
// Le puse un 'silent' para que cuando se registre algo rápido no se vea el "Cargando..." y parezca instantáneo
  const fetchDatos = async (silent = false) => {
    if (!silent) setLoading(true); 
    try {
      const [resInsumos, resMovs, resCtrl] = await Promise.all([
        fetch(`/api/insumos?mes=${activeMonth + 1}&anio=${activeYear}`).then(res => res.json()),
        fetch('/api/movimientos').then(res => res.json()),
        fetch(`/api/control-mes?mes=${activeMonth + 1}&anio=${activeYear}`).then(res => res.json())
      ]);
      if (Array.isArray(resInsumos)) setInsumos(resInsumos);
      if (Array.isArray(resMovs)) setMovimientos(resMovs);
      if (resCtrl) setMesDesbloqueado(!!resCtrl.desbloqueado);
    } catch (e) {
      console.error("Uff, falló la carga de datos:", e);
    } finally {
      if (!silent) setLoading(false);
    }
  };

  useEffect(() => {
    fetchDatos();
  }, [activeMonth, activeYear]); // Recargamos si se cambia de mes/año. Si cambian de día dentro del mes los datos de BD siguen siendo aptos.

  const handlePrevWeek = () => setActiveDate(subDays(viewStart, 1));
  const handleNextWeek = () => setActiveDate(addDays(viewEnd, 1));
  
  const handleJumpToWeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.value) {
      const date = parseISO(e.target.value);
      if (!isNaN(date.getTime())) {
        setActiveDate(date);
      }
    }
  };

  // Esta magia agrupa todas las fechas que tienen algún movimiento o que yo creé manualmente
  // Así la tabla solo muestra las columnas de los días que me interesan en esta semana
  const fechasRetiro = useMemo(() => {
    const uniqueDates = new Set<string>();
    
    // Primero veo qué días ya tienen registros en la base de datos
    movimientos.forEach(m => {
       const movDate = new Date(m.fecha);
       if(isWithinInterval(movDate, { start: viewStart, end: viewEnd })) {
          uniqueDates.add(format(movDate, 'yyyy-MM-dd'));
       }
    });

    // Luego sumo los días que agregué con el botón "Crear Día de Retiro"
    manualFechas.forEach(f => {
       const dateVal = parseISO(f);
       if(isWithinInterval(dateVal, { start: viewStart, end: viewEnd })) {
          uniqueDates.add(f);
       }
    });

    return Array.from(uniqueDates).sort();
  }, [movimientos, viewStart, viewEnd, manualFechas]);


  // Regla importante: Pasado el día 5 del mes siguiente, el mes se "cierra" automáticamente
  // A menos que un jefe lo desbloquee manualmente
  const deadline = setDate(addMonths(new Date(activeYear, activeMonth, 1), 1), 6);
  const isMesCerrado = (new Date() > deadline) && !mesDesbloqueado;

  const crearDiaRetiro = () => {
     if (isMesCerrado) return alert("Cerrado: El mes ya está bloqueado contablemente. No se puede tocar.");
     
     // Uso el día de hoy para abrir una nueva columna rápidamente
     const hoyStr = format(new Date(), 'yyyy-MM-dd');
     
     if (!isWithinInterval(new Date(), { start: viewStart, end: viewEnd })) {
        alert("Ojo: Estás agregando el día de HOY pero no estás viendo la semana actual.");
     }

     if (!fechasRetiro.includes(hoyStr)) {
        setManualFechas(prev => [...prev, hoyStr]);
     }
  };

  const eliminarDia = async (fechaStr: string) => {
     if (isMesCerrado) return alert("Mes cerrado.");
     if(!window.confirm(`¿Confirma la eliminación permanente de todos los registros vinculados a la fecha ${fechaStr}? Esta acción procederá a recalcular los saldos totales automáticamente.`)) {
        return;
     }
     
     try {
       const res = await fetch(`/api/movimientos/dia?fecha=${fechaStr}`, {
          method: 'DELETE'
       });
       if(res.ok) {
          // Removemos el día de las vistas manuales si existiera
          setManualFechas(prev => prev.filter(f => f !== fechaStr));
          fetchDatos(); // refrescar
       } else {
          alert('Se produjo un error interno al intentar eliminar la fecha solicitada.');
       }
     } catch (e) {
       console.error(e);
       alert('Error de red al contactar con el sistema.');
     }
  };

  // Cálculo para saber cuánto puedo sacar este mes.
  // Si no hay movimientos registrados, asumo la cuota estándar (Total / 12)
  const getStockDisponible = (insumo: Insumo) => {
    let rawDisp = 0;
    if (insumo.movimientosMes && insumo.movimientosMes.length > 0) {
      rawDisp = insumo.movimientosMes[0].stockModificable;
    } else {
      rawDisp = insumo.limiteProyectadoMes || Math.floor(insumo.stockOriginal / 12);
    }
    
    // Pero ojo: nunca puedo sacar más de lo que queda en bodega real (Stock Anual)
    const ar = getStockAnualRestante(insumo);
    if (ar <= 0) return 0;
    return Math.min(rawDisp, ar);
  };

  const getStockAnualRestante = (insumo: Insumo) => {
    return insumo.stockAnualRestante ?? insumo.stockOriginal;
  };

  const insumosProcesados = insumos.map(ins => {
    return {
      ...ins,
      stockDisponible: getStockDisponible(ins),
      stockAnualRestante: getStockAnualRestante(ins)
    };
  }).filter(ins => {
    const q = searchQuery.toLowerCase();
    return ins.nombre.toLowerCase().includes(q) || ins.codigo.toLowerCase().includes(q);
  });

  const endOfCurrentMonth = endOfMonth(activeDate);
  const isLastWeekOfMonth = isSameWeek(viewStart, endOfCurrentMonth, { weekStartsOn: 1 });
  const insumosAlerta = isLastWeekOfMonth ? insumosProcesados.filter(ins => ins.stockDisponible > 0) : [];
const registrarMovimiento = async (insumoId: string, tipo: 'INGRESO'|'RETIRO', cantidad: number, fechaStr: string) => {
    if (cantidad <= 0 || isNaN(cantidad)) return;

    const balanceRetiros = tipo === 'INGRESO' ? cantidad : -cantidad;
    const targetDate = setHours(parseISO(fechaStr), 12); 

    // --- 1. RESPALDO POR SI ACASO ---
    // Si la red se cae, así puedo volver al estado anterior sin recargar página
    const previousInsumos = [...insumos];
    const previousMovimientos = [...movimientos];

    // --- 2. ACTUALIZACIÓN "OPTIMISTA" ---
    // Esto hace que el número cambie al segundo en que hice clic, sin esperar al servidor
    // Hace que la app se sienta súper rápida
    setMovimientos(prev => [...prev, {
      id: `temp-${Date.now()}`, 
      idInsumo: insumoId,
      fecha: targetDate.toISOString(),
      balanceRetiros: balanceRetiros
    }]);

    setInsumos(prev => prev.map(ins => {
      if (ins.id === insumoId) {
        const nuevoStockAnual = (ins.stockAnualRestante ?? ins.stockOriginal) + balanceRetiros;
        const nuevosMovimientosMes = [...ins.movimientosMes];
        
        if (nuevosMovimientosMes.length > 0) {
          nuevosMovimientosMes[0] = {
            ...nuevosMovimientosMes[0],
            stockModificable: nuevosMovimientosMes[0].stockModificable + balanceRetiros
          };
        }

        return { ...ins, stockAnualRestante: nuevoStockAnual, movimientosMes: nuevosMovimientosMes };
      }
      return ins;
    }));

    // --- 3. ENVÍO REAL AL SERVIDOR ---
    try {
      const resp = await fetch('/api/movimientos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          idInsumo: insumoId,
          balanceRetiros,
          fecha: targetDate.toISOString() 
        })
      });

      if (resp.ok) {
        // Todo salió bien, actualizo en silencio para tener los IDs reales de la DB
        fetchDatos(true); 
      } else {
        // ¡ERROR EN SERVIDOR! Revierto los números para no engañar al usuario
        setInsumos(previousInsumos);
        setMovimientos(previousMovimientos);
        const errorData = await resp.json();
        alert(errorData.error || "Upps, algo salió mal en el servidor.");
      }
    } catch (error) {
      // ¡ERROR DE RED! Revierto todo
      console.error(error);
      setInsumos(previousInsumos);
      setMovimientos(previousMovimientos);
      alert("Se cortó la conexión. Intenté guardar pero no se pudo.");
    }
  };

  return (
    <div className="w-full h-full bg-white rounded-lg shadow-sm p-6 border border-gray-100 ring-1 ring-gray-900/5">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-8 gap-4 border-b pb-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-gray-900 text-transparent bg-clip-text">Gestión del Número de Insumos</h2>
          <p className="text-gray-500 mt-1  subtitle2-responsive ">Registre días de retiro de forma dinámica (+ o -) en la semana deseada.</p>
        </div>
        
        <div className="flex flex-wrap items-center gap-2 bg-gray-50 border border-gray-200 p-2 rounded-xl shadow-sm">
          <button 
            onClick={handlePrevWeek} 
            className="p-2 hover:bg-white hover:text-emerald-600 rounded-lg transition-all focus:outline-none"
            aria-label="Semana Anterior"
          >
            <ChevronLeft size={20}/>
          </button>
          <div className="text-sm font-semibold text-gray-700 px-3 whitespace-nowrap capitalize">
            {format(viewStart, 'dd MMM', { locale: es })} — {format(viewEnd, 'dd MMM, yyyy', { locale: es })}
          </div>
          <button 
            onClick={handleNextWeek} 
            className="p-2 hover:bg-white hover:text-emerald-600 rounded-lg transition-all focus:outline-none"
            aria-label="Semana Siguiente"
          >
            <ChevronRight size={20}/>
          </button>
          <div className="h-6 w-px bg-gray-300 mx-1 hidden sm:block"></div>
          <input 
            type="date" 
            title="Buscar fecha"
            className="text-sm text-gray-600 border-none bg-transparent rounded-lg py-1 px-2 focus:ring-2 focus:ring-emerald-500 hover:bg-gray-100 transition-colors cursor-pointer w-full sm:w-auto"
            onChange={handleJumpToWeek}
          />
        </div>
      </div>

      <div className="flex justify-between flex-wrap gap-4 mb-6">
        <div className="relative bg-gray-50/50 p-3 rounded-xl border border-gray-100 w-full max-w-sm">
          <div className="absolute inset-y-0 left-0 pl-6 flex items-center pointer-events-none text-gray-400">
            <Search className="h-5 w-5" />
          </div>
          <input
            type="text"
            className="block w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg leading-5 bg-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm shadow-sm transition-shadow"
            placeholder="Buscar por código o nombre..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        <button 
          onClick={crearDiaRetiro}
          className="flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-2 px-4 rounded-xl shadow-sm transition-all"
        >
          <Plus className="h-5 w-5" />
          Crear Día de Retiro
        </button>
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

      {isMesCerrado && (
        <div className="mb-8 p-5 rounded-xl border border-red-200 bg-red-50 text-red-900 shadow-sm flex flex-col sm:flex-row gap-4 items-center justify-between">
          <div>
             <div className="flex items-center gap-2 font-bold text-red-700 text-lg">
                <AlertTriangle className="h-6 w-6 text-red-600" />
                Mes Contable Cerrado
             </div>
             <p className="text-sm mt-1">Se ha superado el plazo normativo de edición mensual. Los registros han sido auditados y el mes actual se encuentra inhabilitado por seguridad.</p>
          </div>
          <button 
             onClick={async () => {
                if(!window.confirm("Se recomienda discreción al alterar registros auditados. ¿Confirma la reactivación administrativa de este período?")) return;
                await fetch("/api/control-mes", { method: "POST", headers: {"Content-Type": "application/json"}, body: JSON.stringify({ mes: activeMonth+1, anio: activeYear, desbloqueado: true })});
                fetchDatos();
             }}
             className="bg-red-600 hover:bg-red-700 text-white font-medium px-4 py-2 rounded-lg"
          >
             Desbloquear Edición
          </button>
        </div>
      )}

      <div className="overflow-hidden bg-white border border-gray-200 rounded-xl shadow-sm">
        <div className="overflow-x-auto min-h-[400px]">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-[#f8fafc]">
              <tr>
                <th scope="col" className="px-5 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider w-20">Código</th>
                <th scope="col" className="px-5 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Insumo</th>
                <th scope="col" className="px-5 py-4 text-center text-xs font-semibold text-slate-600 uppercase tracking-wider w-32 leading-tight">Total<br/>Anual</th>
                <th scope="col" className="px-5 py-4 text-center text-xs font-semibold text-slate-600 uppercase tracking-wider w-32 leading-tight">Cuota<br/>Mensual</th>
                
         {fechasRetiro.length === 0 ? (
  // El mensaje que se muestra si no hay fechas
  <th scope="col" className="px-3 py-3 text-center text-gray-400 bg-gray-50 italic font-normal min-w-[140px]">
    No hay retiros en la semana seleccionada
  </th>
) : (
  // Tu map original que se ejecuta si sí hay fechas
  fechasRetiro.map((fecha) => (
    <th key={fecha} scope="col" className="px-3 py-3 text-center border-l border-gray-200 bg-emerald-50/20 min-w-[140px]">
      <div className="flex flex-col items-center justify-center space-y-1">
        <span className="text-xs font-semibold text-slate-700 uppercase tracking-wider bg-white px-2 py-1 rounded shadow-sm">
          {format(parseISO(fecha), 'EEEE dd', { locale: es })}
        </span>
        <button 
          onClick={() => eliminarDia(fecha)}
          className="text-red-500/70 hover:text-red-600 transition-colors p-1"
          title={`Eliminar registros del ${fecha}`}
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
    </th>
  ))
)}

              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan={10} className="text-center py-12 text-sm text-gray-500">
                    <div className="flex justify-center items-center gap-2">
                       <svg className="animate-spin h-5 w-5 text-emerald-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                       Sincronizando...
                    </div>
                  </td>
                </tr>
              ) : insumosProcesados.length === 0 ? (
                <tr><td colSpan={10} className="text-center py-12 text-gray-400 text-sm">No se encontraron insumos.</td></tr>
              ) : (
                insumosProcesados.map(insumo => (
                  <tr key={insumo.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-5 py-4 whitespace-nowrap text-sm font-semibold text-gray-800">{insumo.codigo}</td>
                    <td className="px-5 py-4 whitespace-nowrap text-sm text-gray-600">{insumo.nombre}</td>
                    
                    <td className="px-5 py-4 whitespace-nowrap text-center">
                       <div className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold">Total: {insumo.stockOriginal}</div>
                       <div className={`mt-0.5 text-sm font-bold ${insumo.stockAnualRestante <= 0 ? 'text-red-600' : 'text-gray-800'}`}>Quedan: {insumo.stockAnualRestante}</div>
                    </td>
                    
                    <td className="px-5 py-4 whitespace-nowrap text-center">
                       <div className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold">Stock base: {insumo.limiteProyectadoMes || Math.floor(insumo.stockOriginal / 12)}</div>
                       <div className={`mt-0.5 text-sm font-bold ${insumo.stockDisponible < 0 ? 'text-red-600' : 'text-emerald-700'}`}>Quedan: {insumo.stockDisponible}</div>
                    </td>
                    
                    {fechasRetiro.map(fecha => {
                       // Extraer suma neta de operaciones de este insumo en este día
                       const movsDeEsteDia = movimientos.filter(m => 
                          m.idInsumo === insumo.id && 
                          format(new Date(m.fecha), 'yyyy-MM-dd') === fecha
                       );
                       const netoDescontado = movsDeEsteDia.reduce((acc, m) => acc + m.balanceRetiros, 0);

                       return (
                         <td key={`${insumo.id}-${fecha}`} className="px-3 py-3 whitespace-nowrap text-center border-l border-gray-100 bg-gray-50/20">
                           <ControlesInstancia 
                              stockAnualRestante={insumo.stockAnualRestante}
                              netoDescontado={netoDescontado}
                              isLocked={isMesCerrado}
                              onAction={(tipo, cant) => registrarMovimiento(insumo.id, tipo, cant, fecha)}
                           />
                         </td>
                       );
                    })}

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

// Subcomponente individual para la instancia de retiro
function ControlesInstancia(
  { stockAnualRestante, netoDescontado, isLocked, onAction }: 
  { stockAnualRestante: number, netoDescontado: number, isLocked: boolean, onAction: (tipo: 'INGRESO'|'RETIRO', cant: number) => void }
) {
  const [valStr, setValStr] = useState("1");

  const handleRetirar = () => {
    const val = parseInt(valStr);
    if (isNaN(val) || val <= 0) return;
    if (val > stockAnualRestante) {
      alert(`Operación inválida: El balance físico anual restante es insuficiente (${stockAnualRestante} unidades).`);
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
      <div className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">
        Neto Día: <span className={netoDescontado < 0 ? "text-red-500" : (netoDescontado > 0 ? "text-green-500" : "text-gray-500")}>{Math.abs(netoDescontado)} {netoDescontado < 0 ? "Retirado" : (netoDescontado > 0 ? "Devuelto" : "")}</span>
      </div>
      
      <div className="flex items-center rounded-lg border border-gray-300 shadow-sm bg-white overflow-hidden focus-within:ring-2 focus-within:ring-emerald-500 focus-within:border-emerald-500 transition-all w-24">
        <button 
          onClick={handleRetirar}
          className="w-1/3 py-1 text-red-500 hover:bg-red-50 font-bold transition-colors disabled:opacity-30 disabled:bg-gray-100 text-sm"
          title="Descontar retiro del stock disponible"
          disabled={stockAnualRestante <= 0 || isLocked}
        >
          -
        </button>
        
        <input 
          type="number" 
          min="1" 
          disabled={isLocked}
          value={valStr}
          onChange={(e) => setValStr(e.target.value)}
          className="w-1/3 text-center text-xs font-semibold border-x border-gray-200 outline-none text-gray-800 appearance-none py-1 p-0 disabled:bg-gray-100 disabled:opacity-50"
        />
        
        <button 
          onClick={handleDevolver}
          disabled={isLocked}
          className="w-1/3 py-1 text-green-600 hover:bg-green-50 font-bold transition-colors text-sm disabled:opacity-30 disabled:bg-gray-100"
          title="Restaurar al stock disponible (Corrección)"
        >
          +
        </button>
      </div>
    </div>
  );
}
