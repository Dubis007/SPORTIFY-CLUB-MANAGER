import React, { useState } from 'react';
import toast from 'react-hot-toast';
import {
  Plus,
  Edit2,
  Trash2,
  Download,
  MapPin,
  Phone,
  Building2,
  AlertTriangle,
  X,
} from 'lucide-react';
import { useLocationsViewModel } from '../../viewmodels/useLocationsViewModel';
import ConfirmDialogModal, {
  useConfirmDialog,
} from '../../components/common/ConfirmDialogModal';

export default function LocationsPage() {
  const {
    locations,
    loading,
    error,
    createLocation,
    updateLocation,
    deleteLocation,
    downloadReport,
  } = useLocationsViewModel();

  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editingLocation, setEditingLocation] = useState<any>(null);
  const [formData, setFormData] = useState({
    nombre: '',
    direccion: '',
    ciudad: '',
    telefono: '',
    activo: true,
  });

  const openCreateModal = () => {
    setEditingLocation(null);
    setFormData({ nombre: '', direccion: '', ciudad: '', telefono: '', activo: true });
    setShowModal(true);
  };

  const openEditModal = (loc: any) => {
    setEditingLocation(loc);
    setFormData({
      nombre: loc.nombre,
      direccion: loc.direccion,
      ciudad: loc.ciudad,
      telefono: loc.telefono || '',
      activo: loc.activo,
    });
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const success = editingLocation
      ? await updateLocation(editingLocation.id, formData)
      : await createLocation(formData);
    setSaving(false);

    if (success) {
      toast.success(editingLocation ? 'Sede actualizada.' : 'Nueva sede registrada.');
      setShowModal(false);
    }
  };

  const { requestConfirm, confirmDialogProps } = useConfirmDialog();

  const handleDelete = (id: number) => {
    requestConfirm({
      title: 'Desactivar sede deportiva',
      description: '¿Deseas desactivar operativamente esta sede del club?',
      confirmLabel: 'Desactivar sede',
      variant: 'warning',
      onConfirm: async () => {
        const ok = await deleteLocation(id);
        if (ok !== false) toast.success('Sede desactivada.');
      },
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between border-b border-slate-800 pb-4 gap-4">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-widest text-blue-400">
            Infraestructura Física
          </span>
          <h1 className="text-2xl font-bold text-slate-100 mt-0.5 flex items-center gap-2">
            <Building2 size={22} className="text-blue-400" /> Sedes e Instalaciones
          </h1>
          <p className="text-slate-400 text-xs mt-1">
            Administra los escenarios deportivos y sedes operativas del club.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={downloadReport}
            className="inline-flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-100 border border-slate-700 text-xs font-semibold rounded-xl transition-colors"
          >
            <Download size={15} className="text-blue-400" /> Reporte PDF
          </button>
          <button
            type="button"
            onClick={openCreateModal}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-xl transition-colors shadow-sm"
          >
            <Plus size={16} /> Nueva Sede
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-rose-500/10 border border-rose-500/30 text-rose-300 rounded-xl text-xs flex items-center gap-2">
          <AlertTriangle size={16} className="shrink-0" /> {error}
        </div>
      )}

      {loading && locations.length === 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 animate-pulse" aria-busy="true">
          {[1, 2, 3].map((k) => (
            <div key={k} className="h-56 bg-slate-900 border border-slate-800 rounded-2xl" />
          ))}
        </div>
      ) : locations.length === 0 ? (
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-12 text-center">
          <Building2 size={30} className="mx-auto text-slate-600 mb-2" />
          <p className="text-slate-300 font-medium text-sm">No hay sedes registradas</p>
          <p className="text-slate-500 text-xs mt-1">
            Registra la primera sede del club para asociar entrenamientos y deportistas.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {locations.map((loc) => (
            <div
              key={loc.id}
              className="bg-slate-900/90 rounded-2xl border border-slate-800 p-6 flex flex-col"
            >
              <div className="flex justify-between items-start gap-2 mb-4">
                <h3 className="text-lg font-bold text-slate-100">{loc.nombre}</h3>
                <span
                  className={`px-2.5 py-0.5 rounded-full text-xs font-bold shrink-0 ${
                    loc.activo
                      ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                      : 'bg-rose-500/15 text-rose-300 border border-rose-500/30'
                  }`}
                >
                  {loc.activo ? 'ACTIVA' : 'INACTIVA'}
                </span>
              </div>

              <div className="space-y-2.5 flex-1 mb-5 text-xs text-slate-300">
                <p className="flex items-center gap-2">
                  <MapPin size={14} className="text-blue-400 shrink-0" />
                  <span>
                    {loc.ciudad} · {loc.direccion}
                  </span>
                </p>
                <p className="flex items-center gap-2 text-slate-400">
                  <Phone size={14} className="text-slate-500 shrink-0" />
                  <span>{loc.telefono || 'Sin teléfono registrado'}</span>
                </p>

                <div className="pt-4 mt-4 border-t border-slate-800 grid grid-cols-2 gap-3">
                  <div className="bg-slate-950/70 border border-slate-800/80 rounded-xl p-2.5 text-center">
                    <p className="text-xl font-bold text-blue-400">{loc.usuariosActivos ?? 0}</p>
                    <p className="text-[11px] text-slate-400 font-semibold uppercase">Miembros</p>
                  </div>
                  <div className="bg-slate-950/70 border border-slate-800/80 rounded-xl p-2.5 text-center">
                    <p className="text-xl font-bold text-slate-200">{loc.empleados ?? 0}</p>
                    <p className="text-[11px] text-slate-400 font-semibold uppercase">Staff</p>
                  </div>
                </div>
              </div>

              <div className="flex gap-2 justify-end pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => openEditModal(loc)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-200 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg transition-colors"
                >
                  <Edit2 size={13} /> Editar
                </button>
                {loc.activo && (
                  <button
                    type="button"
                    onClick={() => handleDelete(loc.id)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-rose-300 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/25 rounded-lg transition-colors"
                  >
                    <Trash2 size={13} /> Desactivar
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
                {editingLocation ? 'Editar Sede' : 'Nueva Sede'}
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
                  Nombre de la Sede
                </label>
                <input
                  required
                  type="text"
                  placeholder="Ej. Sede Norte Principal"
                  value={formData.nombre}
                  onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                  className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm text-slate-100 outline-none focus:border-blue-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1">
                    Ciudad
                  </label>
                  <input
                    required
                    type="text"
                    value={formData.ciudad}
                    onChange={(e) => setFormData({ ...formData, ciudad: e.target.value })}
                    className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm text-slate-100 outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1">
                    Teléfono
                  </label>
                  <input
                    type="text"
                    value={formData.telefono}
                    onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
                    className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm text-slate-100 outline-none focus:border-blue-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1">
                  Dirección
                </label>
                <input
                  required
                  type="text"
                  value={formData.direccion}
                  onChange={(e) => setFormData({ ...formData, direccion: e.target.value })}
                  className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm text-slate-100 outline-none focus:border-blue-500"
                />
              </div>
              <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer pt-1">
                <input
                  type="checkbox"
                  checked={formData.activo}
                  onChange={(e) => setFormData({ ...formData, activo: e.target.checked })}
                  className="rounded border-slate-700 bg-slate-950 text-blue-600 focus:ring-blue-500"
                />
                Sede habilitada operativamente
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
                  {saving ? 'Guardando...' : 'Guardar Sede'}
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
