import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import {
  DollarSign,
  Download,
  Check,
  X,
  Clock,
  AlertTriangle,
  User,
  Lock,
  PlusCircle,
  BarChart3,
  FileText,
  Eye,
} from 'lucide-react';
import { useAccountantViewModel } from '../../viewmodels/useAccountantViewModel';
import { Payment } from '../../models';
import { apiClient } from '../../services/api/apiClient';
import {
  microserviceClient,
  type AnalyticalAggregateResponse,
} from '../../services/api/microserviceClient';
import MembershipsPage from '../admin/MembershipsPage';
import Pagination from '../../components/Pagination';
import PdfViewerModal from '../../components/common/PdfViewerModal';

const manualPaymentSchema = z.object({
  usuarioId: z.string().min(1, 'Debes seleccionar un miembro'),
  membresiaId: z.string().optional(),
  montoCOP: z.coerce
    .number({ invalid_type_error: 'Ingresa un monto numérico válido' })
    .min(1000, 'El monto mínimo permitido es $1.000 COP'),
});

type ManualPaymentFormInputs = z.infer<typeof manualPaymentSchema>;

export default function AccountantDashboard() {
  const {
    payments,
    summary,
    profile,
    options,
    loading,
    error,
    page,
    pageSize,
    totalCount,
    totalPages,
    setPage,
    changePageSize,
    approvePayment,
    rejectPayment,
    registerManualPayment,
    downloadReport,
    changePassword,
  } = useAccountantViewModel();

  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') || 'pagos';

  const setTab = (tab: string) => {
    setSearchParams({ tab });
  };

  const [rejectingPayment, setRejectingPayment] = useState<Payment | null>(null);
  const [comentario, setComentario] = useState('');
  const [selectedPdfUrl, setSelectedPdfUrl] = useState<string | null>(null);
  const [isPdfModalOpen, setIsPdfModalOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'PENDIENTE' | 'APROBADO' | 'RECHAZADO'>('ALL');
  const [ms2Report, setMs2Report] = useState<AnalyticalAggregateResponse | null>(null);

  const [pwdData, setPwdData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [pwdSuccess, setPwdSuccess] = useState('');

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm<ManualPaymentFormInputs>({
    resolver: zodResolver(manualPaymentSchema),
    defaultValues: { usuarioId: '', membresiaId: '', montoCOP: 120000 },
  });

  const watchedUserId = watch('usuarioId');

  useEffect(() => {
    microserviceClient
      .getAnalyticalAggregation({
        requestedByRole: 'CONTADOR',
        rawPayments: payments.map((p) => ({
          id: p.id,
          membresiaId: 1,
          monto: p.montoCOP,
          estado: p.estado,
          fechaPago: p.fechaPago,
        })),
      })
      .then((res) => {
        if (res) setMs2Report(res);
      });
  }, [payments]);

  const handleApprove = async (id: number) => {
    await approvePayment(id);
    toast.success(`Pago #${id} aprobado y membresía actualizada.`);
  };

  const handleReject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rejectingPayment || comentario.trim().length < 10) {
      toast.error('El motivo de rechazo debe tener al menos 10 caracteres.');
      return;
    }

    const success = await rejectPayment(rejectingPayment.id, comentario);
    if (success) {
      toast.success(`Pago #${rejectingPayment.id} rechazado.`);
      setRejectingPayment(null);
      setComentario('');
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPwdSuccess('');
    if (pwdData.newPassword !== pwdData.confirmPassword) {
      toast.error('Las contraseñas nuevas no coinciden.');
      return;
    }
    const success = await changePassword({
      currentPassword: pwdData.currentPassword,
      newPassword: pwdData.newPassword,
    });
    if (success) {
      setPwdSuccess('Contraseña actualizada correctamente.');
      toast.success('Contraseña actualizada.');
      setPwdData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    }
  };

  const onManualPaymentSubmit = async (data: ManualPaymentFormInputs) => {
    const payload = {
      usuarioId: parseInt(data.usuarioId, 10),
      membresiaId: data.membresiaId ? parseInt(data.membresiaId, 10) : undefined,
      montoCOP: data.montoCOP,
    };

    const success = await registerManualPayment(payload);
    if (success) {
      toast.success('Pago manual registrado y aprobado exitosamente.');
      reset({ usuarioId: '', membresiaId: '', montoCOP: 120000 });
      setTab('pagos');
    }
  };

  const handleDownloadReceipt = async (pagoId: number) => {
    try {
      const response = await apiClient.get(`/api/receipts/${pagoId}/preview`, {
        responseType: 'blob',
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Comprobante_Pago_${pagoId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      toast.success(`Comprobante del pago #${pagoId} descargado.`);
    } catch {
      toast.error('Este registro de pago no posee archivo adjunto en el servidor.');
    }
  };

  const getStatusBadge = (estado: string) => {
    switch (estado) {
      case 'APROBADO':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
            <Check size={12} /> Aprobado
          </span>
        );
      case 'RECHAZADO':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-500/15 text-rose-400 border border-rose-500/30">
            <X size={12} /> Rechazado
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-500/15 text-amber-400 border border-amber-500/30">
            <Clock size={12} /> Pendiente
          </span>
        );
    }
  };

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
    }).format(amount);

  const filteredPayments =
    statusFilter === 'ALL'
      ? payments
      : payments.filter((p) => p.estado === statusFilter);

  if (loading && payments.length === 0) {
    return (
      <div className="space-y-4">
        <div className="h-20 bg-slate-900 border border-slate-800 rounded-xl animate-pulse" />
        <div className="h-64 bg-slate-900 border border-slate-800 rounded-xl animate-pulse" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Encabezado Contable */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-end border-b border-slate-800 pb-4 gap-4">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-widest text-blue-400">
            Tesorería y Conciliación Financiera
          </span>
          <h1 className="text-2xl font-bold text-slate-100 mt-0.5">
            Panel de Contaduría
          </h1>
          <p className="text-slate-400 text-xs mt-1">
            Auditor activo: {profile?.nombre || 'Carlos'} {profile?.apellido || 'Contador'}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={downloadReport}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold transition-colors shadow-sm"
          >
            <Download size={15} /> Exportar Reporte QuestPDF
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-rose-500/10 border border-rose-500/30 text-rose-300 rounded-xl flex items-center text-xs">
          <AlertTriangle size={18} className="mr-2 shrink-0" /> {error}
        </div>
      )}

      {/* VISTA 1: AUDITORÍA DE PAGOS */}
      {activeTab === 'pagos' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div className="bg-slate-900/90 rounded-xl p-5 border border-slate-800 flex items-center gap-4">
              <div className="w-12 h-12 bg-amber-500/15 border border-amber-500/30 text-amber-400 rounded-xl flex items-center justify-center">
                <Clock size={22} />
              </div>
              <div>
                <p className="text-xs text-slate-400 font-semibold uppercase">
                  En Cola de Revisión
                </p>
                <h3 className="text-2xl font-bold text-slate-100">{summary.pendientes}</h3>
              </div>
            </div>

            <div className="bg-slate-900/90 rounded-xl p-5 border border-slate-800 flex items-center gap-4">
              <div className="w-12 h-12 bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 rounded-xl flex items-center justify-center">
                <DollarSign size={22} />
              </div>
              <div>
                <p className="text-xs text-slate-400 font-semibold uppercase">
                  Total Recaudado (Aprobado)
                </p>
                <h3 className="text-2xl font-bold text-slate-100">
                  {formatCurrency(summary.totalAprobadoCOP)}
                </h3>
              </div>
            </div>

            <div className="bg-slate-900/90 rounded-xl p-5 border border-slate-800 flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-500/15 border border-blue-500/30 text-blue-400 rounded-xl flex items-center justify-center">
                <BarChart3 size={22} />
              </div>
              <div>
                <p className="text-xs text-slate-400 font-semibold uppercase">
                  Eficiencia Cobranza (MS2)
                </p>
                <h3 className="text-2xl font-bold text-emerald-400">
                  {ms2Report?.financialSummary.collectionEfficiencyPct ?? 100}%
                </h3>
              </div>
            </div>
          </div>

          {/* Filtros rápidos */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              {(['ALL', 'PENDIENTE', 'APROBADO', 'RECHAZADO'] as const).map((st) => (
                <button
                  key={st}
                  type="button"
                  onClick={() => setStatusFilter(st)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                    statusFilter === st
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
                  }`}
                >
                  {st === 'ALL' ? 'Todos' : st}
                </button>
              ))}
            </div>
            <button
              type="button"
              onClick={() => setTab('manual')}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-400 hover:text-blue-300"
            >
              <PlusCircle size={15} /> + Registrar ingreso manual
            </button>
          </div>

          {/* Tabla de Pagos */}
          <div className="bg-slate-900/90 rounded-xl overflow-hidden border border-slate-800">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-950/70 border-b border-slate-800 text-xs uppercase tracking-wider text-slate-400">
                    <th className="p-4 font-semibold">ID Pago</th>
                    <th className="p-4 font-semibold">Socio / Atleta</th>
                    <th className="p-4 font-semibold">Monto (COP)</th>
                    <th className="p-4 font-semibold">Fecha Registro</th>
                    <th className="p-4 font-semibold text-center">Estado</th>
                    <th className="p-4 font-semibold text-right">Acciones de Auditoría</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/80 text-sm">
                  {filteredPayments.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="p-10 text-center text-slate-400">
                        No se encontraron transacciones para el filtro seleccionado.
                      </td>
                    </tr>
                  ) : (
                    filteredPayments.map((payment) => (
                      <tr
                        key={payment.id}
                        className="hover:bg-slate-800/40 transition-colors"
                      >
                        <td className="p-4 font-mono text-xs text-slate-400">#{payment.id}</td>
                        <td className="p-4 font-semibold text-slate-100">
                          {payment.nombreUsuario}
                        </td>
                        <td className="p-4 font-bold text-slate-100">
                          {formatCurrency(payment.montoCOP)}
                        </td>
                        <td className="p-4 text-slate-400 text-xs">
                          {new Date(payment.fechaPago).toLocaleDateString('es-CO')}
                        </td>
                        <td className="p-4 text-center">{getStatusBadge(payment.estado)}</td>
                        <td className="p-4 text-right space-x-2 whitespace-nowrap">
                          <button
                            type="button"
                            onClick={() => handleDownloadReceipt(payment.id)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium bg-slate-800 text-slate-200 hover:bg-slate-700 border border-slate-700"
                          >
                            <FileText size={12} /> Anexo
                          </button>

                          {payment.tieneComprobante && payment.comprobanteUrl && (
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedPdfUrl(
                                  `http://localhost:5000/${payment.comprobanteUrl!.replace(/^\/+/, '')}`
                                );
                                setIsPdfModalOpen(true);
                              }}
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium bg-blue-600/20 text-blue-300 hover:bg-blue-600/30 border border-blue-500/30"
                            >
                              <Eye size={12} /> Ver PDF
                            </button>
                          )}

                          {payment.estado === 'PENDIENTE' && (
                            <>
                              <button
                                type="button"
                                onClick={() => handleApprove(payment.id)}
                                className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold transition-colors"
                              >
                                Aprobar
                              </button>
                              <button
                                type="button"
                                onClick={() => setRejectingPayment(payment)}
                                className="px-3 py-1 bg-rose-600/90 hover:bg-rose-500 text-white rounded-lg text-xs font-semibold transition-colors"
                              >
                                Rechazar
                              </button>
                            </>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            <Pagination
              page={page}
              pageSize={pageSize}
              totalCount={totalCount}
              totalPages={totalPages}
              loading={loading}
              onPageChange={setPage}
              onPageSizeChange={changePageSize}
            />
          </div>
        </div>
      )}

      {/* VISTA 2: REGISTRAR PAGO MANUAL (React Hook Form + Zod) */}
      {activeTab === 'manual' && (
        <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-6 max-w-2xl">
          <h3 className="font-bold text-lg text-slate-100 mb-1 flex items-center gap-2">
            <PlusCircle size={20} className="text-blue-400" /> Registrar Ingreso en Caja / Consignación
          </h3>
          <p className="text-slate-400 text-xs mb-6">
            Registra pagos verificados directamente por contaduría. El pago quedará en estado APROBADO y activará la membresía asociada.
          </p>

          <form onSubmit={handleSubmit(onManualPaymentSubmit)} className="space-y-4" noValidate>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                Miembro / Atleta
              </label>
              <select
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 outline-none focus:border-blue-500"
                {...register('usuarioId')}
              >
                <option value="">Seleccione el miembro que realiza el pago...</option>
                {options.Members?.map((m: any) => (
                  <option key={m.id} value={m.id}>
                    {m.nombre} {m.apellido} (ID #{m.id})
                  </option>
                ))}
              </select>
              {errors.usuarioId && (
                <p className="text-xs text-rose-400 mt-1">{errors.usuarioId.message}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                Membresía a Renovar / Activar (Opcional)
              </label>
              <select
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 outline-none focus:border-blue-500"
                {...register('membresiaId')}
              >
                <option value="">Ninguna - Cobro por concepto general</option>
                {watchedUserId &&
                  options.Memberships?.filter(
                    (mem: any) => mem.usuarioId.toString() === watchedUserId
                  ).map((mem: any) => (
                    <option key={mem.id} value={mem.id}>
                      Plan {mem.plan} · Estado: {mem.estado}
                    </option>
                  ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                Monto Recibido (COP)
              </label>
              <input
                type="number"
                min={1000}
                step={1000}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 outline-none focus:border-blue-500"
                placeholder="120000"
                {...register('montoCOP')}
              />
              {errors.montoCOP && (
                <p className="text-xs text-rose-400 mt-1">{errors.montoCOP.message}</p>
              )}
            </div>

            <div className="pt-2">
              <button
                type="submit"
                className="bg-blue-600 hover:bg-blue-500 text-white px-5 py-2.5 rounded-xl font-semibold text-sm w-full transition-colors shadow-lg shadow-blue-950/50"
              >
                Confirmar y Contabilizar Ingreso
              </button>
            </div>
          </form>
        </div>
      )}

      {/* VISTA 3: GESTIÓN DE MEMBRESÍAS */}
      {activeTab === 'membresias' && (
        <div className="bg-slate-900/90 rounded-2xl border border-slate-800 overflow-hidden">
          <MembershipsPage />
        </div>
      )}

      {/* VISTA 4: ANALÍTICA FINANCIERA MS2 (:5102) */}
      {activeTab === 'analitica' && (
        <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-6 space-y-6">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div>
              <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2">
                <BarChart3 size={20} className="text-emerald-400" /> Consolidado Financiero · Microservicio 2 (:5102)
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Agregación asíncrona validada con esquemas Zod en el nodo de reportes
              </p>
            </div>
            <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
              {ms2Report?.dataSource || 'CORE_API_LIVE'}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
              <p className="text-xs text-slate-400">Recaudo Aprobado</p>
              <p className="text-2xl font-bold text-slate-100 mt-1">
                {formatCurrency(
                  ms2Report?.financialSummary.approvedRevenue ?? summary.totalAprobadoCOP
                )}
              </p>
            </div>
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
              <p className="text-xs text-slate-400">Recaudo en Cola Estimado</p>
              <p className="text-2xl font-bold text-amber-400 mt-1">
                {formatCurrency(ms2Report?.financialSummary.estimatedPendingRevenue ?? 0)}
              </p>
            </div>
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
              <p className="text-xs text-slate-400">Proyección Mensual Consolidada</p>
              <p className="text-2xl font-bold text-blue-400 mt-1">
                {formatCurrency(
                  ms2Report?.financialSummary.projectedMonthlyRevenue ??
                    summary.totalAprobadoCOP
                )}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* VISTA 5: PERFIL CONTABLE */}
      {activeTab === 'perfil' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-6">
            <h3 className="font-bold text-base text-slate-100 mb-4 flex items-center gap-2">
              <User size={18} className="text-blue-400" /> Credencial Contable
            </h3>
            <div className="space-y-4 text-sm">
              <div>
                <p className="text-xs text-slate-400 uppercase font-semibold">Titular</p>
                <p className="text-slate-100 font-medium mt-0.5">
                  {profile?.nombre} {profile?.apellido}
                </p>
              </div>
              <div>
                <p className="text-xs text-slate-400 uppercase font-semibold">Correo Institucional</p>
                <p className="text-slate-100 font-medium mt-0.5">{profile?.correo}</p>
              </div>
              <div>
                <p className="text-xs text-slate-400 uppercase font-semibold">Nivel de Autorización</p>
                <span className="inline-block mt-1 px-2.5 py-0.5 rounded bg-blue-500/15 text-blue-400 border border-blue-500/30 text-xs font-bold">
                  CONTADOR OFICIAL
                </span>
              </div>
            </div>
          </div>

          <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-6">
            <h3 className="font-bold text-base text-slate-100 mb-4 flex items-center gap-2">
              <Lock size={18} className="text-blue-400" /> Actualizar Contraseña
            </h3>
            {pwdSuccess && (
              <div className="mb-4 p-3 bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 rounded-xl text-xs font-semibold">
                {pwdSuccess}
              </div>
            )}
            <form onSubmit={handleChangePassword} className="space-y-4">
              <div>
                <label className="block text-xs text-slate-300 mb-1">Contraseña Actual</label>
                <input
                  type="password"
                  required
                  value={pwdData.currentPassword}
                  onChange={(e) => setPwdData({ ...pwdData, currentPassword: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-sm text-slate-100 outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs text-slate-300 mb-1">Nueva Contraseña</label>
                <input
                  type="password"
                  required
                  value={pwdData.newPassword}
                  onChange={(e) => setPwdData({ ...pwdData, newPassword: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-sm text-slate-100 outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs text-slate-300 mb-1">
                  Confirmar Nueva Contraseña
                </label>
                <input
                  type="password"
                  required
                  value={pwdData.confirmPassword}
                  onChange={(e) => setPwdData({ ...pwdData, confirmPassword: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-sm text-slate-100 outline-none focus:border-blue-500"
                />
              </div>
              <button
                type="submit"
                className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2.5 rounded-xl font-semibold text-xs w-full transition-colors"
              >
                Actualizar Credenciales
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Modal de Rechazo */}
      {rejectingPayment && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl max-w-md w-full p-6">
            <div className="flex items-center gap-3 mb-3 text-rose-400">
              <AlertTriangle size={22} />
              <h2 className="text-lg font-bold text-slate-100">Rechazar Pago #{rejectingPayment.id}</h2>
            </div>
            <p className="text-xs text-slate-400 mb-4">
              Especifica la causal de rechazo para el comprobante de{' '}
              <strong className="text-slate-200">{rejectingPayment.nombreUsuario}</strong> (mínimo 10 caracteres).
            </p>
            <form onSubmit={handleReject} className="space-y-4">
              <textarea
                required
                minLength={10}
                rows={3}
                value={comentario}
                onChange={(e) => setComentario(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-slate-100 outline-none resize-none"
                placeholder="Ej: El soporte bancario adjunto es ilegible o no coincide con el valor..."
              />
              <div className="flex justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setRejectingPayment(null)}
                  className="px-4 py-2 text-xs font-semibold text-slate-300 bg-slate-800 hover:bg-slate-700 rounded-xl"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold bg-rose-600 text-white rounded-xl hover:bg-rose-500"
                >
                  Confirmar Rechazo
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <PdfViewerModal
        isOpen={isPdfModalOpen}
        onClose={() => setIsPdfModalOpen(false)}
        pdfUrl={selectedPdfUrl}
      />
    </div>
  );
}
