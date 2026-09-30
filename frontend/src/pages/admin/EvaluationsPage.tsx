import React, { useState } from 'react';
import { useEvaluationsViewModel } from '../../viewmodels/useEvaluationsViewModel';
import { Evaluation } from '../../models';

export default function EvaluationsPage() {
  const { evaluations, options, loading, error, createEvaluation, updateEvaluation, deleteEvaluation } = useEvaluationsViewModel();
  const [showModal, setShowModal] = useState(false);
  const [editingEvaluation, setEditingEvaluation] = useState<Evaluation | null>(null);
  
  const [formData, setFormData] = useState({
    inscripcionId: '',
    puntaje: '',
    desempeno: '',
    comentarios: ''
  });

  const handleAddNew = () => {
    setEditingEvaluation(null);
    setFormData({ inscripcionId: '', puntaje: '0', desempeno: 'Bueno', comentarios: '' });
    setShowModal(true);
  };

  const handleEdit = (evaluation: Evaluation) => {
    setEditingEvaluation(evaluation);
    setFormData({
      inscripcionId: evaluation.inscripcionId.toString(),
      puntaje: evaluation.puntaje?.toString() || '0',
      desempeno: evaluation.desempeno || 'Bueno',
      comentarios: evaluation.comentarios || ''
    });
    setShowModal(true);
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('¿Estás seguro de eliminar esta observación?')) {
      await deleteEvaluation(id);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      inscripcionId: parseInt(formData.inscripcionId),
      puntaje: parseFloat(formData.puntaje) || 0,
      desempeno: formData.desempeno,
      comentarios: formData.comentarios
    };

    let success = false;
    if (editingEvaluation) {
      success = await updateEvaluation(editingEvaluation.id, payload);
    } else {
      success = await createEvaluation(payload);
    }

    if (success) setShowModal(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center border-b pb-4">
        <div>
          <h1 className="text-2xl font-bold text-sportify-dark">OBSERVACIONES-COMPETENCIAS</h1>
          <p className="text-gray-500 text-sm">Registra y evalúa el desempeño de los miembros en competencias</p>
        </div>
        <button onClick={handleAddNew} className="bg-sportify-primary hover:bg-red-700 text-white px-4 py-2 rounded-lg font-semibold flex items-center shadow-sm">
          <i className="bi bi-star-fill mr-2"></i> Nueva Observación
        </button>
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-lg flex items-center border border-red-200">
          <i className="bi bi-exclamation-triangle mr-2"></i> {error}
        </div>
      )}

      {loading ? (
        <div className="text-center py-10 text-gray-500">Cargando...</div>
      ) : (
        <div className="bg-white border rounded-xl overflow-hidden shadow-sm">
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100 text-xs text-gray-500 uppercase tracking-wider">
                <th className="px-6 py-4 font-semibold rounded-tl-xl">Miembro</th>
                <th className="px-6 py-4 font-semibold">Competencia</th>
                <th className="px-6 py-4 font-semibold">Puntaje</th>
                <th className="px-6 py-4 font-semibold">Desempeño</th>
                <th className="px-6 py-4 font-semibold">Observaciones</th>
                <th className="px-6 py-4 font-semibold">Fecha</th>
                <th className="px-6 py-4 font-semibold text-right rounded-tr-xl">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {evaluations.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                    No hay observaciones registradas.
                  </td>
                </tr>
              ) : (
                evaluations.map(e => (
                  <tr key={e.id} className="hover:bg-gray-50 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="font-semibold text-gray-800">{e.usuarioNombre}</div>
                      <div className="text-xs text-gray-500">ID: {e.id}</div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {e.competenciaNombre}
                    </td>
                    <td className="px-6 py-4 font-bold text-sportify-primary">
                      {e.puntaje}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 inline-flex text-xs leading-5 font-bold rounded-full ${
                        e.desempeno === 'SOBRESALIENTE' ? 'bg-purple-100 text-purple-800' :
                        e.desempeno === 'Excelente' ? 'bg-green-100 text-green-800' :
                        e.desempeno === 'Bueno' ? 'bg-blue-100 text-blue-800' :
                        'bg-orange-100 text-orange-800'
                      }`}>
                        {e.desempeno || 'N/A'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {e.comentarios || '-'}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {new Date(e.evaluadoEn).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-right space-x-3">
                      <button onClick={() => handleEdit(e)} className="text-blue-600 hover:text-blue-800" title="Editar"><i className="bi bi-pencil-square text-lg"></i></button>
                      <button onClick={() => handleDelete(e.id)} className="text-red-600 hover:text-red-800" title="Eliminar"><i className="bi bi-trash text-lg"></i></button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl w-full max-w-lg p-6 shadow-xl">
            <h3 className="text-xl font-bold text-gray-800 mb-4 border-b pb-2">
              {editingEvaluation ? 'Editar Observación' : 'Nueva Observación'}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Inscripción / Miembro</label>
                <select 
                  required
                  disabled={!!editingEvaluation}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 outline-none focus:border-sportify-primary disabled:bg-gray-100"
                  value={formData.inscripcionId}
                  onChange={(e) => setFormData({ ...formData, inscripcionId: e.target.value })}
                >
                  <option value="">Seleccione una inscripción confirmada...</option>
                  {options?.map(opt => (
                    <option key={opt.id} value={opt.id}>
                      {opt.usuarioNombre} - {opt.competenciaNombre} ({new Date(opt.fechaInicio).toLocaleDateString()})
                    </option>
                  ))}
                </select>
                {options?.length === 0 && !editingEvaluation && (
                  <p className="text-xs text-red-500 mt-1">No hay inscripciones confirmadas o pagas disponibles.</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Puntaje</label>
                <input 
                  type="number"
                  step="0.1"
                  required
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 outline-none focus:border-sportify-primary"
                  placeholder="Ej: 9.5"
                  value={formData.puntaje}
                  onChange={(e) => setFormData({ ...formData, puntaje: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Desempeño</label>
                <select 
                  required
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 outline-none focus:border-sportify-primary"
                  value={formData.desempeno}
                  onChange={(e) => setFormData({ ...formData, desempeno: e.target.value })}
                >
                  <option value="Mejorar">Mejorar</option>
                  <option value="Bueno">Bueno</option>
                  <option value="Excelente">Excelente</option>
                  <option value="SOBRESALIENTE">SOBRESALIENTE</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Observaciones</label>
                <textarea 
                  rows={4}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 outline-none focus:border-sportify-primary"
                  placeholder="Detalles sobre el rendimiento en la competencia..."
                  value={formData.comentarios}
                  onChange={(e) => setFormData({ ...formData, comentarios: e.target.value })}
                ></textarea>
              </div>

              <div className="flex justify-end space-x-3 pt-4 border-t mt-4">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 border rounded-lg hover:bg-gray-50 font-medium">Cancelar</button>
                <button type="submit" className="px-4 py-2 bg-sportify-primary text-white rounded-lg hover:bg-red-700 font-semibold shadow">Guardar</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
