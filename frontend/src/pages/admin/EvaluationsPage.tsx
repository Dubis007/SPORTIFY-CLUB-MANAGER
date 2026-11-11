import React, { useState } from 'react';
import toast from 'react-hot-toast';
import {
  Star,
  Plus,
  Edit2,
  Trash2,
  AlertTriangle,
  X,
} from 'lucide-react';
import { useEvaluationsViewModel } from '../../viewmodels/useEvaluationsViewModel';
import { Evaluation } from '../../models';
import { escapeSafeText } from '../../utils/xssSanitizer';
import Pagination from '../../components/Pagination';
import ConfirmDialogModal, {
  useConfirmDialog,
} from '../../components/common/ConfirmDialogModal';

export default function EvaluationsPage() {
  const {
    evaluations,
    options,
    loading,
    error,
    page,
    pageSize,
    totalCount,
    totalPages,
    setPage,
    changePageSize,
    createEvaluation,
    updateEvaluation,
    deleteEvaluation,
  } = useEvaluationsViewModel();
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editingEvaluation, setEditingEvaluation] = useState<Evaluation | null>(null);

  const [formData, setFormData] = useState({
    inscripcionId: '',
    puntaje: '',
    desempeno: 'Bueno',
    comentarios: '',
  });

  const handleAddNew = () => {
    setEditingEvaluation(null);
    setFormData({ inscripcionId: '', puntaje: '8.0', desempeno: 'Bueno', comentarios: '' });
    setShowModal(true);
  };

  const handleEdit = (evaluation: Evaluation) => {
    setEditingEvaluation(evaluation);
    setFormData({
      inscripcionId: evaluation.inscripcionId.toString(),
      puntaje: evaluation.puntaje?.toString() || '0',
      desempeno: evaluation.desempeno || 'Bueno',
      comentarios: evaluation.comentarios || '',
    });
    setShowModal(true);
  };

  const { requestConfirm, confirmDialogProps } = useConfirmDialog();

  const handleDelete = (id: number) => {
    requestConfirm({
      title: 'Eliminar observación técnica',
      description: '¿Deseas eliminar definitivamente este registro de evaluación deportiva?',
      confirmLabel: 'Sí, eliminar',
      variant: 'danger',
      onConfirm: async () => {
        const ok = await deleteEvaluation(id);
        if (ok !== false) toast.success('Observación eliminada.');
      },
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const payload = {
      inscripcionId: parseInt(formData.inscripcionId, 10),
      puntaje: parseFloat(formData.puntaje) || 0,
      desempeno: formData.desempeno,
      comentarios: formData.comentarios,
    };

    const success = editingEvaluation
      ? await updateEvaluation(editingEvaluation.id, payload)
      : await createEvaluation(payload);
    setSaving(false);

    if (success) {
      toast.success(editingEvaluation ? 'Observación actualizada.' : 'Observación registrada.');
      setShowModal(false);
    }
  };

  const getPerformanceBadge = (desempeno?: string) => {
    switch (desempeno) {
      case 'SOBRESALIENTE':
        return 'bg-violet-500/15 text-violet-300 border border-violet-500/30';
      case 'Excelente':
        return 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30';
      case 'Bueno':
        return 'bg-blue-500/15 text-blue-300 border border-blue-500/30';
      default:
        return 'bg-amber-500/15 text-amber-300 border border-amber-500/30';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between border-b border-slate-800 pb-4 gap-4">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-widest text-blue-400">
            Seguimiento Técnico
          </span>
          <h1 className="text-2xl font-bold text-slate-100 mt-0.5 flex items-center gap-2">
            <Star size={22} className="text-amber-400" /> Observaciones y Puntajes
          </h1>
          <p className="text-slate-400 text-xs mt-1">
            Evalúa el rendimiento de los deportistas en sus competencias confirmadas.
          </p>
        </div>
        <button
          type="button"
          onClick={handleAddNew}
          className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-4 py-2.5 rounded-xl text-xs font-semibold shadow-sm transition-colors self-start sm:self-auto"
        >
          <Plus size={16} /> Nueva Observación
        </button>
      </div>

      {error && (
        <div className="bg-rose-500/10 border border-rose-500/30 text-rose-300 p-4 rounded-xl text-xs flex items-center gap-2">
          <AlertTriangle size={16} className="shrink-0" /> {error}
        </div>
      )}

      {loading && evaluations.length === 0 ? (
        <div className="space-y-3 animate-pulse" aria-busy="true">
          {[1, 2, 3, 4].map((row) => (
            <div key={row} className="h-16 bg-slate-900 border border-slate-800 rounded-xl" />
          ))}
        </div>
      ) : (
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-950/70 border-b border-slate-800 text-xs text-slate-400 uppercase tracking-wider">
                  <th className="px-5 py-3.5 font-semibold">Deportista</th>
                  <th className="px-5 py-3.5 font-semibold">Competencia</th>
                  <th className="px-5 py-3.5 font-semibold">Puntaje</th>
                  <th className="px-5 py-3.5 font-semibold">Desempeño</th>
                  <th className="px-5 py-3.5 font-semibold">Observaciones</th>
                  <th className="px-5 py-3.5 font-semibold">Fecha</th>
                  <th className="px-5 py-3.5 font-semibold text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80 text-sm">
                {evaluations.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center">
                      <Star size={28} className="mx-auto text-slate-600 mb-2" />
                      <p className="text-slate-300 font-medium text-sm">
                        Sin observaciones registradas
                      </p>
                      <p className="text-slate-500 text-xs mt-1">
                        Registra puntajes y comentarios técnicos tras cada torneo.
                      </p>
                    </td>
                  </tr>
                ) : (
                  evaluations.map((e) => (
                    <tr key={e.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="px-5 py-4 font-semibold text-slate-100">
                        {e.usuarioNombre || `Inscripción #${e.inscripcionId}`}
                      </td>
                      <td className="px-5 py-4 text-xs text-slate-300">
                        {e.competenciaNombre || '-'}
                      </td>
                      <td className="px-5 py-4 font-bold text-amber-300">{e.puntaje}</td>
                      <td className="px-5 py-4">
                        <span
                          className={`px-2.5 py-1 inline-flex text-xs font-semibold rounded-full ${getPerformanceBadge(
                            e.desempeno
                          )}`}
                        >
                          {e.desempeno || 'N/A'}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-xs text-slate-300 max-w-xs truncate">
                        {e.comentarios ? escapeSafeText(e.comentarios) : <span className="text-slate-500">Sin comentarios</span>}
                      </td>
                      <td className="px-5 py-4 text-xs text-slate-400 whitespace-nowrap">
                        {new Date(e.evaluadoEn).toLocaleDateString('es-CO')}
                      </td>
                      <td className="px-5 py-4 text-right space-x-1.5 whitespace-nowrap">
                        <button
                          type="button"
                          onClick={() => handleEdit(e)}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors"
                          title="Editar observación"
                        >
                          <Edit2 size={13} /> Editar
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(e.id)}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/25 transition-colors"
                          title="Eliminar observación"
                        >
                          <Trash2 size={13} />
                        </button>
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
      )}

      {showModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
              <h3 className="text-lg font-bold text-slate-100">
                {editingEvaluation ? 'Editar Observación' : 'Nueva Observación Técnica'}
              </h3>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="text-slate-400 hover:text-slate-200 p-1"
                aria-label="Cerrar"
              >
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1">
                  Participación / Deportista
                </label>
                <select
                  required
                  disabled={!!editingEvaluation}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 outline-none focus:border-blue-500 disabled:opacity-60"
                  value={formData.inscripcionId}
                  onChange={(e) => setFormData({ ...formData, inscripcionId: e.target.value })}
                >
                  <option value="">Seleccione una inscripción confirmada...</option>
                  {options?.map((opt) => (
                    <option key={opt.id} value={opt.id}>
                      {opt.usuarioNombre} — {opt.competenciaNombre} (
                      {new Date(opt.fechaInicio).toLocaleDateString('es-CO')})
                    </option>
                  ))}
                </select>
                {options?.length === 0 && !editingEvaluation && (
                  <p className="text-xs text-amber-400 mt-1">
                    No hay inscripciones confirmadas o pagas pendientes por evaluar.
                  </p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1">
                    Puntaje (0 - 10)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    max="10"
                    required
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-sm text-slate-100 outline-none focus:border-blue-500"
                    placeholder="9.0"
                    value={formData.puntaje}
                    onChange={(e) => setFormData({ ...formData, puntaje: e.target.value })}
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1">
                    Nivel de Desempeño
                  </label>
                  <select
                    required
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-sm text-slate-100 outline-none focus:border-blue-500"
                    value={formData.desempeno}
                    onChange={(e) => setFormData({ ...formData, desempeno: e.target.value })}
                  >
                    <option value="Mejorar">Mejorar</option>
                    <option value="Bueno">Bueno</option>
                    <option value="Excelente">Excelente</option>
                    <option value="SOBRESALIENTE">SOBRESALIENTE</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1">
                  Comentarios Opcionales
                </label>
                <textarea
                  rows={3}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-sm text-slate-100 outline-none focus:border-blue-500 resize-none"
                  placeholder="Aspectos destacados o recomendaciones para el deportista..."
                  value={formData.comentarios}
                  onChange={(e) => setFormData({ ...formData, comentarios: e.target.value })}
                />
              </div>

              <div className="flex justify-end gap-2.5 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white transition-colors"
                >
                  {saving ? 'Guardando...' : 'Guardar Observación'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ConfirmDialogModal {...confirmDialogProps} />
    </div>
  );
}
