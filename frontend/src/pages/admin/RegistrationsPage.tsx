import React, { useState } from 'react';
import { useRegistrationsViewModel } from '../../viewmodels/useRegistrationsViewModel';
import { Registration } from '../../models';

export default function RegistrationsPage() {
  const { registrations, options, loading, error, createRegistration, updateRegistration, deleteRegistration } = useRegistrationsViewModel();
  const [showModal, setShowModal] = useState(false);
  const [editingRegistration, setEditingRegistration] = useState<Registration | null>(null);
  const [formData, setFormData] = useState({
    usuarioId: '',
    competenciaId: '',
    estado: 'PENDIENTE'
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
      estado: registration.estado
    });
    setShowModal(true);
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('¿Estás seguro de eliminar esta inscripción?')) {
      await deleteRegistration(id);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      usuarioId: parseInt(formData.usuarioId),
      competenciaId: parseInt(formData.competenciaId),
      estado: formData.estado
    };

    let success = false;
    if (editingRegistration) {
      success = await updateRegistration(editingRegistration.id, payload);
    } else {
      success = await createRegistration(payload);
    }

    if (success) setShowModal(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center border-b pb-4">
        <div>
          <h1 className="text-2xl font-bold text-sportify-dark">Inscripciones</h1>
          <p className="text-gray-500 text-sm">Gestiona las inscripciones a competencias</p>
        </div>
        <button onClick={handleAddNew} className="bg-sportify-primary hover:bg-red-700 text-white px-4 py-2 rounded-lg font-semibold flex items-center shadow-sm">
          <i className="bi bi-person-plus-fill mr-2"></i> Inscribir Miembro
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
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Miembro</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Competencia</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Fecha</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Estado</th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-gray-600 uppercase">Acciones</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {registrations.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-10 text-center text-gray-500">No hay inscripciones.</td>
                </tr>
              ) : (
                registrations.map((r) => (
                  <tr key={r.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-semibold text-gray-800">{r.usuarioNombre || `ID: ${r.usuarioId}`}</div>
                      <div className="text-xs text-gray-500">ID: {r.usuarioId}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-semibold text-gray-800">{r.competenciaNombre || `ID: ${r.competenciaId}`}</div>
                      <div className="text-xs text-gray-500">ID: {r.competenciaId}</div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {new Date(r.fechaInscripcion).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        r.estado === 'CONFIRMADA' ? 'bg-green-100 text-green-800' : 
                        r.estado === 'PAGO' ? 'bg-blue-100 text-blue-800' :
                        r.estado === 'CANCELADA' ? 'bg-red-100 text-red-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {r.estado}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right space-x-3">
                      <button onClick={() => handleEdit(r)} className="text-blue-600 hover:text-blue-800" title="Editar"><i className="bi bi-pencil-square text-lg"></i></button>
                      <button onClick={() => handleDelete(r.id)} className="text-red-600 hover:text-red-800" title="Eliminar"><i className="bi bi-trash text-lg"></i></button>
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
          <div className="bg-white rounded-xl w-full max-w-md p-6 shadow-xl">
            <h3 className="text-xl font-bold text-gray-800 mb-4 border-b pb-2">
              {editingRegistration ? 'Editar Inscripción' : 'Inscribir Miembro'}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Seleccionar Miembro</label>
                <select 
                  required
                  disabled={!!editingRegistration}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 outline-none focus:border-sportify-primary disabled:bg-gray-100"
                  value={formData.usuarioId}
                  onChange={(e) => setFormData({ ...formData, usuarioId: e.target.value })}
                >
                  <option value="">Seleccione...</option>
                  {options.members?.map(m => (
                    <option key={m.id} value={m.id}>{m.nombre} {m.apellido} (ID: {m.id})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Competencia</label>
                <select 
                  required
                  disabled={!!editingRegistration}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 outline-none focus:border-sportify-primary disabled:bg-gray-100"
                  value={formData.competenciaId}
                  onChange={(e) => setFormData({ ...formData, competenciaId: e.target.value })}
                >
                  <option value="">Seleccione...</option>
                  {options.competitions?.map(c => (
                    <option key={c.id} value={c.id}>{c.nombre} ({new Date(c.fechaInicio).toLocaleDateString()})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Estado</label>
                <select 
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 outline-none focus:border-sportify-primary"
                  value={formData.estado}
                  onChange={(e) => setFormData({ ...formData, estado: e.target.value })}
                >
                  <option value="PENDIENTE">PENDIENTE</option>
                  <option value="CONFIRMADA">CONFIRMADA</option>
                  <option value="PAGO">PAGO</option>
                  <option value="CANCELADA">CANCELADA</option>
                </select>
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
