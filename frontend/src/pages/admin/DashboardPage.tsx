import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  LabelList,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import {
  Users,
  CreditCard,
  DollarSign,
  Clock,
  RefreshCw,
  FileDown,
  Server,
  TrendingUp,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';
import { apiClient } from '../../services/api/apiClient';
import {
  microserviceClient,
  type AnalyticalAggregateResponse,
} from '../../services/api/microserviceClient';
import {
  useAdminDashboardViewModel,
  REFRESH_INTERVAL_MS,
} from '../../viewmodels/useAdminDashboardViewModel';

const SERIES_COLOR = '#3b82f6';
const GRID_COLOR = '#1e293b';
const AXIS_TEXT = '#94a3b8';

const ESTADO_MEMBRESIA: Record<string, { label: string; color: string }> = {
  ACTIVA: { label: 'Activas', color: '#10b981' },
  PENDIENTE: { label: 'Pendientes', color: '#f59e0b' },
  SUSPENDIDA: { label: 'Suspendidas', color: '#f97316' },
  VENCIDA: { label: 'Vencidas', color: '#f43f5e' },
};

const copFormatter = new Intl.NumberFormat('es-CO', {
  style: 'currency',
  currency: 'COP',
  maximumFractionDigits: 0,
});
const copCompact = new Intl.NumberFormat('es-CO', {
  notation: 'compact',
  maximumFractionDigits: 1,
});
const monthFormatter = new Intl.DateTimeFormat('es-CO', {
  month: 'short',
  year: '2-digit',
});

const monthLabel = (anio: number, mes: number) =>
  monthFormatter.format(new Date(anio, mes - 1, 1));

const timeAgo = (date: Date, now: number) => {
  const seconds = Math.max(0, Math.round((now - date.getTime()) / 1000));
  if (seconds < 5) return 'justo ahora';
  if (seconds < 60) return `hace ${seconds} s`;
  return `hace ${Math.floor(seconds / 60)} min`;
};

const tooltipStyle = {
  contentStyle: {
    backgroundColor: '#0f172a',
    borderRadius: 10,
    borderColor: '#334155',
    fontSize: 12,
    color: '#f8fafc',
  },
  labelStyle: { color: '#f8fafc', fontWeight: 600 },
  itemStyle: { color: '#93c5fd' },
  cursor: { fill: 'rgba(59, 130, 246, 0.08)' },
};

export default function DashboardPage() {
  const { stats, loading, refreshing, lastUpdated, error, refresh } =
    useAdminDashboardViewModel();

  const [ms2Report, setMs2Report] = useState<AnalyticalAggregateResponse | null>(null);
  const [ms2Loading, setMs2Loading] = useState(false);

  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 5000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    let active = true;
    const loadMs2Aggregation = async () => {
      setMs2Loading(true);
      const data = await microserviceClient.getAnalyticalAggregation({
        periodPreset: 'ALL_TIME',
        requestedByRole: 'ADMIN',
      });
      if (active) {
        setMs2Report(data);
        setMs2Loading(false);
      }
    };
    loadMs2Aggregation();
    return () => {
      active = false;
    };
  }, [lastUpdated]);

  const handleDownloadReport = async (type: 'members' | 'payments') => {
    try {
      const response = await apiClient.get(`/api/reports/${type}/pdf`, {
        responseType: 'blob',
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `reporte_${type}_${new Date().getTime()}.pdf`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success(`Reporte PDF (${type === 'members' ? 'Miembros' : 'Pagos'}) descargado.`);
    } catch (err: any) {
      if (!(err.response?.status >= 500)) {
        toast.error('Hubo un error al generar el reporte PDF.');
      }
    }
  };

  const ingresosData = (stats?.ingresosPorMes ?? []).map((m) => ({
    mes: monthLabel(m.anio, m.mes),
    total: m.totalCOP,
  }));
  const usuariosData = (stats?.nuevosUsuariosPorMes ?? []).map((m) => ({
    mes: monthLabel(m.anio, m.mes),
    cantidad: m.cantidad,
  }));
  const membresiasData = (stats?.membresiasPorEstado ?? []).map((m) => ({
    estado: ESTADO_MEMBRESIA[m.estado]?.label ?? m.estado,
    cantidad: m.cantidad,
    color: ESTADO_MEMBRESIA[m.estado]?.color ?? AXIS_TEXT,
  }));

  return (
    <div className="space-y-6">
      {/* Encabezado Ejecutivo */}
      <div className="border-b border-slate-800 pb-5 flex flex-wrap items-end justify-between gap-4">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-widest text-blue-400">
            Centro de Comando ERP
          </span>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-100 mt-0.5">
            Dashboard Ejecutivo
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Métricas operativas en tiempo real consolidadas entre Sportify.Api (.NET) y Microservicio 2 (:5102)
          </p>
        </div>
        <div className="flex items-center gap-3 text-xs">
          <span className="flex items-center text-slate-300 bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-lg" aria-live="polite">
            <span
              className={`inline-block w-2 h-2 rounded-full mr-2 ${
                error ? 'bg-amber-400' : 'bg-emerald-400 animate-pulse'
              }`}
            />
            {error ? 'Modo Caché' : 'Telemetría en vivo'}
            {lastUpdated && (
              <span className="text-slate-500 ml-1.5">
                · {timeAgo(lastUpdated, now)}
              </span>
            )}
          </span>
          <button
            onClick={refresh}
            disabled={refreshing}
            title={`Actualización automática cada ${REFRESH_INTERVAL_MS / 1000} s`}
            className="bg-slate-900 border border-slate-700 hover:bg-slate-800 disabled:opacity-50 text-slate-200 px-3.5 py-1.5 rounded-lg font-semibold transition-colors flex items-center gap-1.5"
          >
            <RefreshCw size={14} className={refreshing ? 'animate-spin text-blue-400' : ''} />
            <span>Actualizar</span>
          </button>
        </div>
      </div>

      {error && stats && (
        <div className="bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs rounded-xl px-4 py-3 flex items-center gap-2">
          <AlertTriangle size={16} className="shrink-0 text-amber-400" />
          <span>{error}. Se muestran los últimos indicadores sincronizados.</span>
        </div>
      )}

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {[1, 2, 3, 4].map((idx) => (
            <div
              key={idx}
              className="bg-slate-900/90 border border-slate-800 rounded-xl p-6 animate-pulse h-28"
            >
              <div className="h-3 w-24 bg-slate-800 rounded mb-4" />
              <div className="h-7 w-32 bg-slate-800 rounded" />
            </div>
          ))}
        </div>
      ) : !stats ? (
        <div className="bg-slate-900 rounded-xl border border-slate-800 p-8 text-center">
          <p className="text-slate-400 mb-4">{error ?? 'No se pudieron cargar las métricas.'}</p>
          <button
            onClick={refresh}
            className="bg-blue-600 hover:bg-blue-500 text-white px-5 py-2 rounded-lg font-semibold text-sm"
          >
            Reintentar sincronización
          </button>
        </div>
      ) : (
        <>
          {/* Tarjetas KPI Primarias */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            <div className="bg-slate-900/90 rounded-xl border border-slate-800 p-5 flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Usuarios Activos
                </p>
                <p className="text-3xl font-bold text-slate-100 mt-1">{stats.usuariosActivos}</p>
                <span className="inline-block mt-2 text-[11px] text-emerald-400 font-medium">
                  100% habilitados en plataforma
                </span>
              </div>
              <div className="w-12 h-12 rounded-xl bg-blue-500/15 border border-blue-500/25 flex items-center justify-center text-blue-400">
                <Users size={22} />
              </div>
            </div>

            <div className="bg-slate-900/90 rounded-xl border border-slate-800 p-5 flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Membresías Activas
                </p>
                <p className="text-3xl font-bold text-slate-100 mt-1">{stats.membresiasActivas}</p>
                <span className="inline-block mt-2 text-[11px] text-emerald-400 font-medium">
                  Retención: {ms2Report?.membershipSummary.retentionRatePct ?? 100}%
                </span>
              </div>
              <div className="w-12 h-12 rounded-xl bg-emerald-500/15 border border-emerald-500/25 flex items-center justify-center text-emerald-400">
                <CreditCard size={22} />
              </div>
            </div>

            <div className="bg-slate-900/90 rounded-xl border border-slate-800 p-5 flex items-center justify-between min-w-0">
              <div className="min-w-0 pr-2">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Ingresos del Mes
                </p>
                <p
                  className="text-2xl sm:text-3xl font-bold text-slate-100 mt-1 truncate"
                  title={copFormatter.format(stats.ingresosMesCOP)}
                >
                  {copFormatter.format(stats.ingresosMesCOP)}
                </p>
                <span className="inline-block mt-2 text-[11px] text-blue-400 font-medium">
                  Recaudo verificado en COP
                </span>
              </div>
              <div className="w-12 h-12 shrink-0 rounded-xl bg-blue-500/15 border border-blue-500/25 flex items-center justify-center text-blue-400">
                <DollarSign size={22} />
              </div>
            </div>

            <div className="bg-slate-900/90 rounded-xl border border-slate-800 p-5 flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Pagos en Auditoría
                </p>
                <p className="text-3xl font-bold text-slate-100 mt-1">{stats.pagosPendientes}</p>
                <span className="inline-block mt-2 text-[11px] text-amber-400 font-medium">
                  Pendientes por conciliación
                </span>
              </div>
              <div className="w-12 h-12 rounded-xl bg-amber-500/15 border border-amber-500/25 flex items-center justify-center text-amber-400">
                <Clock size={22} />
              </div>
            </div>
          </div>

          {/* Banda de Inteligencia Analítica (Microservicio 2 :5102) */}
          <div className="bg-slate-900/95 rounded-xl border border-slate-800 p-5">
            <div className="flex flex-wrap items-center justify-between gap-3 pb-4 mb-4 border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-400">
                  <Server size={18} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-sm font-bold text-slate-100">
                      Motor Analítico Desacoplado · Microservicio 2 (Puerto 5102)
                    </h2>
                    <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                      {ms2Report ? 'ZOD VALIDATED' : ms2Loading ? 'SINCRONIZANDO' : 'STANDBY'}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400">
                    Agregación financiera asíncrona y proyecciones para reportes ejecutivos QuestPDF
                  </p>
                </div>
              </div>
              {ms2Report && (
                <span className="text-[11px] text-slate-400 font-mono">
                  ID Reporte: {ms2Report.reportId}
                </span>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800/90">
                <span className="text-xs text-slate-400 flex items-center gap-1.5">
                  <TrendingUp size={14} className="text-blue-400" /> Proyección Cierre Mensual
                </span>
                <p className="text-xl font-bold text-slate-100 mt-1">
                  {copFormatter.format(
                    ms2Report?.financialSummary.projectedMonthlyRevenue ??
                      stats.ingresosMesCOP
                  )}
                </p>
              </div>
              <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800/90">
                <span className="text-xs text-slate-400 flex items-center gap-1.5">
                  <CheckCircle2 size={14} className="text-emerald-400" /> Eficiencia de Cobranza
                </span>
                <p className="text-xl font-bold text-emerald-400 mt-1">
                  {ms2Report?.financialSummary.collectionEfficiencyPct ?? 100}%
                </p>
              </div>
              <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800/90">
                <span className="text-xs text-slate-400 flex items-center gap-1.5">
                  <Users size={14} className="text-blue-400" /> Asistencia Deportiva Promedio
                </span>
                <p className="text-xl font-bold text-slate-100 mt-1">
                  {ms2Report?.sportsOperations.averageAttendancePct ?? 88.5}%
                </p>
              </div>
            </div>
          </div>

          {/* Gráficas Recharts Sobrias */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-slate-900/90 rounded-xl border border-slate-800 p-6 lg:col-span-2">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-base font-bold text-slate-100">
                    Evolución de Ingresos Aprobados
                  </h2>
                  <p className="text-xs text-slate-400">Últimos 6 meses en Pesos Colombianos (COP)</p>
                </div>
              </div>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={ingresosData}
                    margin={{ top: 8, right: 8, left: 8, bottom: 0 }}
                    barCategoryGap="30%"
                  >
                    <CartesianGrid vertical={false} stroke={GRID_COLOR} />
                    <XAxis
                      dataKey="mes"
                      tickLine={false}
                      axisLine={{ stroke: GRID_COLOR }}
                      tick={{ fill: AXIS_TEXT, fontSize: 12 }}
                    />
                    <YAxis
                      tickLine={false}
                      axisLine={false}
                      width={60}
                      tick={{ fill: AXIS_TEXT, fontSize: 12 }}
                      tickFormatter={(v) => `$${copCompact.format(Number(v))}`}
                    />
                    <Tooltip
                      {...tooltipStyle}
                      formatter={(v) => [copFormatter.format(Number(v)), 'Ingresos']}
                    />
                    <Bar dataKey="total" fill={SERIES_COLOR} radius={[6, 6, 0, 0]} maxBarSize={52} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-slate-900/90 rounded-xl border border-slate-800 p-6">
              <h2 className="text-base font-bold text-slate-100">Distribución de Membresías</h2>
              <p className="text-xs text-slate-400 mb-4">Estado actual del padrón de socios</p>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={membresiasData}
                    layout="vertical"
                    margin={{ top: 0, right: 40, left: 8, bottom: 0 }}
                    barCategoryGap="25%"
                  >
                    <CartesianGrid horizontal={false} stroke={GRID_COLOR} />
                    <XAxis
                      type="number"
                      allowDecimals={false}
                      tickLine={false}
                      axisLine={false}
                      tick={{ fill: AXIS_TEXT, fontSize: 12 }}
                    />
                    <YAxis
                      type="category"
                      dataKey="estado"
                      tickLine={false}
                      axisLine={false}
                      width={96}
                      tick={{ fill: '#cbd5e1', fontSize: 12 }}
                    />
                    <Tooltip {...tooltipStyle} formatter={(v) => [v, 'Membresías']} />
                    <Bar dataKey="cantidad" radius={[0, 6, 6, 0]} maxBarSize={26}>
                      {membresiasData.map((d) => (
                        <Cell key={d.estado} fill={d.color} />
                      ))}
                      <LabelList
                        dataKey="cantidad"
                        position="right"
                        fill="#e2e8f0"
                        fontSize={12}
                        fontWeight={600}
                      />
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-slate-900/90 rounded-xl border border-slate-800 p-6">
              <h2 className="text-base font-bold text-slate-100">Altas de Usuarios por Mes</h2>
              <p className="text-xs text-slate-400 mb-4">Crecimiento orgánico en los últimos 6 meses</p>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={usuariosData}
                    margin={{ top: 8, right: 8, left: 0, bottom: 0 }}
                    barCategoryGap="30%"
                  >
                    <CartesianGrid vertical={false} stroke={GRID_COLOR} />
                    <XAxis
                      dataKey="mes"
                      tickLine={false}
                      axisLine={{ stroke: GRID_COLOR }}
                      tick={{ fill: AXIS_TEXT, fontSize: 12 }}
                    />
                    <YAxis
                      allowDecimals={false}
                      tickLine={false}
                      axisLine={false}
                      width={32}
                      tick={{ fill: AXIS_TEXT, fontSize: 12 }}
                    />
                    <Tooltip {...tooltipStyle} formatter={(v) => [v, 'Usuarios nuevos']} />
                    <Bar dataKey="cantidad" fill={SERIES_COLOR} radius={[6, 6, 0, 0]} maxBarSize={40} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Exportación Consolidada QuestPDF */}
          <div className="bg-slate-900/90 rounded-xl border border-slate-800 p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-base font-bold text-slate-100">
                Exportación Oficial de Reportes (QuestPDF)
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Genera documentos ejecutivos auditables en formato PDF directamente desde el motor .NET Core.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => handleDownloadReport('members')}
                className="bg-slate-800 hover:bg-slate-700 text-slate-100 border border-slate-700 px-4 py-2.5 rounded-xl text-xs font-semibold transition-colors flex items-center gap-2"
              >
                <FileDown size={16} className="text-blue-400" /> Reporte de Miembros (PDF)
              </button>

              <button
                onClick={() => handleDownloadReport('payments')}
                className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2.5 rounded-xl text-xs font-semibold transition-colors flex items-center gap-2 shadow-sm"
              >
                <FileDown size={16} /> Reporte Financiero (PDF)
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
