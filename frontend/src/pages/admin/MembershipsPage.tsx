import React, { useState } from 'react';
import toast from 'react-hot-toast';
import {
  Plus,
  CreditCard,
  Check,
  X,
  Clock,
  AlertTriangle,
} from 'lucide-react';
import { useMembershipsViewModel } from '../../viewmodels/useMembershipsViewModel';
import { useUsersViewModel } from '../../viewmodels/useUsersViewModel';
import { CreateMembershipDto } from '../../services/api/membershipService';
import { UserRole } from '../../models';

export default function MembershipsPage() {
  const { memberships, plans, loading, error, createMembership, updateStatus } =
    useMembershipsViewModel();
  const { users } = useUsersViewModel();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    usuarioId: 0,
    planMembresiaId: 0,
    fechaInicio: new Date().toISOString().split('T')[0],
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.usuarioId || !formData.planMembresiaId) {
      toast.error('Selecciona un deportista y un plan de membresía.');
      return;
    }

    setSaving(true);
    const createDto: CreateMembershipDto = {
      usuarioId: formData.usuarioId,
      planMembresiaId: formData.planMembresiaId,
      fechaInicio: new Date(formData.fechaInicio).toISOString(),
    };

    const success = await createMembership(createDto);
    setSaving(false);
    if (success) {
      toast.success('Membresía asignada exitosamente.');
      setIsModalOpen(false);
      setFormData({
        usuarioId: 0,
        planMembresiaId: 0,
        fechaInicio: new Date().toISOString().split('T')[0],
      });
    }
  };

  const handleStatusChange = async (id: number, status: string) => {
    await updateStatus(id, status);
    toast.success(`Estado actualizado a ${status}.`);
  };

  const getStatusBadge = (estado: string) => {
    switch (estado) {
      case 'ACTIVA':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
            <Check size={12} /> Activa
          </span>
        );
      case 'VENCIDA':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-500/15 text-rose-300 border border-rose-500/30">
            <X size={12} /> Vencida
          </span>
        );
      case 'SUSPENDIDA':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-500/15 text-amber-300 border border-amber-500/30">
            <AlertTriangle size={12} /> Suspendida
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-800 text-slate-300 border border-slate-700">
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

  const formatDate = (dateString: string) => new Date(dateString).toLocaleDateString('es-CO');

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between border-b border-slate-800 pb-4 gap-4">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-widest text-blue-400">
            Suscripciones del Club
          </span>
          <h1 className="text-2xl font-bold text-slate-100 mt-0.5 flex items-center gap-2">
            <CreditCard size={22} className="text-blue-400" /> Gestión de Membresías
          </h1>
          <p className="text-slate-400 text-xs mt-1">
            Asigna planes activos y controla la vigencia de suscripciones de los deportistas.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold transition-colors shadow-sm self-start sm:self-auto"
        >
          <Plus size={16} /> Asignar Membresía
        </button>
      </div>

      {error && (
        <div className="p-4 bg-rose-500/10 border border-rose-500/30 text-rose-300 rounded-xl text-xs flex items-center gap-2">
          <AlertTriangle size={16} className="shrink-0" /> {error}
        </div>
      )}

      {/* Resumen compacto de planes disponibles */}
      {plans.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className="bg-slate-900/90 rounded-2xl p-5 border border-slate-800 flex items-center justify-between gap-4"
            >
              <div className="min-w-0">
                <p className="text-xs font-bold uppercase tracking-wider text-blue-400 truncate">
                  {plan.nombre}
                </p>
                <p className="text-xl font-bold text-slate-100 mt-1">
                  {formatCurrency(plan.precioCOP)}
                </p>
                <p className="text-xs text-slate-400 mt-0.5">{plan.duracionDias} días de vigencia</p>
              </div>
              <div className="w-10 h-10 bg-blue-500/15 border border-blue-500/30 text-blue-400 rounded-xl flex items-center justify-center shrink-0">
                <CreditCard size={18} />
              </div>
            </div>
          ))}
        </div>
      )}

      {loading && memberships.length === 0 ? (
        <div className="space-y-3 animate-pulse" aria-busy="true">
          {[1, 2, 3, 4].map((row) => (
            <div key={row} className="h-16 bg-slate-900 border border-slate-800 rounded-xl" />
          ))}
        </div>
      ) : (
        <div className="bg-slate-900/90 rounded-2xl border border-slate-800 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-950/70 border-b border-slate-800 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  <th className="px-5 py-3.5">Deportista</th>
                  <th className="px-5 py-3.5">Plan</th>
                  <th className="px-5 py-3.5">Inicio</th>
                  <th className="px-5 py-3.5">Vencimiento</th>
                  <th className="px-5 py-3.5 text-center">Estado</th>
                  <th className="px-5 py-3.5 text-right">Cambiar Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80 text-sm">
                {memberships.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center">
                      <CreditCard size={28} className="mx-auto text-slate-600 mb-2" />
                      <p className="text-slate-300 font-medium text-sm">
                        No hay membresías asignadas
                      </p>
                      <p className="text-slate-500 text-xs mt-1">
                        Asigna un plan a un deportista para habilitar su participación en el club.
                      </p>
                    </td>
                  </tr>
                ) : (
                  memberships.map((membership) => (
                    <tr
                      key={membership.id}
                      className="hover:bg-slate-800/40 transition-colors"
                    >
                      <td className="px-5 py-4 font-semibold text-slate-100">
                        {membership.usuarioNombre}
                      </td>
                      <td className="px-5 py-4 text-slate-300 text-xs font-medium">
                        {membership.planNombre}
                      </td>
                      <td className="px-5 py-4 text-slate-400 text-xs">
                        {formatDate(membership.fechaInicio)}
                      </td>
                      <td className="px-5 py-4 text-slate-400 text-xs">
                        {formatDate(membership.fechaFin)}
                      </td>
                      <td className="px-5 py-4 text-center">{getStatusBadge(membership.estado)}</td>
                      <td className="px-5 py-4 text-right">
                        <select
                          aria-label={`Estado membresía de ${membership.usuarioNombre}`}
                          className="text-xs bg-slate-950 border border-slate-700 text-slate-200 rounded-lg px-2.5 py-1.5 outline-none focus:border-blue-500"
                          value={membership.estado}
                          onChange={(e) => handleStatusChange(membership.id, e.target.value)}
                        >
                          <option value="ACTIVA">Activa</option>
                          <option value="SUSPENDIDA">Suspendida</option>
                          <option value="VENCIDA">Vencida</option>
                        </select>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl max-w-md w-full p-6">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
              <h2 className="text-lg font-bold text-slate-100">Asignar Nueva Membresía</h2>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-200 p-1"
                aria-label="Cerrar"
              >
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1">
                  Deportista
                </label>
                <select
                  required
                  value={formData.usuarioId}
                  onChange={(e) =>
                    setFormData({ ...formData, usuarioId: Number(e.target.value) })
                  }
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-slate-100 outline-none focus:border-blue-500"
                >
                  <option value={0}>Selecciona un deportista activo...</option>
                  {users
                    .filter((u) => u.activo && u.rol === UserRole.MIEMBRO)
                    .map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.nombre} {u.apellido} ({u.correo})
                      </option>
                    ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1">
                  Plan de Membresía
                </label>
                <select
                  required
                  value={formData.planMembresiaId}
                  onChange={(e) =>
                    setFormData({ ...formData, planMembresiaId: Number(e.target.value) })
                  }
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-slate-100 outline-none focus:border-blue-500"
                >
                  <option value={0}>Selecciona un plan...</option>
                  {plans.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.nombre} — {formatCurrency(p.precioCOP)} ({p.duracionDias} días)
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1">
                  Fecha de Inicio
                </label>
                <input
                  type="date"
                  required
                  value={formData.fechaInicio}
                  onChange={(e) => setFormData({ ...formData, fechaInicio: e.target.value })}
                  className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm text-slate-100 outline-none focus:border-blue-500"
                />
              </div>

              <div className="flex justify-end gap-2.5 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-300 bg-slate-800 hover:bg-slate-700 rounded-xl transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-2 text-xs font-semibold bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white rounded-xl transition-colors"
                >
                  {saving ? 'Asignando...' : 'Asignar Membresía'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
