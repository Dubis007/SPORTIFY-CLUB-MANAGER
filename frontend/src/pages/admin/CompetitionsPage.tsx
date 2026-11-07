import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import {
  Trophy,
  Plus,
  Edit2,
  Trash2,
  MapPin,
  Calendar,
  AlertTriangle,
  X,
} from 'lucide-react';
import { useCompetitionsViewModel } from '../../viewmodels/useCompetitionsViewModel';
import { competitionSchema } from '../../validations/schemas';
import { Competition } from '../../models';
import ConfirmDialogModal, {
  useConfirmDialog,
} from '../../components/common/ConfirmDialogModal';

type CompetitionFormInputs = z.infer<typeof competitionSchema>;

export default function CompetitionsPage() {
  const {
    competitions,
    loading,
    error,
    createCompetition,
    updateCompetition,
    deleteCompetition,
  } = useCompetitionsViewModel();
  const [showModal, setShowModal] = useState(false);
  const [editingComp, setEditingComp] = useState<Competition | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CompetitionFormInputs>({
    resolver: zodResolver(competitionSchema),
  });

  const handleEdit = (comp: Competition) => {
    setEditingComp(comp);
    reset({
      nombre: comp.nombre,
      fechaInicio: comp.fechaInicio.substring(0, 16),
      fechaFin: comp.fechaFin.substring(0, 16),
      ubicacion: comp.ubicacion,
      descripcion: comp.descripcion || '',
    });
    setShowModal(true);
  };

  const handleAddNew = () => {
    setEditingComp(null);
    reset({ nombre: '', fechaInicio: '', fechaFin: '', ubicacion: '', descripcion: '' });
    setShowModal(true);
  };

  const { requestConfirm, confirmDialogProps } = useConfirmDialog();

  const handleDelete = (id: number) => {
    requestConfirm({
      title: 'Eliminar competencia',
      description: '¿Deseas eliminar esta competencia del calendario oficial del club?',
      confirmLabel: 'Sí, eliminar',
      variant: 'danger',
      onConfirm: async () => {
        const ok = await deleteCompetition(id);
        if (ok !== false) toast.success('Competencia eliminada.');
      },
    });
  };

  const onSubmit = async (data: CompetitionFormInputs) => {
    const success = editingComp
      ? await updateCompetition(editingComp.id, data)
      : await createCompetition(data);

    if (success) {
      toast.success(editingComp ? 'Competencia actualizada.' : 'Competencia programada.');
      setShowModal(false);
      reset();
    }
  };

  const getStatusInfo = (comp: Competition) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const startDate = new Date(comp.fechaInicio);
    startDate.setHours(0, 0, 0, 0);

    const diffDays = Math.ceil((startDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      return {
        text: 'HOY',
        color: 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30',
      };
    }
    if (diffDays > 0) {
      return {
        text: `En ${diffDays} ${diffDays === 1 ? 'día' : 'días'}`,
        color: 'bg-blue-500/15 text-blue-300 border border-blue-500/30',
      };
    }
    if (new Date() > new Date(comp.fechaFin)) {
      return {
        text: 'FINALIZADA',
        color: 'bg-slate-800 text-slate-400 border border-slate-700',
      };
    }
    return {
      text: 'EN CURSO',
      color: 'bg-amber-500/15 text-amber-300 border border-amber-500/30',
    };
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between border-b border-slate-800 pb-4 gap-4">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-widest text-blue-400">
            Operación Deportiva
          </span>
          <h1 className="text-2xl font-bold text-slate-100 mt-0.5 flex items-center gap-2">
            <Trophy size={22} className="text-rose-400" /> Competencias y Torneos
          </h1>
          <p className="text-slate-400 text-xs mt-1">
            Programa los torneos oficiales y eventos competitivos del club.
          </p>
        </div>
        <button
          type="button"
          onClick={handleAddNew}
          className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-4 py-2.5 rounded-xl text-xs font-semibold shadow-sm transition-colors self-start sm:self-auto"
        >
          <Plus size={16} /> Nueva Competencia
        </button>
      </div>

      {error && (
        <div className="bg-rose-500/10 border border-rose-500/30 text-rose-300 rounded-xl p-4 text-xs flex items-center gap-2">
          <AlertTriangle size={16} className="shrink-0" /> {error}
        </div>
      )}

      {loading && competitions.length === 0 ? (
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
                  <th className="px-5 py-3.5">Competencia</th>
                  <th className="px-5 py-3.5">Fecha y Hora</th>
                  <th className="px-5 py-3.5">Ubicación</th>
                  <th className="px-5 py-3.5">Estado</th>
                  <th className="px-5 py-3.5 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80 text-sm">
                {competitions.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center">
                      <Trophy size={28} className="mx-auto text-slate-600 mb-2" />
                      <p className="text-slate-300 font-medium text-sm">
                        Aún no hay competencias programadas
                      </p>
                      <p className="text-slate-500 text-xs mt-1">
                        Crea el próximo torneo para habilitar inscripciones de deportistas.
                      </p>
                    </td>
                  </tr>
                ) : (
                  competitions.map((comp) => {
                    const status = getStatusInfo(comp);
                    const fecha = new Date(comp.fechaInicio);
                    return (
                      <tr key={comp.id} className="hover:bg-slate-800/40 transition-colors">
                        <td className="px-5 py-4">
                          <div className="font-semibold text-slate-100">{comp.nombre}</div>
                          {comp.descripcion && (
                            <div className="text-xs text-slate-400 mt-0.5 line-clamp-1">
                              {comp.descripcion}
                            </div>
                          )}
                        </td>
                        <td className="px-5 py-4 whitespace-nowrap text-slate-300 text-xs">
                          <div className="inline-flex items-center gap-1.5 font-medium">
                            <Calendar size={13} className="text-blue-400" />
                            {fecha.toLocaleDateString('es-CO')}
                          </div>
                          <div className="text-slate-500 mt-0.5">
                            {fecha.toLocaleTimeString('es-CO', {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </div>
                        </td>
                        <td className="px-5 py-4 text-slate-300 text-xs">
                          <span className="inline-flex items-center gap-1.5">
                            <MapPin size={13} className="text-rose-400 shrink-0" />
                            {comp.ubicacion}
                          </span>
                        </td>
                        <td className="px-5 py-4 whitespace-nowrap">
                          <span
                            className={`px-2.5 py-1 inline-flex text-xs font-semibold rounded-full ${status.color}`}
                          >
                            {status.text}
                          </span>
                        </td>
                        <td className="px-5 py-4 whitespace-nowrap text-right space-x-1.5">
                          <button
                            type="button"
                            onClick={() => handleEdit(comp)}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors"
                            title="Editar competencia"
                          >
                            <Edit2 size={13} /> Editar
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(comp.id)}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/25 transition-colors"
                            title="Eliminar competencia"
                          >
                            <Trash2 size={13} />
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal Conciso */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
              <h3 className="text-lg font-bold text-slate-100">
                {editingComp ? 'Editar Competencia' : 'Nueva Competencia'}
              </h3>
              <button
                type="button"
                onClick={() => {
                  setShowModal(false);
                  reset();
                }}
                className="text-slate-400 hover:text-slate-200 p-1"
                aria-label="Cerrar"
              >
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1">
                  Nombre del Torneo
                </label>
                <input
                  type="text"
                  placeholder="Ej. Copa Departamental de Otoño"
                  className={`w-full bg-slate-950 border ${
                    errors.nombre ? 'border-rose-500' : 'border-slate-800'
                  } rounded-xl px-3.5 py-2 text-sm text-slate-100 outline-none focus:border-blue-500`}
                  {...register('nombre')}
                />
                {errors.nombre && (
                  <p className="text-rose-400 text-xs mt-1">{errors.nombre.message}</p>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1">
                    Inicio
                  </label>
                  <input
                    type="datetime-local"
                    className={`w-full bg-slate-950 border ${
                      errors.fechaInicio ? 'border-rose-500' : 'border-slate-800'
                    } rounded-xl px-3 py-2 text-xs text-slate-100 outline-none focus:border-blue-500`}
                    {...register('fechaInicio')}
                  />
                  {errors.fechaInicio && (
                    <p className="text-rose-400 text-xs mt-1">{errors.fechaInicio.message}</p>
                  )}
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1">
                    Cierre
                  </label>
                  <input
                    type="datetime-local"
                    className={`w-full bg-slate-950 border ${
                      errors.fechaFin ? 'border-rose-500' : 'border-slate-800'
                    } rounded-xl px-3 py-2 text-xs text-slate-100 outline-none focus:border-blue-500`}
                    {...register('fechaFin')}
                  />
                  {errors.fechaFin && (
                    <p className="text-rose-400 text-xs mt-1">{errors.fechaFin.message}</p>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1">
                  Lugar / Escenario
                </label>
                <input
                  type="text"
                  placeholder="Ej. Patinódromo Municipal Norte"
                  className={`w-full bg-slate-950 border ${
                    errors.ubicacion ? 'border-rose-500' : 'border-slate-800'
                  } rounded-xl px-3.5 py-2 text-sm text-slate-100 outline-none focus:border-blue-500`}
                  {...register('ubicacion')}
                />
                {errors.ubicacion && (
                  <p className="text-rose-400 text-xs mt-1">{errors.ubicacion.message}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1">
                  Notas breves (Opcional)
                </label>
                <textarea
                  rows={2}
                  placeholder="Categorías convocadas o requisitos..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-sm text-slate-100 outline-none focus:border-blue-500 resize-none"
                  {...register('descripcion')}
                />
              </div>

              <div className="flex justify-end gap-2.5 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    reset();
                  }}
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white transition-colors"
                >
                  {isSubmitting ? 'Guardando...' : 'Guardar Competencia'}
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
