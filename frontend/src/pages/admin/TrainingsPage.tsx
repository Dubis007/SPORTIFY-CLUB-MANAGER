import React, { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import {
  Plus,
  ClipboardCheck,
  Lock,
  Pencil,
  Trash2,
  CheckCircle2,
  XCircle,
  Clock,
  FileBadge,
  MessageSquare,
  AlertTriangle,
  Calendar,
  Users,
  MapPin,
  User as UserIcon,
  X,
} from 'lucide-react';
import { useTrainingsViewModel } from '../../viewmodels/useTrainingsViewModel';
import { trainingSchema } from '../../validations/schemas';
import {
  Training,
  TrainingOption,
  AttendanceMember,
  AttendanceStatus,
  UserRole,
} from '../../models';
import { trainingService } from '../../services/trainings/trainingService';
import { useAuth } from '../../context/AuthContext';
import ConfirmDialogModal, {
  useConfirmDialog,
} from '../../components/common/ConfirmDialogModal';

// El formulario maneja la entrada del esquema (la capacidad puede faltar) y al enviar recibe la salida validada
type TrainingFormValues = z.input<typeof trainingSchema>;
type TrainingFormInputs = z.output<typeof trainingSchema>;

const FIELD_LABEL_CLASS = 'block text-xs font-semibold text-slate-300 mb-1';

const fieldControlClass = (hasError: boolean, width = 'w-full') =>
  `${width} bg-slate-950 border ${
    hasError ? 'border-rose-500/80' : 'border-slate-800'
  } rounded-xl px-3.5 py-2.5 text-sm text-slate-100 outline-none focus:border-blue-500`;

/** Marca visual de campo obligatorio; para lectores de pantalla ya lo indica el atributo required. */
function RequiredMark() {
  return (
    <span aria-hidden="true" className="text-rose-400">
      {' '}
      *
    </span>
  );
}

/** El mensaje lleva icono además de color y solo existe mientras el campo es inválido. */
function FieldError({ id, message }: { id: string; message?: string }) {
  if (!message) return null;
  return (
    <p id={id} className="text-rose-400 text-xs mt-1 flex items-center gap-1">
      <AlertTriangle size={12} aria-hidden="true" className="shrink-0" />
      {message}
    </p>
  );
}

/** Añade a la lista la opción que la sesión ya tenía cuando hoy no figura entre las elegibles. */
function withCurrentOption(
  options: TrainingOption[],
  currentId: number | undefined,
  currentName: string | null | undefined,
  fallbackName: string,
  note: string | null
): TrainingOption[] {
  if (!currentId || options.some((o) => o.id === currentId)) return options;
  const name = currentName?.trim() || fallbackName;
  return [...options, { id: currentId, nombre: note ? `${name} (${note})` : name }];
}

const ATTENDANCE_OPTIONS: Array<{
  value: AttendanceStatus;
  label: string;
  activeClass: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
}> = [
  {
    value: 'PRESENTE',
    label: 'Presente',
    activeClass: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50',
    icon: CheckCircle2,
  },
  {
    value: 'AUSENTE',
    label: 'Ausente',
    activeClass: 'bg-rose-500/20 text-rose-300 border-rose-500/50',
    icon: XCircle,
  },
  {
    value: 'TARDE',
    label: 'Tarde',
    activeClass: 'bg-amber-500/20 text-amber-300 border-amber-500/50',
    icon: Clock,
  },
  {
    value: 'EXCUSA',
    label: 'Excusa',
    activeClass: 'bg-sky-500/20 text-sky-300 border-sky-500/50',
    icon: FileBadge,
  },
];

export default function TrainingsPage() {
  const { user } = useAuth();
  const {
    trainings,
    loading,
    error,
    formOptions,
    formOptionsLoaded,
    formOptionsError,
    reloadFormOptions,
    createTraining,
    updateTraining,
    deleteTraining,
    closeTraining,
  } = useTrainingsViewModel();

  // El administrador elige al entrenador responsable; el entrenador programa siempre a su nombre
  const isAdmin = user?.rol === UserRole.ADMIN;
  const ownName = user ? `${user.nombre} ${user.apellido}`.trim() : '';

  const [showModal, setShowModal] = useState(false);
  const [showAttendance, setShowAttendance] = useState(false);
  const [editingTraining, setEditingTraining] = useState<Training | null>(null);
  const [selectedTraining, setSelectedTraining] = useState<Training | null>(null);
  const [attendanceList, setAttendanceList] = useState<AttendanceMember[]>([]);
  const [attendanceLoading, setAttendanceLoading] = useState(false);
  const [savingMemberIds, setSavingMemberIds] = useState<Record<number, boolean>>({});
  const [openNotes, setOpenNotes] = useState<Record<number, boolean>>({});
  const [noteDrafts, setNoteDrafts] = useState<Record<number, string>>({});

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<TrainingFormValues, unknown, TrainingFormInputs>({
    resolver: zodResolver(trainingSchema),
  });

  // aria-invalid arranca en "false" y el mensaje solo se enlaza al campo mientras este es inválido
  const fieldA11y = (name: keyof TrainingFormValues, errorId: string) => ({
    'aria-invalid': errors[name] ? ('true' as const) : ('false' as const),
    'aria-describedby': errors[name] ? errorId : undefined,
  });

  // Al editar se conserva la sede o el responsable que la sesión ya tenía aunque hoy no se puedan elegir.
  // La nota solo se añade cuando las opciones ya cargaron: antes no se sabe si siguen disponibles.
  const sedeOptions = useMemo(
    () =>
      withCurrentOption(
        formOptions.sedes,
        editingTraining?.sedeId,
        editingTraining?.sedeNombre,
        'Sede actual',
        formOptionsLoaded ? 'inactiva' : null
      ),
    [formOptions.sedes, formOptionsLoaded, editingTraining]
  );
  const entrenadorOptions = useMemo(
    () =>
      withCurrentOption(
        formOptions.entrenadores,
        editingTraining?.entrenadorId,
        editingTraining?.entrenadorNombre,
        'Responsable actual',
        formOptionsLoaded ? 'ya no es entrenador activo' : null
      ),
    [formOptions.entrenadores, formOptionsLoaded, editingTraining]
  );

  // Regla automática "Trabajo de Gym" para martes y jueves al crear nueva sesión
  const watchFechaHora = watch('fechaHora');
  useEffect(() => {
    if (watchFechaHora && !editingTraining) {
      const date = new Date(watchFechaHora);
      const day = date.getDay();
      if (day === 2 || day === 4) {
        setValue('titulo', 'Trabajo de Gym');
      }
    }
  }, [watchFechaHora, editingTraining, setValue]);

  const openAttendance = async (training: Training) => {
    setSelectedTraining(training);
    setShowAttendance(true);
    setAttendanceLoading(true);
    try {
      const list = await trainingService.getAttendance(training.id);
      const normalized = list.map((m) => ({
        ...m,
        estado: m.estado ?? (m.asistio ? 'PRESENTE' : null),
      }));
      setAttendanceList(normalized);
      const drafts: Record<number, string> = {};
      const expanded: Record<number, boolean> = {};
      normalized.forEach((m) => {
        drafts[m.id] = m.observaciones || '';
        if (m.observaciones) expanded[m.id] = true;
      });
      setNoteDrafts(drafts);
      setOpenNotes(expanded);
    } catch {
      toast.error('No fue posible cargar la lista de asistencia.');
    } finally {
      setAttendanceLoading(false);
    }
  };

  // Permite abrir directamente el llamado a lista si llega ?attendance=<id> desde el panel del entrenador
  useEffect(() => {
    if (loading || trainings.length === 0 || showAttendance) return;
    const targetId = Number(new URLSearchParams(window.location.search).get('attendance'));
    if (targetId > 0) {
      const target = trainings.find((t) => t.id === targetId);
      if (target) {
        void openAttendance(target);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading, trainings]);

  const handleEdit = (training: Training) => {
    setEditingTraining(training);
    reset({
      titulo: training.titulo,
      descripcion: training.descripcion || '',
      sedeId: String(training.sedeId),
      entrenadorId: String(training.entrenadorId),
      fechaHora: training.fechaHora.substring(0, 16),
      fechaFin: training.fechaFin.substring(0, 16),
      capacidadMaxima: training.capacidadMaxima,
    });
    setShowModal(true);
  };

  const handleAddNew = () => {
    setEditingTraining(null);

    const now = new Date();
    if (now.getDay() === 0) now.setDate(now.getDate() + 1);
    now.setHours(16, 0, 0, 0);
    const tzOffset = now.getTimezoneOffset() * 60000;
    const localNow = new Date(now.getTime() - tzOffset).toISOString().slice(0, 16);

    const end = new Date(now);
    end.setHours(18, 0, 0, 0);
    const localEnd = new Date(end.getTime() - tzOffset).toISOString().slice(0, 16);

    // Con una sola opción disponible se deja elegida; con varias decide quien programa la sesión
    const onlyOption = (options: TrainingOption[]) =>
      options.length === 1 ? String(options[0].id) : '';

    reset({
      titulo: '',
      descripcion: '',
      sedeId: onlyOption(formOptions.sedes),
      entrenadorId: isAdmin ? onlyOption(formOptions.entrenadores) : String(user?.id ?? ''),
      fechaHora: localNow,
      fechaFin: localEnd,
      capacidadMaxima: 20,
    });
    setShowModal(true);
  };

  const { requestConfirm, confirmDialogProps } = useConfirmDialog();

  const handleDelete = (id: number) => {
    requestConfirm({
      title: 'Eliminar entrenamiento',
      description: '¿Deseas eliminar esta sesión de entrenamiento programada?',
      confirmLabel: 'Sí, eliminar',
      variant: 'danger',
      onConfirm: async () => {
        const ok = await deleteTraining(id);
        if (ok) toast.success('Sesión eliminada.');
      },
    });
  };

  const onSubmit = async (data: TrainingFormInputs) => {
    // La sede y el entrenador salen del formulario. La API vuelve a validarlos y, si quien guarda
    // es un entrenador, toma al responsable de la sesión iniciada y no de este envío.
    const success = editingTraining
      ? await updateTraining(editingTraining.id, data)
      : await createTraining(data);

    if (success) {
      toast.success(editingTraining ? 'Sesión actualizada.' : 'Sesión programada.');
      setShowModal(false);
      reset();
    }
  };

  const saveMemberAttendance = async (
    member: AttendanceMember,
    nextEstado: AttendanceStatus,
    customComment?: string
  ) => {
    if (!selectedTraining || selectedTraining.estado === 'CERRADO') return;

    const commentToSave =
      customComment !== undefined ? customComment : (noteDrafts[member.id] ?? member.observaciones ?? '');
    const previousList = attendanceList;
    const asistioEfectivo = nextEstado === 'PRESENTE' || nextEstado === 'TARDE';

    // Actualización optimista inmediata para que la interfaz responda sin bloqueo por latencia
    setAttendanceList((prev) =>
      prev.map((m) =>
        m.id === member.id
          ? {
              ...m,
              estado: nextEstado,
              asistio: asistioEfectivo,
              observaciones: commentToSave.trim() || null,
            }
          : m
      )
    );
    setSavingMemberIds((prev) => ({ ...prev, [member.id]: true }));

    try {
      await trainingService.markAttendance(
        selectedTraining.id,
        member.id,
        nextEstado,
        commentToSave
      );
    } catch (err: any) {
      setAttendanceList(previousList);
      toast.error(err.response?.data?.message || 'No se pudo guardar la asistencia.');
    } finally {
      setSavingMemberIds((prev) => ({ ...prev, [member.id]: false }));
    }
  };

  const handleMarkRemainingPresent = async () => {
    if (!selectedTraining || selectedTraining.estado === 'CERRADO') return;
    const unmarked = attendanceList.filter((m) => !m.estado);
    if (unmarked.length === 0) return;

    await Promise.all(unmarked.map((m) => saveMemberAttendance(m, 'PRESENTE')));
    toast.success(`${unmarked.length} deportista(s) marcados como Presente.`);
  };

  const handleCloseTraining = (training: Training) => {
    requestConfirm({
      title: 'Cerrar sesión de entrenamiento',
      description:
        'Una vez cerrada la sesión, el registro de asistencia quedará bloqueado para edición.',
      confirmLabel: 'Cerrar sesión',
      variant: 'warning',
      onConfirm: async () => {
        const ok = await closeTraining(training.id);
        if (ok) {
          toast.success('Sesión cerrada.');
          if (selectedTraining?.id === training.id) {
            setSelectedTraining({ ...training, estado: 'CERRADO' });
          }
        }
      },
    });
  };

  const attendanceSummary = useMemo(() => {
    const counts = {
      PRESENTE: 0,
      TARDE: 0,
      EXCUSA: 0,
      AUSENTE: 0,
      SIN_MARCAR: 0,
    };
    attendanceList.forEach((m) => {
      if (m.estado && m.estado in counts) {
        counts[m.estado as keyof typeof counts] += 1;
      } else {
        counts.SIN_MARCAR += 1;
      }
    });
    return counts;
  }, [attendanceList]);

  const getStatusInfo = (t: Training) => {
    if (t.estado === 'CERRADO') {
      return {
        text: 'CERRADO',
        color: 'bg-slate-800 text-slate-300 border border-slate-700',
      };
    }

    const now = new Date();
    const start = new Date(t.fechaHora);
    const end = new Date(t.fechaFin);

    if (!isNaN(end.getTime()) && end.getFullYear() > 1970 && now > end) {
      return {
        text: 'FINALIZADO',
        color: 'bg-slate-800/80 text-slate-400 border border-slate-700/80',
      };
    }
    if (now >= start && (isNaN(end.getTime()) || now <= end)) {
      return {
        text: 'EN CURSO',
        color: 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30',
      };
    }
    if (start.toDateString() === now.toDateString()) {
      return {
        text: 'HOY',
        color: 'bg-blue-500/15 text-blue-300 border border-blue-500/30',
      };
    }
    return {
      text: 'PROGRAMADO',
      color: 'bg-amber-500/15 text-amber-300 border border-amber-500/30',
    };
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-100">Sesiones de Entrenamiento</h1>
          <p className="text-slate-400 text-sm mt-0.5">
            Programa horarios y registra asistencia con estados detallados
          </p>
        </div>
        <button
          type="button"
          onClick={handleAddNew}
          className="inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors shadow-sm"
        >
          <Plus size={18} /> Nueva Sesión
        </button>
      </div>

      {error && (
        <div className="bg-rose-500/10 border border-rose-500/30 text-rose-300 rounded-xl p-3.5 text-sm flex items-center gap-2">
          <AlertTriangle size={18} /> {error}
        </div>
      )}

      {loading ? (
        <div
          aria-busy="true"
          aria-label="Cargando sesiones de entrenamiento"
          className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 space-y-3"
        >
          {[1, 2, 3].map((row) => (
            <div
              key={row}
              className="h-16 bg-slate-800/60 rounded-xl animate-pulse"
            />
          ))}
        </div>
      ) : (
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-800">
              <thead className="bg-slate-950/60">
                <tr>
                  <th className="px-6 py-3.5 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    Sesión
                  </th>
                  <th className="px-6 py-3.5 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    Sede y entrenador
                  </th>
                  <th className="px-6 py-3.5 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    Fecha y Horario
                  </th>
                  <th className="px-6 py-3.5 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    Cupo
                  </th>
                  <th className="px-6 py-3.5 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    Estado
                  </th>
                  <th className="px-6 py-3.5 text-right text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {trainings.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-slate-400 text-sm">
                      No hay sesiones programadas todavía. Crea una nueva sesión para comenzar.
                    </td>
                  </tr>
                ) : (
                  trainings.map((t) => {
                    const status = getStatusInfo(t);
                    const start = new Date(t.fechaHora);
                    const end = new Date(t.fechaFin);
                    const hasValidEnd = !isNaN(end.getTime()) && end.getFullYear() > 1970;
                    return (
                      <tr key={t.id} className="hover:bg-slate-800/40 transition-colors">
                        <td className="px-6 py-4">
                          <div className="font-semibold text-slate-100">{t.titulo}</div>
                          {t.descripcion && (
                            <div className="text-xs text-slate-400 line-clamp-1 mt-0.5">
                              {t.descripcion}
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-300">
                          <div className="flex items-center gap-1.5">
                            <MapPin size={14} className="text-blue-400 shrink-0" aria-hidden="true" />
                            {t.sedeNombre || 'Sede por confirmar'}
                          </div>
                          <div className="flex items-center gap-1.5 text-xs text-slate-400 mt-0.5">
                            <UserIcon size={13} className="shrink-0" aria-hidden="true" />
                            {t.entrenadorNombre || 'Entrenador por asignar'}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-300">
                          <div className="flex items-center gap-1.5">
                            <Calendar size={14} className="text-blue-400" />
                            {start.toLocaleDateString('es-CO')}
                          </div>
                          <div className="text-xs text-slate-400 mt-0.5">
                            {start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            {hasValidEnd &&
                              ` - ${end.toLocaleTimeString([], {
                                hour: '2-digit',
                                minute: '2-digit',
                              })}`}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-300">
                          <span className="inline-flex items-center gap-1 text-xs text-slate-400">
                            <Users size={14} /> {t.capacidadMaxima}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`px-2.5 py-1 inline-flex text-xs font-semibold rounded-full ${status.color}`}
                          >
                            {status.text}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="inline-flex items-center justify-end gap-1.5">
                            <button
                              type="button"
                              onClick={() => openAttendance(t)}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-500/25 transition-colors"
                            >
                              <ClipboardCheck size={14} /> Asistencia
                            </button>
                            {t.estado !== 'CERRADO' && (
                              <button
                                type="button"
                                onClick={() => handleCloseTraining(t)}
                                className="p-2 text-amber-300 hover:bg-amber-500/15 rounded-lg transition-colors"
                                title="Cerrar sesión"
                                aria-label={`Cerrar sesión ${t.titulo}`}
                              >
                                <Lock size={15} />
                              </button>
                            )}
                            <button
                              type="button"
                              onClick={() => handleEdit(t)}
                              className="p-2 text-slate-300 hover:text-blue-300 hover:bg-blue-500/15 rounded-lg transition-colors"
                              title="Editar sesión"
                              aria-label={`Editar sesión ${t.titulo}`}
                            >
                              <Pencil size={15} />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDelete(t.id)}
                              className="p-2 text-slate-400 hover:text-rose-300 hover:bg-rose-500/15 rounded-lg transition-colors"
                              title="Eliminar sesión"
                              aria-label={`Eliminar sesión ${t.titulo}`}
                            >
                              <Trash2 size={15} />
                            </button>
                          </div>
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

      {/* Modal Conciso Crear / Editar Sesión */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
              <h3 className="text-lg font-bold text-slate-100">
                {editingTraining ? 'Editar Sesión' : 'Programar Nueva Sesión'}
              </h3>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="text-slate-400 hover:text-slate-200 p-1 rounded-lg"
                aria-label="Cerrar formulario"
              >
                <X size={18} />
              </button>
            </div>
            {/* noValidate: los mensajes los da el esquema de validación, en español y junto a cada campo */}
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
              {error && (
                <div
                  role="alert"
                  className="bg-rose-500/10 border border-rose-500/30 text-rose-300 rounded-xl p-3 text-xs flex items-center gap-2"
                >
                  <AlertTriangle size={15} aria-hidden="true" className="shrink-0" /> {error}
                </div>
              )}
              <p className="text-[11px] text-slate-400">
                Los campos marcados con * son obligatorios.
              </p>
              <div>
                <label htmlFor="training-titulo" className={FIELD_LABEL_CLASS}>
                  Título de la sesión
                  <RequiredMark />
                </label>
                <input
                  id="training-titulo"
                  type="text"
                  required
                  placeholder="Ej. Entrenamiento táctico o Trabajo de Gym"
                  className={fieldControlClass(!!errors.titulo)}
                  {...fieldA11y('titulo', 'training-titulo-error')}
                  {...register('titulo')}
                />
                <FieldError id="training-titulo-error" message={errors.titulo?.message} />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label htmlFor="training-sede" className={FIELD_LABEL_CLASS}>
                    Sede
                    <RequiredMark />
                  </label>
                  <select
                    id="training-sede"
                    required
                    className={fieldControlClass(!!errors.sedeId)}
                    {...fieldA11y('sedeId', 'training-sede-error')}
                    {...register('sedeId')}
                  >
                    {/* Opción vacía y deshabilitada: obliga a elegir una sede real.
                        El texto es corto para que quepa completo en la columna del formulario. */}
                    <option value="" disabled>
                      Elige una sede…
                    </option>
                    {sedeOptions.map((option) => (
                      <option key={option.id} value={option.id}>
                        {option.nombre}
                      </option>
                    ))}
                  </select>
                  <FieldError
                    id="training-sede-error"
                    message={errors.sedeId?.message as string | undefined}
                  />
                </div>
                <div>
                  {isAdmin ? (
                    <>
                      <label htmlFor="training-entrenador" className={FIELD_LABEL_CLASS}>
                        Entrenador responsable
                        <RequiredMark />
                      </label>
                      <select
                        id="training-entrenador"
                        required
                        className={fieldControlClass(!!errors.entrenadorId)}
                        {...fieldA11y('entrenadorId', 'training-entrenador-error')}
                        {...register('entrenadorId')}
                      >
                        <option value="" disabled>
                          Elige un entrenador…
                        </option>
                        {entrenadorOptions.map((option) => (
                          <option key={option.id} value={option.id}>
                            {option.nombre}
                          </option>
                        ))}
                      </select>
                      <FieldError
                        id="training-entrenador-error"
                        message={errors.entrenadorId?.message as string | undefined}
                      />
                    </>
                  ) : (
                    <>
                      <label htmlFor="training-entrenador-fijo" className={FIELD_LABEL_CLASS}>
                        Entrenador responsable
                      </label>
                      <input
                        id="training-entrenador-fijo"
                        type="text"
                        readOnly
                        value={
                          editingTraining
                            ? editingTraining.entrenadorNombre || 'Sin asignar'
                            : ownName
                        }
                        aria-describedby="training-entrenador-ayuda"
                        className={`${fieldControlClass(false)} text-slate-400 cursor-default`}
                      />
                      <p id="training-entrenador-ayuda" className="text-[11px] text-slate-400 mt-1">
                        {editingTraining
                          ? 'Solo el administrador puede reasignar la sesión.'
                          : 'Las sesiones que programas quedan a tu nombre.'}
                      </p>
                    </>
                  )}
                </div>
              </div>
              {formOptionsError && (
                <p role="alert" className="text-amber-300 text-xs flex flex-wrap items-center gap-2">
                  <AlertTriangle size={13} aria-hidden="true" className="shrink-0" />
                  {formOptionsError}
                  <button
                    type="button"
                    onClick={reloadFormOptions}
                    className="underline font-semibold hover:text-amber-200"
                  >
                    Reintentar
                  </button>
                </p>
              )}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label htmlFor="training-inicio" className={FIELD_LABEL_CLASS}>
                    Inicio
                    <RequiredMark />
                  </label>
                  <input
                    id="training-inicio"
                    type="datetime-local"
                    required
                    className={fieldControlClass(!!errors.fechaHora)}
                    {...fieldA11y('fechaHora', 'training-inicio-error')}
                    {...register('fechaHora')}
                  />
                  <FieldError id="training-inicio-error" message={errors.fechaHora?.message} />
                </div>
                <div>
                  <label htmlFor="training-fin" className={FIELD_LABEL_CLASS}>
                    Fin
                    <RequiredMark />
                  </label>
                  <input
                    id="training-fin"
                    type="datetime-local"
                    required
                    className={fieldControlClass(!!errors.fechaFin)}
                    {...fieldA11y('fechaFin', 'training-fin-error')}
                    {...register('fechaFin')}
                  />
                  <FieldError id="training-fin-error" message={errors.fechaFin?.message} />
                </div>
              </div>
              <div>
                <label htmlFor="training-cupo" className={FIELD_LABEL_CLASS}>
                  Cupo máximo
                  <RequiredMark />
                </label>
                <input
                  id="training-cupo"
                  type="number"
                  min={1}
                  required
                  className={fieldControlClass(!!errors.capacidadMaxima, 'w-36')}
                  {...fieldA11y('capacidadMaxima', 'training-cupo-error')}
                  {...register('capacidadMaxima', { valueAsNumber: true })}
                />
                <FieldError id="training-cupo-error" message={errors.capacidadMaxima?.message} />
              </div>
              <div>
                <label htmlFor="training-notas" className={FIELD_LABEL_CLASS}>
                  Objetivo o notas breves (opcional)
                </label>
                <textarea
                  id="training-notas"
                  rows={2}
                  className={`${fieldControlClass(!!errors.descripcion)} resize-y`}
                  placeholder="Ej. Resistencia aeróbica, trabajo técnico..."
                  {...fieldA11y('descripcion', 'training-notas-error')}
                  {...register('descripcion')}
                />
                <FieldError id="training-notas-error" message={errors.descripcion?.message} />
              </div>
              <div className="flex justify-end gap-2.5 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-300 bg-slate-800 hover:bg-slate-700 rounded-xl"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white rounded-xl disabled:opacity-50"
                >
                  {isSubmitting ? 'Guardando...' : 'Guardar Sesión'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de Asistencia en 4 Estados + Comentario Opcional */}
      {showAttendance && selectedTraining && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-3xl p-6 shadow-2xl flex flex-col max-h-[90vh]">
            <div className="flex items-start justify-between gap-4 border-b border-slate-800 pb-4">
              <div>
                <h3 className="text-lg font-bold text-slate-100">
                  Control de Asistencia · {selectedTraining.titulo}
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Marca el estado de cada deportista. Los cambios se guardan al instante.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowAttendance(false)}
                className="text-slate-400 hover:text-slate-200 p-1 rounded-lg"
                aria-label="Cerrar control de asistencia"
              >
                <X size={18} />
              </button>
            </div>

            {selectedTraining.estado === 'CERRADO' && (
              <div className="mt-3 p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs flex items-center gap-2">
                <Lock size={14} /> Esta sesión está cerrada; la asistencia es de solo lectura.
              </div>
            )}

            {/* Resumen en vivo y acción rápida */}
            <div className="flex flex-wrap items-center justify-between gap-2 py-3 border-b border-slate-800">
              <div className="flex flex-wrap items-center gap-2 text-xs">
                <span className="px-2.5 py-1 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 font-semibold">
                  Presentes: {attendanceSummary.PRESENTE}
                </span>
                <span className="px-2.5 py-1 rounded-full bg-rose-500/15 text-rose-300 border border-rose-500/30 font-semibold">
                  Ausentes: {attendanceSummary.AUSENTE}
                </span>
                <span className="px-2.5 py-1 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/30 font-semibold">
                  Tarde: {attendanceSummary.TARDE}
                </span>
                <span className="px-2.5 py-1 rounded-full bg-sky-500/15 text-sky-300 border border-sky-500/30 font-semibold">
                  Excusa: {attendanceSummary.EXCUSA}
                </span>
                {attendanceSummary.SIN_MARCAR > 0 && (
                  <span className="px-2.5 py-1 rounded-full bg-slate-800 text-slate-400 font-medium">
                    Sin marcar: {attendanceSummary.SIN_MARCAR}
                  </span>
                )}
              </div>

              {selectedTraining.estado !== 'CERRADO' && attendanceSummary.SIN_MARCAR > 0 && (
                <button
                  type="button"
                  onClick={handleMarkRemainingPresent}
                  className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors"
                >
                  Marcar pendientes como Presente
                </button>
              )}
            </div>

            <div className="flex-1 overflow-y-auto py-3 space-y-2.5 pr-1">
              {attendanceLoading ? (
                <div aria-busy="true" className="space-y-2.5">
                  {[1, 2, 3, 4].map((skeleton) => (
                    <div
                      key={skeleton}
                      className="h-16 bg-slate-800/60 rounded-xl animate-pulse"
                    />
                  ))}
                </div>
              ) : attendanceList.length === 0 ? (
                <p className="text-center text-slate-400 py-8 text-sm">
                  No hay deportistas activos registrados en el club.
                </p>
              ) : (
                attendanceList.map((member) => {
                  const isClosed = selectedTraining.estado === 'CERRADO';
                  const isSaving = !!savingMemberIds[member.id];
                  const isNoteOpen = !!openNotes[member.id];
                  const fullName = `${member.nombre} ${member.apellido}`;

                  return (
                    <div
                      key={member.id}
                      data-testid={`attendance-row-${member.id}`}
                      className="p-3.5 rounded-xl border border-slate-800 bg-slate-950/70 space-y-2.5"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-xs font-bold text-slate-200 shrink-0">
                            {member.nombre.charAt(0)}
                            {member.apellido.charAt(0)}
                          </div>
                          <div className="min-w-0">
                            <p className="font-semibold text-sm text-slate-100 truncate">
                              {fullName}
                            </p>
                            {isSaving && (
                              <span className="text-[11px] text-blue-400">Guardando...</span>
                            )}
                          </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-1.5">
                          {ATTENDANCE_OPTIONS.map((opt) => {
                            const Icon = opt.icon;
                            const isActive = member.estado === opt.value;
                            return (
                              <button
                                key={opt.value}
                                type="button"
                                disabled={isClosed}
                                aria-pressed={isActive}
                                aria-label={`Marcar ${opt.label} a ${fullName}`}
                                onClick={() => saveMemberAttendance(member, opt.value)}
                                className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold border transition-colors ${
                                  isActive
                                    ? opt.activeClass
                                    : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-slate-200 hover:border-slate-700'
                                } disabled:opacity-60 disabled:cursor-not-allowed`}
                              >
                                <Icon size={13} />
                                {opt.label}
                              </button>
                            );
                          })}

                          <button
                            type="button"
                            onClick={() =>
                              setOpenNotes((prev) => ({
                                ...prev,
                                [member.id]: !prev[member.id],
                              }))
                            }
                            aria-label={`Comentario opcional para ${fullName}`}
                            className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                              isNoteOpen || member.observaciones
                                ? 'bg-blue-500/15 text-blue-300 border-blue-500/40'
                                : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-slate-200'
                            }`}
                          >
                            <MessageSquare size={13} />
                            Nota
                          </button>
                        </div>
                      </div>

                      {isNoteOpen && (
                        <div className="flex items-center gap-2 pt-1">
                          <input
                            type="text"
                            disabled={isClosed}
                            value={noteDrafts[member.id] ?? ''}
                            onChange={(e) =>
                              setNoteDrafts((prev) => ({
                                ...prev,
                                [member.id]: e.target.value,
                              }))
                            }
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                e.preventDefault();
                                void saveMemberAttendance(
                                  member,
                                  member.estado ?? 'PRESENTE',
                                  noteDrafts[member.id] ?? ''
                                );
                                toast.success('Comentario guardado.');
                              }
                            }}
                            placeholder="Comentario opcional (ej. excusa médica, llegó 10 min tarde)..."
                            aria-label={`Texto de comentario para ${fullName}`}
                            className="flex-1 bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-100 outline-none focus:border-blue-500"
                          />
                          {!isClosed && (
                            <button
                              type="button"
                              onClick={() => {
                                void saveMemberAttendance(
                                  member,
                                  member.estado ?? 'PRESENTE',
                                  noteDrafts[member.id] ?? ''
                                );
                                toast.success('Comentario guardado.');
                              }}
                              className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold transition-colors"
                            >
                              Guardar nota
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>

            <div className="flex justify-end pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setShowAttendance(false)}
                className="px-5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-100 rounded-xl text-xs font-semibold transition-colors"
              >
                Listo
              </button>
            </div>
          </div>
        </div>
      )}

      <ConfirmDialogModal {...confirmDialogProps} />
    </div>
  );
}
