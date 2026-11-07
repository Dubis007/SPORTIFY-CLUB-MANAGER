import React, { useState } from 'react';
import toast from 'react-hot-toast';
import {
  ClipboardCheck,
  UserPlus,
  Edit2,
  Trash2,
  AlertTriangle,
  X,
} from 'lucide-react';
import { useRegistrationsViewModel } from '../../viewmodels/useRegistrationsViewModel';
import { Registration } from '../../models';
import ConfirmDialogModal, {
  useConfirmDialog,
} from '../../components/common/ConfirmDialogModal';

export default function RegistrationsPage() {
  const {
    registrations,
    options,
    loading,
    error,
    createRegistration,
    updateRegistration,
    deleteRegistration,
  } = useRegistrationsViewModel();
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editingRegistration, setEditingRegistration] = useState<Registration | null>(null);
  const [formData, setFormData] = useState({
    usuarioId: '',
    competenciaId: '',
    estado: 'PENDIENTE',
  });

  const handleAddNew = () => {
    setEditingRegistration(null);
    setFormData({ usuarioId: '', competenciaId: '', estado: 'PENDIENTE' });
    setShowModal(true);
  };

  const handleEdit = (registration: Registration) => {
    setEditingRegistration(registration);
    setFormData({
      usuarioId: registration.usuarioId.toString(),
      competenciaId: registration.competenciaId.toString(),
      estado: registration.estado,
    });
    setShowModal(true);
  };

  const { requestConfirm, confirmDialogProps } = useConfirmDialog();

  const handleDelete = (id: number) => {
    requestConfirm({
      title: 'Eliminar inscripción',
      description: '¿Deseas retirar esta inscripción de la competencia seleccionada?',
      confirmLabel: 'Sí, eliminar',
      variant: 'danger',
      onConfirm: async () => {
        const ok = await deleteRegistration(id);
        if (ok !== false) toast.success('Inscripción eliminada.');
      },
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const payload = {
      usuarioId: parseInt(formData.usuarioId, 10),
      competenciaId: parseInt(formData.competenciaId, 10),
      estado: formData.estado,
    };

    const success = editingRegistration
      ? await updateRegistration(editingRegistration.id, payload)
      : await createRegistration(payload);
    setSaving(false);

    if (success) {
      toast.success(editingRegistration ? 'Inscripción actualizada.' : 'Deportista inscrito.');
      setShowModal(false);
    }
  };

  const getBadgeStyle = (estado: string) => {
    switch (estado) {
      case 'CONFIRMADA':
        return 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30';
      case 'PAGO':
        return 'bg-blue-500/15 text-blue-300 border border-blue-500/30';
      case 'CANCELADA':
        return 'bg-rose-500/15 text-rose-300 border border-rose-500/30';
      default:
        return 'bg-amber-500/15 text-amber-300 border border-amber-500/30';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between border-b border-slate-800 pb-4 gap-4">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-widest text-blue-400">
            Convocatorias y Torneos
          </span>
          <h1 className="text-2xl font-bold text-slate-100 mt-0.5 flex items-center gap-2">
            <ClipboardCheck size={22} className="text-blue-400" /> Inscripciones a Competencias
          </h1>
          <p className="text-slate-400 text-xs mt-1">
            Inscribe deportistas con membresía activa y gestiona su estado de participación.
          </p>
        </div>
        <button
          type="button"
          onClick={handleAddNew}
          className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-4 py-2.5 rounded-xl text-xs font-semibold shadow-sm transition-colors self-start sm:self-auto"
        >
          <UserPlus size={16} /> Inscribir Deportista
        </button>
      </div>

      {error && (
        <div className="bg-rose-500/10 border border-rose-500/30 text-rose-300 p-4 rounded-xl text-xs flex items-center gap-2">
          <AlertTriangle size={16} className="shrink-0" /> {error}
        </div>
      )}

      {loading && registrations.length === 0 ? (
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
                <tr className="bg-slate-950/70 border-b border-slate-800 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  <th className="px-5 py-3.5">Deportista</th>
                  <th className="px-5 py-3.5">Competencia</th>
                  <th className="px-5 py-3.5">Fecha Registro</th>
                  <th className="px-5 py-3.5">Estado</th>
                  <th className="px-5 py-3.5 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80 text-sm">
                {registrations.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center">
                      <ClipboardCheck size={28} className="mx-auto text-slate-600 mb-2" />
                      <p className="text-slate-300 font-medium text-sm">
                        No hay inscripciones registradas
                      </p>
                      <p className="text-slate-500 text-xs mt-1">
                        Usa el botón superior para convocar o inscribir deportistas a un torneo.
                      </p>
                    </td>
                  </tr>
                ) : (
                  registrations.map((r) => (
                    <tr key={r.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="px-5 py-4">
                        <div className="font-semibold text-slate-100">
                          {r.usuarioNombre || `Deportista #${r.usuarioId}`}
                        </div>
                      </td>
                      <td className="px-5 py-4 text-slate-300 font-medium">
                        {r.competenciaNombre || `Competencia #${r.competenciaId}`}
                      </td>
                      <td className="px-5 py-4 text-xs text-slate-400">
                        {new Date(r.fechaInscripcion).toLocaleDateString('es-CO')}
                      </td>
                      <td className="px-5 py-4">
                        <span
                          className={`px-2.5 py-1 inline-flex text-xs font-semibold rounded-full ${getBadgeStyle(
                            r.estado
                          )}`}
                        >
                          {r.estado}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-right space-x-1.5 whitespace-nowrap">
                        <button
                          type="button"
                          onClick={() => handleEdit(r)}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors"
                          title="Cambiar estado"
                        >
                          <Edit2 size={13} /> Estado
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(r.id)}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/25 transition-colors"
                          title="Eliminar inscripción"
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
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
              <h3 className="text-lg font-bold text-slate-100">
                {editingRegistration ? 'Actualizar Inscripción' : 'Inscribir Deportista'}
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
                  Deportista
                </label>
                <select
                  required
                  disabled={!!editingRegistration}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 outline-none focus:border-blue-500 disabled:opacity-60"
                  value={formData.usuarioId}
                  onChange={(e) => setFormData({ ...formData, usuarioId: e.target.value })}
                >
                  <option value="">Seleccione un deportista...</option>
                  {options.members?.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.nombre} {m.apellido}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1">
                  Competencia
                </label>
                <select
                  required
                  disabled={!!editingRegistration}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 outline-none focus:border-blue-500 disabled:opacity-60"
                  value={formData.competenciaId}
                  onChange={(e) => setFormData({ ...formData, competenciaId: e.target.value })}
                >
                  <option value="">Seleccione un torneo...</option>
                  {options.competitions?.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.nombre} ({new Date(c.fechaInicio).toLocaleDateString('es-CO')})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1">
                  Estado
                </label>
                <select
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 outline-none focus:border-blue-500"
                  value={formData.estado}
                  onChange={(e) => setFormData({ ...formData, estado: e.target.value })}
                >
                  <option value="PENDIENTE">PENDIENTE</option>
                  <option value="CONFIRMADA">CONFIRMADA</option>
                  <option value="PAGO">PAGO</option>
                  <option value="CANCELADA">CANCELADA</option>
                </select>
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
                  {saving ? 'Guardando...' : 'Guardar'}
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
