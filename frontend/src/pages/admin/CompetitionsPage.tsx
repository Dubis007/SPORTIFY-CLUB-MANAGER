import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useCompetitionsViewModel } from '../../viewmodels/useCompetitionsViewModel';
import { competitionSchema } from '../../validations/schemas';
import { Competition } from '../../models';

type CompetitionFormInputs = z.infer<typeof competitionSchema>;

export default function CompetitionsPage() {
  const { competitions, loading, error, createCompetition, updateCompetition, deleteCompetition } = useCompetitionsViewModel();
  const [showModal, setShowModal] = useState(false);
  const [editingComp, setEditingComp] = useState<Competition | null>(null);

  const { register, handleSubmit, reset, formState: { errors } } = useForm<CompetitionFormInputs>({
    resolver: zodResolver(competitionSchema)
  });

  const handleEdit = (comp: Competition) => {
    setEditingComp(comp);
    reset({
      nombre: comp.nombre,
      fechaInicio: comp.fechaInicio.substring(0, 16),
      fechaFin: comp.fechaFin.substring(0, 16),
      ubicacion: comp.ubicacion,
      descripcion: comp.descripcion || ''
    });
    setShowModal(true);
  };

  const handleAddNew = () => {
    setEditingComp(null);
    reset({ nombre: '', fechaInicio: '', fechaFin: '', ubicacion: '', descripcion: '' });
    setShowModal(true);
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('¿Estás seguro de eliminar esta competencia permanentemente?')) {
      await deleteCompetition(id);
    }
  };

  const onSubmit = async (data: CompetitionFormInputs) => {
    let success = false;
    if (editingComp) {
      success = await updateCompetition(editingComp.id, data);
    } else {
      success = await createCompetition(data);
    }
    
    if (success) {
      setShowModal(false);
      reset();
    }
  };

  const getStatusInfo = (comp: Competition) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const startDate = new Date(comp.fechaInicio);
    startDate.setHours(0, 0, 0, 0);
    
    const diffTime = startDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      return { text: 'HOY', color: 'bg-green-100 text-green-800 border border-green-200 shadow-sm font-bold' };
    } else if (diffDays > 0) {
      return { text: `Faltan ${diffDays} días`, color: 'bg-blue-100 text-blue-800' };
    } else {
      const endDate = new Date(comp.fechaFin);
      if (new Date() > endDate) {
        return { text: 'FINALIZADA', color: 'bg-gray-100 text-gray-800' };
      }
      return { text: 'EN CURSO', color: 'bg-yellow-100 text-yellow-800 shadow-sm' };
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center border-b pb-4">
        <div>
          <h1 className="text-2xl font-bold text-sportify-dark">Competencias</h1>
          <p className="text-gray-500 text-sm">Gestiona los eventos deportivos del club</p>
        </div>
        <button 
          onClick={handleAddNew}
          className="bg-sportify-primary hover:bg-red-700 text-white px-4 py-2 rounded-lg font-semibold shadow-sm transition-colors flex items-center"
        >
          <i className="bi bi-plus-lg mr-2"></i> Nueva Competencia
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 rounded-lg p-3 text-sm flex items-center">
          <i className="bi bi-exclamation-triangle mr-2"></i> {error}
        </div>
      )}

      {loading ? (
        <div className="text-center py-10 text-gray-400">
          <div className="spinner-border text-sportify-secondary" role="status"></div>
          <p className="mt-2">Cargando competencias...</p>
        </div>
      ) : (
        <div className="bg-white border rounded-xl overflow-hidden shadow-sm">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-sportify-light">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Nombre</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Fecha / Hora</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Lugar</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Estado</th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">Acciones</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {competitions.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-10 text-center text-gray-500">
                    <i className="bi bi-trophy text-4xl mb-2 block text-gray-300"></i>
                    No hay competencias registradas
                  </td>
                </tr>
              ) : (
                competitions.map((comp) => {
                  const status = getStatusInfo(comp);
                  const fecha = new Date(comp.fechaInicio);
                  return (
                    <tr key={comp.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap font-medium text-sportify-dark">{comp.nombre}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-600">
                        <div>{fecha.toLocaleDateString()}</div>
                        <div className="text-xs text-gray-400">{fecha.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-600">{comp.ubicacion}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2.5 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${status.color}`}>
                          {status.text}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button onClick={() => handleEdit(comp)} className="text-blue-600 hover:text-blue-900 mr-3 p-1 hover:bg-blue-50 rounded" title="Editar"><i className="bi bi-pencil-square"></i></button>
                        <button onClick={() => handleDelete(comp.id)} className="text-red-500 hover:text-red-700 p-1 hover:bg-red-50 rounded" title="Eliminar"><i className="bi bi-trash"></i></button>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal Simple */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-xl">
            <h3 className="text-xl font-bold text-sportify-dark mb-4 border-b pb-2">
              {editingComp ? 'Editar Competencia' : 'Crear Competencia'}
            </h3>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Nombre</label>
                <input type="text" className={`w-full border ${errors.nombre ? 'border-red-500' : 'border-gray-300'} rounded-lg px-3 py-2 outline-none focus:border-sportify-secondary`} {...register('nombre')} />
                {errors.nombre && <p className="text-red-500 text-xs mt-1">{errors.nombre.message}</p>}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Fecha Inicio</label>
                  <input type="datetime-local" className={`w-full border ${errors.fechaInicio ? 'border-red-500' : 'border-gray-300'} rounded-lg px-3 py-2 outline-none focus:border-sportify-secondary text-sm`} {...register('fechaInicio')} />
                  {errors.fechaInicio && <p className="text-red-500 text-xs mt-1">{errors.fechaInicio.message}</p>}
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Fecha Fin</label>
                  <input type="datetime-local" className={`w-full border ${errors.fechaFin ? 'border-red-500' : 'border-gray-300'} rounded-lg px-3 py-2 outline-none focus:border-sportify-secondary text-sm`} {...register('fechaFin')} />
                  {errors.fechaFin && <p className="text-red-500 text-xs mt-1">{errors.fechaFin.message}</p>}
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Lugar / Ubicación</label>
                <input type="text" className={`w-full border ${errors.ubicacion ? 'border-red-500' : 'border-gray-300'} rounded-lg px-3 py-2 outline-none focus:border-sportify-secondary`} {...register('ubicacion')} />
                {errors.ubicacion && <p className="text-red-500 text-xs mt-1">{errors.ubicacion.message}</p>}
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Descripción (Opcional)</label>
                <textarea rows={2} className="w-full border border-gray-300 rounded-lg px-3 py-2 outline-none focus:border-sportify-secondary" {...register('descripcion')}></textarea>
              </div>
              <div className="flex justify-end space-x-3 pt-4 border-t mt-6">
                <button type="button" onClick={() => { setShowModal(false); reset(); }} className="px-4 py-2 border rounded-lg text-gray-600 hover:bg-gray-50">Cancelar</button>
                <button type="submit" className="px-4 py-2 bg-sportify-primary text-white rounded-lg hover:bg-red-700 font-semibold">Guardar</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
