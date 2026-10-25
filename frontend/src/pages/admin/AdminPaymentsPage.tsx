import React, { useState } from 'react';
import toast from 'react-hot-toast';
import {
  DollarSign,
  Download,
  Check,
  X,
  Clock,
  AlertTriangle,
  PlusCircle,
  CreditCard,
  Eye,
  FileText,
} from 'lucide-react';
import { useAccountantViewModel } from '../../viewmodels/useAccountantViewModel';
import { Payment } from '../../models';
import { apiClient, API_URL } from '../../services/api/apiClient';
import Pagination from '../../components/Pagination';
import PdfViewerModal from '../../components/common/PdfViewerModal';

export default function AdminPaymentsPage() {
  const {
    payments,
    summary,
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
  } = useAccountantViewModel();

  const [activeTab, setActiveTab] = useState<'pagos' | 'manual'>('pagos');
  const [rejectingPayment, setRejectingPayment] = useState<Payment | null>(null);
  const [comentario, setComentario] = useState('');
  const [selectedPdfUrl, setSelectedPdfUrl] = useState<string | null>(null);
  const [isPdfModalOpen, setIsPdfModalOpen] = useState(false);

  const [manualPayment, setManualPayment] = useState({
    usuarioId: '',
    membresiaId: '',
    montoCOP: '',
  });

  const handleApprove = async (id: number) => {
    await approvePayment(id);
    toast.success(`Pago #${id} aprobado exitosamente.`);
  };

  const handleReject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rejectingPayment || comentario.trim().length < 10) {
      toast.error('El comentario de rechazo requiere mínimo 10 caracteres.');
      return;
    }

    const success = await rejectPayment(rejectingPayment.id, comentario);
    if (success) {
      toast.success(`Pago #${rejectingPayment.id} rechazado.`);
      setRejectingPayment(null);
      setComentario('');
    }
  };

  const handleManualPaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      usuarioId: parseInt(manualPayment.usuarioId, 10),
      membresiaId: manualPayment.membresiaId
        ? parseInt(manualPayment.membresiaId, 10)
        : undefined,
      montoCOP: parseFloat(manualPayment.montoCOP),
    };

    const success = await registerManualPayment(payload);
    if (success) {
      toast.success('Pago registrado y aprobado exitosamente.');
      setManualPayment({ usuarioId: '', membresiaId: '', montoCOP: '' });
      setActiveTab('pagos');
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
      toast.success(`Comprobante #${pagoId} descargado.`);
    } catch {
      toast.error('Este pago no cuenta con soporte adjunto.');
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

  if (loading && payments.length === 0) {
    return (
      <div className="p-8 text-center text-slate-400">
        Cargando registros financieros...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between sm:items-end border-b border-slate-800 pb-4 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
            <DollarSign size={24} className="text-blue-400" /> Gestión Financiera de Pagos
          </h1>
          <p className="text-slate-400 text-xs mt-1">
            Auditoría de comprobantes, aprobación de membresías y exportación QuestPDF
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setActiveTab('pagos')}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors ${
              activeTab === 'pagos'
                ? 'bg-blue-600 text-white'
                : 'bg-slate-900 text-slate-300 border border-slate-800 hover:bg-slate-800'
            }`}
          >
            <CreditCard size={14} /> Historial y Auditoría
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('manual')}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors ${
              activeTab === 'manual'
                ? 'bg-blue-600 text-white'
                : 'bg-slate-900 text-slate-300 border border-slate-800 hover:bg-slate-800'
            }`}
          >
            <PlusCircle size={14} /> Registrar Ingreso Manual
          </button>
          <button
            type="button"
            onClick={downloadReport}
            className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-100 border border-slate-700 rounded-xl text-xs font-semibold flex items-center gap-1.5"
          >
            <Download size={14} className="text-blue-400" /> Exportar PDF
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-rose-500/10 border border-rose-500/30 text-rose-300 rounded-xl flex items-center text-xs">
          <AlertTriangle size={18} className="mr-2" /> {error}
        </div>
      )}

      {activeTab === 'pagos' && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="bg-slate-900/90 rounded-xl p-5 border border-slate-800 flex items-center gap-4">
              <div className="w-12 h-12 bg-amber-500/15 border border-amber-500/30 text-amber-400 rounded-xl flex items-center justify-center">
                <Clock size={22} />
              </div>
              <div>
                <p className="text-xs text-slate-400 font-semibold uppercase">Pagos Pendientes</p>
                <h3 className="text-2xl font-bold text-slate-100">{summary.pendientes}</h3>
              </div>
            </div>
            <div className="bg-slate-900/90 rounded-xl p-5 border border-slate-800 flex items-center gap-4">
              <div className="w-12 h-12 bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 rounded-xl flex items-center justify-center">
                <DollarSign size={22} />
              </div>
              <div>
                <p className="text-xs text-slate-400 font-semibold uppercase">Recaudo Aprobado</p>
                <h3 className="text-2xl font-bold text-slate-100">
                  {formatCurrency(summary.totalAprobadoCOP)}
                </h3>
              </div>
            </div>
          </div>

          <div className="bg-slate-900/90 rounded-xl overflow-hidden border border-slate-800">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-950/70 border-b border-slate-800 text-xs uppercase tracking-wider text-slate-400">
                    <th className="p-4 font-semibold">ID</th>
                    <th className="p-4 font-semibold">Usuario</th>
                    <th className="p-4 font-semibold">Monto</th>
                    <th className="p-4 font-semibold">Fecha</th>
                    <th className="p-4 font-semibold text-center">Estado</th>
                    <th className="p-4 font-semibold text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/80 text-sm">
                  {payments.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="p-8 text-center text-slate-400">
                        No hay pagos registrados.
                      </td>
                    </tr>
                  ) : (
                    payments.map((payment) => (
                      <tr key={payment.id} className="hover:bg-slate-800/40">
                        <td className="p-4 font-mono text-xs text-slate-400">#{payment.id}</td>
                        <td className="p-4 font-medium text-slate-100">{payment.nombreUsuario}</td>
                        <td className="p-4 font-bold text-slate-100">
                          {formatCurrency(payment.montoCOP)}
                        </td>
                        <td className="p-4 text-slate-400 text-xs">
                          {new Date(payment.fechaPago).toLocaleDateString('es-CO')}
                        </td>
                        <td className="p-4 text-center">{getStatusBadge(payment.estado)}</td>
                        <td className="p-4 text-right space-x-2 whitespace-nowrap">
                          <button
                            onClick={() => handleDownloadReceipt(payment.id)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium bg-slate-800 text-slate-200 hover:bg-slate-700 border border-slate-700"
                          >
                            <FileText size={12} /> Anexo
                          </button>
                          {payment.tieneComprobante && payment.comprobanteUrl && (
                            <button
                              onClick={() => {
                                setSelectedPdfUrl(
                                  `${API_URL}/${payment.comprobanteUrl!.replace(/^\/+/, '')}`
                                );
                                setIsPdfModalOpen(true);
                              }}
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium bg-blue-600/20 text-blue-300 hover:bg-blue-600/30 border border-blue-500/30"
                            >
                              <Eye size={12} /> Ver Comprobante
                            </button>
                          )}
                          {payment.estado === 'PENDIENTE' && (
                            <>
                              <button
                                onClick={() => handleApprove(payment.id)}
                                className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold"
                              >
                                Aprobar
                              </button>
                              <button
                                onClick={() => setRejectingPayment(payment)}
                                className="px-3 py-1 bg-rose-600 text-white hover:bg-rose-500 rounded-lg text-xs font-semibold"
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
        </>
      )}

      {activeTab === 'manual' && (
        <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-6 max-w-2xl">
          <h3 className="font-bold text-lg text-slate-100 mb-4 flex items-center gap-2">
            <PlusCircle size={20} className="text-blue-400" /> Registrar Ingreso (Aprobado Inmediato)
          </h3>
          <form onSubmit={handleManualPaymentSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase text-slate-300 mb-1">
                Miembro
              </label>
              <select
                required
                className="w-full border border-slate-800 bg-slate-950 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 outline-none"
                value={manualPayment.usuarioId}
                onChange={(e) =>
                  setManualPayment({ ...manualPayment, usuarioId: e.target.value })
                }
              >
                <option value="">Seleccione el miembro...</option>
                {options.Members?.map((m: any) => (
                  <option key={m.id} value={m.id}>
                    {m.nombre} {m.apellido}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase text-slate-300 mb-1">
                Membresía a Pagar (Opcional)
              </label>
              <select
                className="w-full border border-slate-800 bg-slate-950 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 outline-none"
                value={manualPayment.membresiaId}
                onChange={(e) =>
                  setManualPayment({ ...manualPayment, membresiaId: e.target.value })
                }
              >
                <option value="">Ninguna - Cobro adicional</option>
                {manualPayment.usuarioId &&
                  options.Memberships?.filter(
                    (mem: any) => mem.usuarioId.toString() === manualPayment.usuarioId
                  ).map((mem: any) => (
                    <option key={mem.id} value={mem.id}>
                      Plan {mem.plan} - {mem.estado}
                    </option>
                  ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase text-slate-300 mb-1">
                Monto (COP)
              </label>
              <input
                type="number"
                required
                min="1000"
                value={manualPayment.montoCOP}
                onChange={(e) =>
                  setManualPayment({ ...manualPayment, montoCOP: e.target.value })
                }
                className="w-full border border-slate-800 bg-slate-950 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 outline-none"
                placeholder="120000"
              />
            </div>
            <button
              type="submit"
              className="bg-blue-600 text-white px-4 py-2.5 rounded-xl font-semibold text-sm w-full hover:bg-blue-500"
            >
              Registrar Pago en Sistema
            </button>
          </form>
        </div>
      )}

      {rejectingPayment && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl max-w-md w-full p-6">
            <h2 className="text-lg font-bold text-rose-400 flex items-center gap-2 mb-3">
              <AlertTriangle size={22} /> Rechazar Pago #{rejectingPayment.id}
            </h2>
            <form onSubmit={handleReject} className="space-y-4">
              <textarea
                required
                minLength={10}
                rows={3}
                value={comentario}
                onChange={(e) => setComentario(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-slate-100 outline-none"
                placeholder="Motivo del rechazo (mínimo 10 caracteres)..."
              />
              <div className="flex justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setRejectingPayment(null)}
                  className="px-4 py-2 text-xs font-semibold bg-slate-800 text-slate-200 rounded-xl"
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
