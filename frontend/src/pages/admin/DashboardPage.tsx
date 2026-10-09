import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import {
  Bar, BarChart, CartesianGrid, Cell, LabelList, ResponsiveContainer, Tooltip, XAxis, YAxis,
} from 'recharts';
import { apiClient } from '../../services/api/apiClient';
import { useAdminDashboardViewModel, REFRESH_INTERVAL_MS } from '../../viewmodels/useAdminDashboardViewModel';

// Gráficas de una sola serie: un solo tono, sin leyenda (el título la nombra)
const SERIES_COLOR = '#2a78d6';
const GRID_COLOR = '#e5e7eb';
const AXIS_TEXT = '#6b7280';

// Estado de membresía = estado, no identidad: paleta de status, siempre acompañada de la etiqueta
const ESTADO_MEMBRESIA: Record<string, { label: string; color: string }> = {
  ACTIVA: { label: 'Activas', color: '#0ca30c' },
  PENDIENTE: { label: 'Pendientes', color: '#fab219' },
  SUSPENDIDA: { label: 'Suspendidas', color: '#ec835a' },
  VENCIDA: { label: 'Vencidas', color: '#d03b3b' },
};

const copFormatter = new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 });
const copCompact = new Intl.NumberFormat('es-CO', { notation: 'compact', maximumFractionDigits: 1 });
const monthFormatter = new Intl.DateTimeFormat('es-CO', { month: 'short', year: '2-digit' });

const monthLabel = (anio: number, mes: number) => monthFormatter.format(new Date(anio, mes - 1, 1));

const timeAgo = (date: Date, now: number) => {
  const seconds = Math.max(0, Math.round((now - date.getTime()) / 1000));
  if (seconds < 5) return 'justo ahora';
  if (seconds < 60) return `hace ${seconds} s`;
  return `hace ${Math.floor(seconds / 60)} min`;
};

const tooltipStyle = {
  contentStyle: { borderRadius: 8, borderColor: GRID_COLOR, fontSize: 13 },
  labelStyle: { color: '#111827', fontWeight: 600 },
  itemStyle: { color: '#374151' },
  cursor: { fill: 'rgba(0,0,0,0.04)' },
};

