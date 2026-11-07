import React, { useState } from 'react';
import toast from 'react-hot-toast';
import {
  Plus,
  Edit2,
  Trash2,
  CalendarDays,
  Tags,
  AlertTriangle,
  X,
} from 'lucide-react';
import { usePlansViewModel } from '../../viewmodels/usePlansViewModel';
import ConfirmDialogModal, {
  useConfirmDialog,
} from '../../components/common/ConfirmDialogModal';

export default function PlansPage() {
  const { plans, loading, error, createPlan, updatePlan, deletePlan } = usePlansViewModel();

  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editingPlan, setEditingPlan] = useState<any>(null);
  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: '',
    precioCOP: 0,
    duracionDias: 30,
    activo: true,
  });

  const openCreateModal = () => {
    setEditingPlan(null);
    setFormData({
      nombre: '',
      descripcion: '',
      precioCOP: 0,
      duracionDias: 30,
      activo: true,
    });
    setShowModal(true);
  };

  const openEditModal = (plan: any) => {
    setEditingPlan(plan);
    setFormData({
      nombre: plan.nombre,
      descripcion: plan.descripcion,
      precioCOP: plan.precioCOP,
      duracionDias: plan.duracionDias,
      activo: plan.activo,
    });
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const success = editingPlan
      ? await updatePlan(editingPlan.id, formData)
      : await createPlan(formData);
    setSaving(false);

    if (success) {
      toast.success(editingPlan ? 'Plan actualizado.' : 'Nuevo plan creado.');
      setShowModal(false);
    }
  };

  const { requestConfirm, confirmDialogProps } = useConfirmDialog();

  const handleDelete = (id: number) => {
    requestConfirm({
      title: 'Desactivar plan de membresía',
      description:
        '¿Deseas desactivar este plan? Los deportistas que ya lo tienen activo conservarán su vigencia actual.',
      confirmLabel: 'Desactivar plan',
      variant: 'warning',
      onConfirm: async () => {
        const ok = await deletePlan(id);
        if (ok !== false) toast.success('Plan desactivado.');
      },
    });
  };

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
    }).format(amount);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between border-b border-slate-800 pb-4 gap-4">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-widest text-blue-400">
            Catálogo Comercial
          </span>
          <h1 className="text-2xl font-bold text-slate-100 mt-0.5 flex items-center gap-2">
            <Tags size={22} className="text-blue-400" /> Planes de Membresía
          </h1>
          <p className="text-slate-400 text-xs mt-1">
            Configura las modalidades de suscripción (mensual, trimestral, anual) disponibles en el club.
          </p>
        </div>
        <button
          type="button"
          onClick={openCreateModal}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-xl transition-colors shadow-sm self-start sm:self-auto"
        >
          <Plus size={16} /> Nuevo Plan
        </button>
      </div>

      {error && (
        <div className="p-4 bg-rose-500/10 border border-rose-500/30 text-rose-300 rounded-xl text-xs flex items-center gap-2">
          <AlertTriangle size={16} className="shrink-0" /> {error}
        </div>
      )}

      {loading && plans.length === 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 animate-pulse" aria-busy="true">
          {[1, 2, 3].map((k) => (
            <div key={k} className="h-56 bg-slate-900 border border-slate-800 rounded-2xl" />
          ))}
        </div>
      ) : plans.length === 0 ? (
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-12 text-center">
          <Tags size={30} className="mx-auto text-slate-600 mb-2" />
          <p className="text-slate-300 font-medium text-sm">No hay planes configurados</p>
          <p className="text-slate-500 text-xs mt-1">
            Crea el primer plan de membresía para asignar suscripciones.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className="bg-slate-900/90 rounded-2xl border border-slate-800 p-6 flex flex-col relative overflow-hidden"
            >
              <div className="flex items-start justify-between gap-2 mb-3">
                <h3 className="text-lg font-bold text-slate-100 uppercase tracking-wide">
                  {plan.nombre}
                </h3>
                <span
                  className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                    plan.activo
                      ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                      : 'bg-rose-500/15 text-rose-300 border border-rose-500/30'
                  }`}
                >
                  {plan.activo ? 'ACTIVO' : 'INACTIVO'}
                </span>
              </div>

              <p className="text-3xl font-bold text-blue-400 mb-3">
                {formatCurrency(plan.precioCOP)}
              </p>
              <p className="text-slate-400 text-xs mb-5 flex-1">{plan.descripcion}</p>

              <div className="flex items-center gap-2 text-slate-300 text-xs font-semibold mb-5">
                <CalendarDays size={15} className="text-blue-400" />
                Vigencia de {plan.duracionDias} días
              </div>

              <div className="flex gap-2 border-t border-slate-800 pt-4">
                <button
                  type="button"
                  onClick={() => openEditModal(plan)}
                  className="flex-1 inline-flex justify-center items-center gap-1.5 py-2 text-xs text-slate-200 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl font-semibold transition-colors"
                >
                  <Edit2 size={14} /> Editar
                </button>
                {plan.activo && (
                  <button
                    type="button"
                    onClick={() => handleDelete(plan.id)}
                    className="flex-1 inline-flex justify-center items-center gap-1.5 py-2 text-xs text-rose-300 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/25 rounded-xl font-semibold transition-colors"
                  >
                    <Trash2 size={14} /> Desactivar
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl max-w-md w-full p-6">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
              <h2 className="text-lg font-bold text-slate-100">
                {editingPlan ? 'Editar Plan' : 'Nuevo Plan de Membresía'}
              </h2>
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
                  Nombre del Plan
                </label>
                <input
                  required
                  type="text"
                  placeholder="Ej. Trimestral Competitivo"
                  value={formData.nombre}
                  onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                  className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm text-slate-100 outline-none focus:border-blue-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1">
                    Precio (COP)
                  </label>
                  <input
                    required
                    type="number"
                    min="0"
                    value={formData.precioCOP}
                    onChange={(e) =>
                      setFormData({ ...formData, precioCOP: Number(e.target.value) })
                    }
                    className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm text-slate-100 outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1">
                    Duración (Días)
                  </label>
                  <input
                    required
                    type="number"
                    min="1"
                    value={formData.duracionDias}
                    onChange={(e) =>
                      setFormData({ ...formData, duracionDias: Number(e.target.value) })
                    }
                    className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm text-slate-100 outline-none focus:border-blue-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1">
                  Beneficios incluidos
                </label>
                <textarea
                  required
                  rows={2}
                  placeholder="Descripción breve de lo que incluye el plan..."
                  value={formData.descripcion}
                  onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                  className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm text-slate-100 outline-none focus:border-blue-500 resize-none"
                />
              </div>
              <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer pt-1">
                <input
                  type="checkbox"
                  checked={formData.activo}
                  onChange={(e) => setFormData({ ...formData, activo: e.target.checked })}
                  className="rounded border-slate-700 bg-slate-950 text-blue-600 focus:ring-blue-500"
                />
                Plan habilitado para nuevas suscripciones
              </label>

              <div className="flex justify-end gap-2.5 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-300 bg-slate-800 hover:bg-slate-700 rounded-xl transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-2 text-xs font-semibold bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white rounded-xl transition-colors"
                >
                  {saving ? 'Guardando...' : 'Guardar Plan'}
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
