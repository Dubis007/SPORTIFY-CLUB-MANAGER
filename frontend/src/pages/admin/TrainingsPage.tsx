import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useTrainingsViewModel } from '../../viewmodels/useTrainingsViewModel';
import { trainingSchema } from '../../validations/schemas';
import { Training, AttendanceMember } from '../../models';
import { trainingService } from '../../services/trainings/trainingService';
import { useAuth } from '../../context/AuthContext';

type TrainingFormInputs = z.infer<typeof trainingSchema>;

export default function TrainingsPage() {
  const { user } = useAuth();
  const { trainings, loading, error, createTraining, updateTraining, deleteTraining, closeTraining } = useTrainingsViewModel();
  const [showModal, setShowModal] = useState(false);
  const [showAttendance, setShowAttendance] = useState(false);
  const [editingTraining, setEditingTraining] = useState<Training | null>(null);
  const [selectedTraining, setSelectedTraining] = useState<Training | null>(null);
  const [attendanceList, setAttendanceList] = useState<AttendanceMember[]>([]);
  const [attendanceLoading, setAttendanceLoading] = useState(false);

  const { register, handleSubmit, reset, formState: { errors }, watch, setValue } = useForm<TrainingFormInputs>({
    resolver: zodResolver(trainingSchema)
  });

  // Watch for Date changes to implement "Trabajo de Gym" auto-fill rule
  const watchFechaHora = watch('fechaHora');
  React.useEffect(() => {
    if (watchFechaHora && !editingTraining) {
      const date = new Date(watchFechaHora);
      const day = date.getDay(); // 0 = Sun, 1 = Mon, ..., 2 = Tue, 4 = Thu
      if (day === 2 || day === 4) {
        setValue('titulo', 'Trabajo de Gym');
      }
    }
  }, [watchFechaHora, editingTraining, setValue]);

  const handleEdit = (training: Training) => {
    setEditingTraining(training);
    reset({
      titulo: training.titulo,
      descripcion: training.descripcion || '',
      fechaHora: training.fechaHora.substring(0, 16),
      fechaFin: training.fechaFin.substring(0, 16),
      capacidadMaxima: training.capacidadMaxima
    });
    setShowModal(true);
  };

  const handleAddNew = () => {
    setEditingTraining(null);
    
    // Default smart dates: today (if not sunday), 4 PM to 6 PM
    const now = new Date();
    if (now.getDay() === 0) now.setDate(now.getDate() + 1); // Skip sunday default
    
    now.setHours(16, 0, 0, 0);
    const tzOffset = now.getTimezoneOffset() * 60000;
    const localNow = new Date(now.getTime() - tzOffset).toISOString().slice(0, 16);
    
    const end = new Date(now);
    end.setHours(18, 0, 0, 0);
    const localEnd = new Date(end.getTime() - tzOffset).toISOString().slice(0, 16);

    reset({ titulo: '', descripcion: '', fechaHora: localNow, fechaFin: localEnd, capacidadMaxima: 20 });
    setShowModal(true);
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('¿Estás seguro de eliminar este entrenamiento?')) {
      await deleteTraining(id);
    }
  };

  const onSubmit = async (data: TrainingFormInputs) => {
    // Send SedeId=1, EntrenadorId=user.id for now since we don't have dropdowns
    const payload = { ...data, sedeId: 1, entrenadorId: user?.id || 1 };
    
    let success = false;
    if (editingTraining) {
      success = await updateTraining(editingTraining.id, payload);
    } else {
      success = await createTraining(payload);
    }
    
    if (success) {
      setShowModal(false);
      reset();
    }
  };

  const openAttendance = async (training: Training) => {
    const now = new Date();
    const start = new Date(training.fechaHora);
    
    // Add 15 minutes grace period before start
    start.setMinutes(start.getMinutes() - 15);
    
    if (now < start) {
      alert(`El entrenamiento no se puede abrir hasta las ${new Date(training.fechaHora).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}`);
      return;
    }

    setSelectedTraining(training);
    setShowAttendance(true);
    setAttendanceLoading(true);
    try {
      const list = await trainingService.getAttendance(training.id);
      setAttendanceList(list);
    } catch (err) {
      console.error(err);
    } finally {
      setAttendanceLoading(false);
    }
  };

  const handleMarkAttendance = async (memberId: number) => {
    if (!selectedTraining) return;
    try {
      await trainingService.markAttendance(selectedTraining.id, memberId, 'Presente');
      setAttendanceList(prev => prev.map(m => m.id === memberId ? { ...m, asistio: true } : m));
    } catch (err: any) {
      alert(err.response?.data?.message || 'Error al marcar asistencia');
    }
  };

  const handleCloseTraining = async (training: Training) => {
    if (window.confirm('¿Seguro que deseas CERRAR este entrenamiento? Ya no se podrán agregar asistencias.')) {
      await closeTraining(training.id);
    }
  };

  const getStatusInfo = (t: Training) => {
    if (t.estado === 'CERRADO') return { text: 'CERRADO', color: 'bg-gray-200 text-gray-800' };
    
    const now = new Date();
    const start = new Date(t.fechaHora);
    const end = new Date(t.fechaFin);
    
    if (now > end) return { text: 'FINALIZADO', color: 'bg-gray-100 text-gray-600' };
    if (now >= start && now <= end) return { text: 'EN CURSO', color: 'bg-green-100 text-green-800 border-green-200 shadow-sm font-bold' };
    
    const diffTime = start.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0 || start.getDate() === now.getDate()) {
      return { text: 'HOY', color: 'bg-blue-100 text-blue-800 font-bold' };
    }
    return { text: 'PENDIENTE', color: 'bg-yellow-100 text-yellow-800' };
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center border-b pb-4">
        <div>
          <h1 className="text-2xl font-bold text-sportify-dark">Entrenamientos</h1>
          <p className="text-gray-500 text-sm">Gestiona los horarios y sesiones del club</p>
        </div>
        <button onClick={handleAddNew} className="bg-sportify-primary hover:bg-red-700 text-white px-4 py-2 rounded-lg font-semibold flex items-center">
          <i className="bi bi-plus-lg mr-2"></i> Nuevo Entrenamiento
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 rounded-lg p-3 text-sm flex items-center">
          <i className="bi bi-exclamation-triangle mr-2"></i> {error}
        </div>
      )}

      {loading ? (
        <div className="text-center py-10 text-gray-400">Cargando...</div>
      ) : (
        <div className="bg-white border rounded-xl overflow-hidden shadow-sm">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-sportify-light">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Título</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Fecha y Horario</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Estado</th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-gray-600 uppercase">Acciones</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {trainings.length === 0 ? (
                <tr><td colSpan={4} className="px-6 py-10 text-center text-gray-500">No hay entrenamientos.</td></tr>
              ) : (
                trainings.map((t) => {
                  const status = getStatusInfo(t);
                  const start = new Date(t.fechaHora);
                  const end = new Date(t.fechaFin);
                  return (
                    <tr key={t.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="font-medium text-sportify-dark">{t.titulo}</div>
                        <div className="text-xs text-gray-500 line-clamp-1">{t.descripcion}</div>
                      </td>
                      <td className="px-6 py-4 text-gray-600">
                        <div>{start.toLocaleDateString()}</div>
                        <div className="text-xs text-gray-400">{start.toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'})} - {end.toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'})}</div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${status.color}`}>
                          {status.text}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right space-x-2">
                        <button onClick={() => openAttendance(t)} className="text-green-600 hover:bg-green-50 p-1.5 rounded" title="Asistencia"><i className="bi bi-clipboard-check"></i></button>
                        {t.estado !== 'CERRADO' && (
                          <button onClick={() => handleCloseTraining(t)} className="text-yellow-600 hover:bg-yellow-50 p-1.5 rounded" title="Cerrar Sesión"><i className="bi bi-door-closed"></i></button>
                        )}
                        <button onClick={() => handleEdit(t)} className="text-blue-600 hover:bg-blue-50 p-1.5 rounded" title="Editar"><i className="bi bi-pencil"></i></button>
                        <button onClick={() => handleDelete(t.id)} className="text-red-600 hover:bg-red-50 p-1.5 rounded" title="Eliminar"><i className="bi bi-trash"></i></button>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl w-full max-w-lg p-6 shadow-xl">
            <h3 className="text-xl font-bold text-sportify-dark mb-4 border-b pb-2">
              {editingTraining ? 'Editar Entrenamiento' : 'Crear Entrenamiento'}
            </h3>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700">Título / Tipo de Sesión</label>
                <input type="text" className="w-full border border-gray-300 rounded-lg px-3 py-2 outline-none focus:border-sportify-primary" {...register('titulo')} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700">Inicio (Establecido 4 PM)</label>
                  <input type="datetime-local" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none" {...register('fechaHora')} />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700">Fin (Establecido 6 PM)</label>
                  <input type="datetime-local" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none" {...register('fechaFin')} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700">Capacidad Máx</label>
                  <input type="number" className="w-full border border-gray-300 rounded-lg px-3 py-2 outline-none" {...register('capacidadMaxima', { valueAsNumber: true })} />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700">Observaciones (Plan de trabajo)</label>
                <textarea rows={3} className="w-full border border-gray-300 rounded-lg px-3 py-2 outline-none" placeholder="Ej. Trabajo de tren superior, gimnasio..." {...register('descripcion')}></textarea>
              </div>
              <div className="flex justify-end space-x-3 pt-4 border-t">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 border rounded-lg hover:bg-gray-50">Cancelar</button>
                <button type="submit" className="px-4 py-2 bg-sportify-primary text-white rounded-lg hover:bg-red-700 font-semibold">Guardar</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showAttendance && selectedTraining && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl w-full max-w-2xl p-6 shadow-xl flex flex-col max-h-[90vh]">
            <h3 className="text-xl font-bold text-sportify-dark mb-2">Asistencia: {selectedTraining.titulo}</h3>
            <p className="text-sm text-gray-500 mb-4 border-b pb-2">Selecciona a los miembros que asistieron.</p>
            
            <div className="flex-1 overflow-y-auto">
              {attendanceLoading ? (
                <div className="text-center py-4">Cargando miembros...</div>
              ) : (
                <div className="space-y-2">
                  {attendanceList.map(member => (
                    <div key={member.id} className="flex justify-between items-center p-3 border rounded-lg bg-gray-50">
                      <div>
                        <p className="font-semibold text-gray-800">{member.nombre} {member.apellido}</p>
                      </div>
                      <button 
                        onClick={() => handleMarkAttendance(member.id)}
                        disabled={member.asistio || selectedTraining.estado === 'CERRADO'}
                        className={`px-3 py-1 rounded shadow-sm text-sm font-semibold transition-colors ${member.asistio ? 'bg-green-500 text-white cursor-not-allowed' : 'bg-white border hover:bg-gray-100 text-gray-700'}`}
                      >
                        {member.asistio ? <><i className="bi bi-check2-all"></i> Presente</> : 'Marcar Presente'}
                      </button>
                    </div>
                  ))}
                  {attendanceList.length === 0 && <p className="text-center text-gray-500">No hay miembros activos registrados.</p>}
                </div>
              )}
            </div>

            <div className="flex justify-end pt-4 border-t mt-4">
              <button onClick={() => setShowAttendance(false)} className="px-4 py-2 bg-gray-800 text-white rounded-lg font-semibold hover:bg-gray-900">Cerrar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
