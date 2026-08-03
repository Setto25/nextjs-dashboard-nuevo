'use client';

import { useState, useEffect } from 'react';
import {
  ShieldAlert,
  Search,
  Filter,
  RefreshCw,
  MapPin,
  Link2,
  Clock,
  User,
  Activity,
  Globe,
  Database,
  Calendar,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { toast } from 'react-toastify';
import { formatDistanceToNow, format } from 'date-fns';
import { es } from 'date-fns/locale';

interface AuditLog {
  id: string;
  fecha: string;
  userId: number | null;
  rut: string | null;
  nombre: string | null;
  email: string | null;
  accion: string;
  modulo: string;
  detalles: string | null;
  ip: string | null;
}

export default function AuditoriaPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [accionFiltro, setAccionFiltro] = useState('');
  const [limite, setLimite] = useState(100);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // Estadísticas calculadas
  const [stats, setStats] = useState({
    totalLogins: 0,
    totalNavegacion: 0,
    usuariosUnicos: 0,
    ultimoAcceso: 'Sin datos',
  });

  const fetchLogs = async (silencioso = false) => {
    if (!silencioso) setLoading(true);
    try {
      const params = new URLSearchParams({
        q: search,
        accion: accionFiltro,
        limite: limite.toString(),
      });
      const res = await fetch(`/api/admin/auditoria?${params.toString()}`);
      if (!res.ok) {
        if (res.status === 403) {
          toast.error('Acceso denegado. Se requieren permisos de administrador.');
          return;
        }
        throw new Error('Error al cargar la bitácora');
      }
      const data: AuditLog[] = await res.json();
      setLogs(data);

      // Calcular estadísticas dinámicamente basadas en el lote actual
      const logins = data.filter((l) => l.accion === 'INICIO_SESION').length;
      const navs = data.filter((l) => l.accion === 'ACCESO_PAGINA').length;
      const emailsUnicos = new Set(data.map((l) => l.email).filter(Boolean)).size;
      const ultimo = data[0]
        ? formatDistanceToNow(new Date(data[0].fecha), { addSuffix: true, locale: es })
        : 'Sin datos';

      setStats({
        totalLogins: logins,
        totalNavegacion: navs,
        usuariosUnicos: emailsUnicos,
        ultimoAcceso: ultimo,
      });
    } catch (error) {
      console.error(error);
      toast.error('Error al conectar con el servidor de auditoría.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [accionFiltro, limite]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchLogs();
  };

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const parseDetalles = (detallesStr: string | null) => {
    if (!detallesStr) return {};
    try {
      return JSON.parse(detallesStr);
    } catch (e) {
      return { crudo: detallesStr };
    }
  };

  // Formatear rutas del dashboard para mostrar nombres más amigables
  const parseRuta = (ruta: string) => {
    if (ruta === '/dashboard') return 'Inicio (Home)';
    if (ruta.startsWith('/dashboard/insumos')) return 'Gestión de Insumos';
    if (ruta.startsWith('/dashboard/protocolos')) return 'Protocolos';
    if (ruta.startsWith('/dashboard/plantillas')) return 'Plantillas y Formatos';
    if (ruta.startsWith('/dashboard/biblioteca/libros')) return 'Biblioteca: Libros';
    if (ruta.startsWith('/dashboard/biblioteca/manuales')) return 'Biblioteca: Manuales';
    if (ruta.startsWith('/dashboard/capacitacion')) return 'Capacitación';
    if (ruta.startsWith('/dashboard/admin')) return 'Gestión de Recursos';
    if (ruta.startsWith('/dashboard/usuario')) return 'Mi Perfil';
    return ruta;
  };

  return (
    <div className="space-y-8 animate-fade-in pb-16">
      {/* Encabezado Glassmorphic Premium */}
      <div className="relative overflow-hidden rounded-3xl bg-white/[0.07] backdrop-blur-md border border-white/10 p-6 md:p-8 shadow-2xl transition-all duration-300">
        <div className="absolute -right-24 -top-24 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl" />
        <div className="absolute -left-24 -bottom-24 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />

        <div className="relative flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-emerald-500/15 text-emerald-400 rounded-2xl ring-1 ring-emerald-400/30">
                <ShieldAlert className="w-8 h-8" />
              </div>
              <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">
                Auditoría de Actividades
              </h1>
            </div>
            <p className="mt-2 text-slate-600 text-sm md:text-base max-w-2xl font-medium">
              Bitácora de seguridad en tiempo real. Monitorea accesos, inicios de sesión y flujos de navegación para auditorías.
            </p>
          </div>
          <button
            onClick={() => fetchLogs()}
            disabled={loading}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-800 text-white font-semibold text-sm shadow-lg hover:bg-slate-700 active:scale-95 disabled:opacity-50 transition-all duration-200"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Actualizar registros
          </button>
        </div>
      </div>

      {/* Tarjetas de Estadísticas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1 */}
        <div className="bg-white/70 backdrop-blur-sm border border-slate-200/50 rounded-2xl p-5 shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
          <div className="flex justify-between items-start">
            <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Inicios de Sesión</p>
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
              <Globe className="w-5 h-5" />
            </div>
          </div>
          <p className="text-3xl font-black text-slate-800 mt-2">{stats.totalLogins}</p>
          <p className="text-xs text-slate-400 mt-1.5 font-medium">Logins registrados hoy</p>
        </div>

        {/* Card 2 */}
        <div className="bg-white/70 backdrop-blur-sm border border-slate-200/50 rounded-2xl p-5 shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
          <div className="flex justify-between items-start">
            <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Páginas Vistas</p>
            <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
              <Activity className="w-5 h-5" />
            </div>
          </div>
          <p className="text-3xl font-black text-slate-800 mt-2">{stats.totalNavegacion}</p>
          <p className="text-xs text-slate-400 mt-1.5 font-medium">Accesos a módulos</p>
        </div>

        {/* Card 3 */}
        <div className="bg-white/70 backdrop-blur-sm border border-slate-200/50 rounded-2xl p-5 shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
          <div className="flex justify-between items-start">
            <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Usuarios Activos</p>
            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
              <User className="w-5 h-5" />
            </div>
          </div>
          <p className="text-3xl font-black text-slate-800 mt-2">{stats.usuariosUnicos}</p>
          <p className="text-xs text-slate-400 mt-1.5 font-medium">Distintos e-mails</p>
        </div>

        {/* Card 4 */}
        <div className="bg-white/70 backdrop-blur-sm border border-slate-200/50 rounded-2xl p-5 shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
          <div className="flex justify-between items-start">
            <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Última Actividad</p>
            <div className="p-2 bg-amber-50 text-amber-600 rounded-xl">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <p className="text-lg font-bold text-slate-800 mt-3 truncate">{stats.ultimoAcceso}</p>
          <p className="text-xs text-slate-400 mt-2 font-medium">Último evento recibido</p>
        </div>
      </div>

      {/* Controles de Búsqueda y Filtros */}
      <div className="bg-white/80 border border-slate-200/60 rounded-3xl p-5 shadow-lg space-y-4">
        <form onSubmit={handleSearchSubmit} className="flex flex-col md:flex-row gap-3">
          <div className="flex-grow relative">
            <Search className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar por RUT, usuario, email, detalles..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all font-medium"
            />
          </div>
          <div className="flex flex-wrap md:flex-nowrap gap-2">
            {/* Filtro Accion */}
            <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 min-w-[160px]">
              <Filter className="w-4 h-4 text-slate-400" />
              <select
                value={accionFiltro}
                onChange={(e) => setAccionFiltro(e.target.value)}
                className="bg-transparent text-xs font-semibold text-slate-700 focus:outline-none cursor-pointer w-full"
              >
                <option value="">Todos los eventos</option>
                <option value="INICIO_SESION">Inicios de Sesión</option>
                <option value="ACCESO_PAGINA">Navegación</option>
              </select>
            </div>

            {/* Filtro Límite */}
            <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5">
              <Database className="w-4 h-4 text-slate-400" />
              <select
                value={limite}
                onChange={(e) => setLimite(Number(e.target.value))}
                className="bg-transparent text-xs font-semibold text-slate-700 focus:outline-none cursor-pointer"
              >
                <option value="50">50 filas</option>
                <option value="100">100 filas</option>
                <option value="200">200 filas</option>
                <option value="500">500 filas</option>
              </select>
            </div>

            <button
              type="submit"
              className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs rounded-xl shadow-md transition-all active:scale-95"
            >
              Buscar
            </button>
          </div>
        </form>
      </div>

      {/* Tabla de Logs */}
      <div className="bg-white border border-slate-200 rounded-3xl shadow-xl overflow-hidden">
        {loading ? (
          <div className="flex flex-col justify-center items-center py-20 gap-4 text-slate-500">
            <RefreshCw className="w-10 h-10 animate-spin text-emerald-500" />
            <p className="font-semibold text-sm">Consultando bitácora de seguridad...</p>
          </div>
        ) : logs.length === 0 ? (
          <div className="flex flex-col justify-center items-center py-20 text-slate-500">
            <ShieldAlert className="w-12 h-12 text-slate-300 mb-2" />
            <p className="font-bold text-base text-slate-700">No se encontraron registros</p>
            <p className="text-xs text-slate-400 mt-1">Prueba refinando la búsqueda o cambiando los filtros.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 text-[11px] font-bold uppercase tracking-wider">
                  <th className="px-6 py-4">Usuario</th>
                  <th className="px-6 py-4">Evento / Módulo</th>
                  <th className="px-6 py-4">Detalles del Acceso</th>
                  <th className="px-6 py-4">Ubicación & IP</th>
                  <th className="px-6 py-4 text-right">Fecha / Hora</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {logs.map((log) => {
                  const isExpanded = expandedId === log.id;
                  const det = parseDetalles(log.detalles);
                  const esLogin = log.accion === 'INICIO_SESION';

                  return (
                    <tr
                      key={log.id}
                      onClick={() => toggleExpand(log.id)}
                      className={`hover:bg-slate-50/80 transition-colors duration-150 cursor-pointer ${isExpanded ? 'bg-slate-50/50' : ''
                        }`}
                    >
                      {/* Usuario */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-full ${esLogin ? 'bg-emerald-50 text-emerald-600' : 'bg-blue-50 text-blue-600'}`}>
                            <User className="w-4 h-4" />
                          </div>
                          <div>
                            <p className="text-sm font-bold text-slate-800">
                              {log.nombre || 'Usuario Desconocido'}
                            </p>
                            <p className="text-[11px] font-semibold text-slate-400 mt-0.5">
                              {log.email || 'N/A'} • RUT: {log.rut || 'N/A'}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Evento */}
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${esLogin
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-200/50'
                              : 'bg-blue-100 text-blue-800 border border-blue-200/50'
                            }`}
                        >
                          {esLogin ? 'Inicio de Sesión' : 'Acceso Página'}
                        </span>
                        <p className="text-[10px] font-semibold text-slate-400 mt-1 uppercase tracking-wider">
                          Módulo: {log.modulo}
                        </p>
                      </td>

                      {/* Detalles */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1.5 text-xs font-medium text-slate-700">
                          {esLogin ? (
                            <>
                              <Globe className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                              <span className="truncate max-w-[250px]">
                                {det.ubicacion || 'Desarrollo Local'}
                              </span>
                            </>
                          ) : (
                            <>
                              <Link2 className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                              <span className="font-semibold text-slate-800 bg-slate-100 px-2 py-0.5 rounded text-[11px] truncate max-w-[250px]">
                                {parseRuta(det.ruta || '')}
                              </span>
                            </>
                          )}
                        </div>
                        {isExpanded && (
                          <div className="mt-3 p-3 bg-slate-900 text-emerald-400 rounded-xl text-[11px] font-mono shadow-inner border border-slate-800 overflow-x-auto max-w-[400px]">
                            <pre>{JSON.stringify(det, null, 2)}</pre>
                          </div>
                        )}
                      </td>

                      {/* Ubicación & IP */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1.5">
                          <MapPin className="w-3.5 h-3.5 text-slate-400" />
                          <span className="text-xs font-semibold text-slate-600">
                            {det.ubicacion || 'Desarrollo Local'}
                          </span>
                        </div>
                        <p className="text-[10px] font-medium text-slate-400 mt-1">
                          IP: {log.ip || '127.0.0.1'}
                        </p>
                      </td>

                      {/* Fecha / Hora */}
                      <td className="px-6 py-4 text-right">
                        <p className="text-xs font-bold text-slate-800">
                          {formatDistanceToNow(new Date(log.fecha), { addSuffix: true, locale: es })}
                        </p>
                        <p className="text-[10px] font-medium text-slate-400 mt-1">
                          {format(new Date(log.fecha), "dd 'de' MMMM, HH:mm:ss", { locale: es })}
                        </p>
                        <div className="inline-flex items-center gap-0.5 text-[10px] text-emerald-500 font-bold hover:underline mt-1">
                          {isExpanded ? (
                            <>
                              Ocultar <ChevronUp className="w-3 h-3" />
                            </>
                          ) : (
                            <>
                              Detalles <ChevronDown className="w-3 h-3" />
                            </>
                          )}
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
  );
}