export default function DashboardPage() {
  const { stats, loading, refreshing, lastUpdated, error, refresh } = useAdminDashboardViewModel();

  // Reloj para el texto "Actualizado hace X s"
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 5000);
    return () => clearInterval(t);
  }, []);

  const handleDownloadReport = async (type: 'members' | 'payments') => {
    try {
      const response = await apiClient.get(`/api/reports/${type}/pdf`, {
        responseType: 'blob'
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `reporte_${type}_${new Date().getTime()}.pdf`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error: any) {
      console.error('Error descargando el reporte', error);
      // Los 5xx ya los notifica el interceptor de axios
      if (!(error.response?.status >= 500)) {
        toast.error('Hubo un error al generar el reporte PDF.');
      }
    }
  };

  const ingresosData = (stats?.ingresosPorMes ?? []).map(m => ({ mes: monthLabel(m.anio, m.mes), total: m.totalCOP }));
  const usuariosData = (stats?.nuevosUsuariosPorMes ?? []).map(m => ({ mes: monthLabel(m.anio, m.mes), cantidad: m.cantidad }));
  const membresiasData = (stats?.membresiasPorEstado ?? []).map(m => ({
    estado: ESTADO_MEMBRESIA[m.estado]?.label ?? m.estado,
    cantidad: m.cantidad,
    color: ESTADO_MEMBRESIA[m.estado]?.color ?? AXIS_TEXT,
  }));

  return (
    <div className="space-y-6">
      <div className="border-b pb-4 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-sportify-dark">Dashboard Principal</h1>
          <p className="text-gray-500 mt-1">Resumen estadístico y reportes del club</p>
        </div>
        <div className="flex items-center gap-3 text-sm">
          <span className="flex items-center text-gray-600" aria-live="polite">
            <span className={`inline-block w-2.5 h-2.5 rounded-full mr-2 ${error ? 'bg-gray-400' : 'bg-green-500 animate-pulse'}`}></span>
            {error ? 'Sin conexión' : 'En vivo'}
            {lastUpdated && <span className="text-gray-400 ml-1">· Actualizado {timeAgo(lastUpdated, now)}</span>}
          </span>
          <button
            onClick={refresh}
            disabled={refreshing}
            title={`Se actualiza solo cada ${REFRESH_INTERVAL_MS / 1000} s`}
            className="border border-gray-300 hover:bg-gray-50 disabled:opacity-60 text-sportify-dark px-3 py-1.5 rounded-lg font-semibold transition-colors flex items-center"
          >
            <i className={`bi bi-arrow-clockwise mr-1 ${refreshing ? 'animate-spin' : ''}`}></i> Actualizar
          </button>
        </div>
      </div>

      {error && stats && (
        <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 text-sm rounded-lg px-4 py-2">
          <i className="bi bi-exclamation-triangle-fill mr-2"></i>
          {error}. Se muestran los últimos datos obtenidos.
        </div>
      )}

      {loading ? (
        <div className="flex justify-center items-center py-20">
          <div className="w-10 h-10 border-4 border-gray-200 border-t-sportify-primary rounded-full animate-spin" role="status" aria-label="Cargando"></div>
        </div>
      ) : !stats ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 text-center">
          <p className="text-gray-600 mb-4">{error ?? 'No se pudieron cargar las métricas.'}</p>
          <button onClick={refresh} className="bg-sportify-primary hover:bg-red-700 text-white px-5 py-2 rounded-lg font-semibold">
            Reintentar
          </button>
        </div>
      ) : (
        <>
          {/* Tarjetas de Indicadores */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex items-center">
              <div className="bg-blue-100 p-4 rounded-full text-blue-600 mr-4">
                <i className="bi bi-people-fill text-2xl"></i>
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-500 uppercase">Usuarios Activos</p>
                <p className="text-3xl font-bold text-sportify-dark">{stats.usuariosActivos}</p>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex items-center">
              <div className="bg-green-100 p-4 rounded-full text-green-600 mr-4">
                <i className="bi bi-card-checklist text-2xl"></i>
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-500 uppercase">Membresías Activas</p>
                <p className="text-3xl font-bold text-sportify-dark">{stats.membresiasActivas}</p>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex items-center">
              <div className="bg-yellow-100 p-4 rounded-full text-yellow-600 mr-4">
                <i className="bi bi-currency-dollar text-2xl"></i>
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-gray-500 uppercase">Ingresos del Mes</p>
                <p className="text-3xl font-bold text-sportify-dark truncate" title={copFormatter.format(stats.ingresosMesCOP)}>
                  {copFormatter.format(stats.ingresosMesCOP)}
                </p>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex items-center">
              <div className="bg-red-100 p-4 rounded-full text-red-600 mr-4">
                <i className="bi bi-exclamation-circle-fill text-2xl"></i>
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-500 uppercase">Pagos Pendientes</p>
                <p className="text-3xl font-bold text-sportify-dark">{stats.pagosPendientes}</p>
              </div>
            </div>
          </div>

          {/* Gráficas */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 lg:col-span-2">
              <h2 className="text-lg font-bold text-sportify-dark">Ingresos aprobados por mes</h2>
              <p className="text-sm text-gray-500 mb-4">Últimos 6 meses, en COP</p>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={ingresosData} margin={{ top: 8, right: 8, left: 8, bottom: 0 }} barCategoryGap="30%">
                    <CartesianGrid vertical={false} stroke={GRID_COLOR} />
                    <XAxis dataKey="mes" tickLine={false} axisLine={{ stroke: GRID_COLOR }} tick={{ fill: AXIS_TEXT, fontSize: 12 }} />
                    <YAxis tickLine={false} axisLine={false} width={56} tick={{ fill: AXIS_TEXT, fontSize: 12 }}
                      tickFormatter={(v) => `$${copCompact.format(Number(v))}`} />
                    <Tooltip {...tooltipStyle} formatter={(v) => [copFormatter.format(Number(v)), 'Ingresos']} />
                    <Bar dataKey="total" fill={SERIES_COLOR} radius={[4, 4, 0, 0]} maxBarSize={56} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-lg font-bold text-sportify-dark">Membresías por estado</h2>
              <p className="text-sm text-gray-500 mb-4">Total actual por estado</p>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={membresiasData} layout="vertical" margin={{ top: 0, right: 40, left: 8, bottom: 0 }} barCategoryGap="25%">
                    <CartesianGrid horizontal={false} stroke={GRID_COLOR} />
                    <XAxis type="number" allowDecimals={false} tickLine={false} axisLine={false} tick={{ fill: AXIS_TEXT, fontSize: 12 }} />
                    <YAxis type="category" dataKey="estado" tickLine={false} axisLine={false} width={96} tick={{ fill: '#374151', fontSize: 13 }} />
                    <Tooltip {...tooltipStyle} formatter={(v) => [v, 'Membresías']} />
                    <Bar dataKey="cantidad" radius={[0, 4, 4, 0]} maxBarSize={28}>
                      {membresiasData.map((d) => <Cell key={d.estado} fill={d.color} />)}
                      <LabelList dataKey="cantidad" position="right" fill="#374151" fontSize={13} fontWeight={600} />
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-lg font-bold text-sportify-dark">Nuevos usuarios por mes</h2>
              <p className="text-sm text-gray-500 mb-4">Registros de los últimos 6 meses</p>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={usuariosData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }} barCategoryGap="30%">
                    <CartesianGrid vertical={false} stroke={GRID_COLOR} />
                    <XAxis dataKey="mes" tickLine={false} axisLine={{ stroke: GRID_COLOR }} tick={{ fill: AXIS_TEXT, fontSize: 12 }} />
                    <YAxis allowDecimals={false} tickLine={false} axisLine={false} width={32} tick={{ fill: AXIS_TEXT, fontSize: 12 }} />
                    <Tooltip {...tooltipStyle} formatter={(v) => [v, 'Usuarios nuevos']} />
                    <Bar dataKey="cantidad" fill={SERIES_COLOR} radius={[4, 4, 0, 0]} maxBarSize={40} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Generación de Reportes PDF */}
          <div className="mt-10 bg-white rounded-xl shadow-sm border border-gray-100 p-8">
            <h2 className="text-xl font-bold text-sportify-dark mb-4 border-b pb-2"><i className="bi bi-file-earmark-pdf-fill text-red-600 mr-2"></i>Generación de Reportes PDF</h2>
            <p className="text-gray-600 mb-6">Descarga los reportes consolidados del sistema en formato PDF generados dinámicamente con QuestPDF.</p>

            <div className="flex flex-wrap gap-4">
              <button
                onClick={() => handleDownloadReport('members')}
                className="bg-sportify-dark hover:bg-black text-white px-6 py-3 rounded-lg font-semibold shadow-sm transition-colors flex items-center"
              >
                <i className="bi bi-cloud-download mr-2"></i> Reporte de Miembros
              </button>

              <button
                onClick={() => handleDownloadReport('payments')}
                className="bg-sportify-primary hover:bg-red-700 text-white px-6 py-3 rounded-lg font-semibold shadow-sm transition-colors flex items-center"
              >
                <i className="bi bi-cloud-download mr-2"></i> Reporte de Pagos
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
