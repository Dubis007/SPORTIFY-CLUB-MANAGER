import React, { useState } from 'react';
import { Plus, Edit2, Trash2, Download, MapPin, Users, Phone, Building } from 'lucide-react';
import { useLocationsViewModel } from '../../viewmodels/useLocationsViewModel';

export default function LocationsPage() {
  const { locations, loading, error, createLocation, updateLocation, deleteLocation, downloadReport } = useLocationsViewModel();
  
  const [showModal, setShowModal] = useState(false);
  const [editingLocation, setEditingLocation] = useState<any>(null);
  const [formData, setFormData] = useState({ nombre: '', direccion: '', ciudad: '', telefono: '', activo: true });

  const openCreateModal = () => {
    setEditingLocation(null);
    setFormData({ nombre: '', direccion: '', ciudad: '', telefono: '', activo: true });
    setShowModal(true);
  };

  const openEditModal = (loc: any) => {
    setEditingLocation(loc);
    setFormData({ nombre: loc.nombre, direccion: loc.direccion, ciudad: loc.ciudad, telefono: loc.telefono || '', activo: loc.activo });
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    let success = false;
    if (editingLocation) {
      success = await updateLocation(editingLocation.id, formData);
    } else {
      success = await createLocation(formData);
    }
    
    if (success) setShowModal(false);
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('¿Estás seguro de desactivar esta sede?')) {
      await deleteLocation(id);
    }
  };

  if (loading && locations.length === 0) return <div className="p-8 text-center">Cargando sedes...</div>;

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <Building size={24} className="text-sportify-primary" /> Gestión de Sedes
          </h1>
          <p className="text-gray-600">Administra las instalaciones y sucursales del club.</p>
        </div>
        <div className="flex gap-3">
          <button onClick={downloadReport} className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 font-semibold rounded-lg hover:bg-gray-200 transition-colors">
            <Download size={20} /> Reporte PDF
          </button>
          <button onClick={openCreateModal} className="flex items-center gap-2 px-4 py-2 bg-sportify-primary text-white font-semibold rounded-lg hover:bg-red-700 transition-colors">
            <Plus size={20} /> Nueva Sede
          </button>
        </div>
      </div>

      {error && <div className="mb-4 p-4 bg-red-100 text-red-700 rounded-lg">{error}</div>}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {locations.map((loc) => (
          <div key={loc.id} className="bg-white rounded-xl shadow-sm border p-6 flex flex-col">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-xl font-bold text-gray-800">{loc.nombre}</h3>
              <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${loc.activo ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                {loc.activo ? 'ACTIVA' : 'INACTIVA'}
              </span>
            </div>
            
            <div className="space-y-3 flex-1 mb-6">
              <p className="text-gray-600 text-sm flex items-center gap-2"><MapPin size={16}/> {loc.ciudad} - {loc.direccion}</p>
              <p className="text-gray-600 text-sm flex items-center gap-2"><Phone size={16}/> {loc.telefono || 'Sin teléfono'}</p>
              
              <div className="pt-4 mt-4 border-t flex justify-between">
                <div className="text-center">
                  <p className="text-2xl font-bold text-sportify-primary">{loc.usuariosActivos}</p>
                  <p className="text-xs text-gray-500 font-semibold uppercase">Miembros</p>
                </div>
                <div className="text-center border-l pl-6">
                  <p className="text-2xl font-bold text-gray-800">{loc.empleados}</p>
                  <p className="text-xs text-gray-500 font-semibold uppercase">Empleados</p>
                </div>
              </div>
            </div>

            <div className="flex gap-2 justify-end mt-auto pt-4">
              <button onClick={() => openEditModal(loc)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"><Edit2 size={18} /></button>
              <button onClick={() => handleDelete(loc.id)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"><Trash2 size={18} /></button>
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">{editingLocation ? 'Editar Sede' : 'Nueva Sede'}</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
                <input required type="text" value={formData.nombre} onChange={e => setFormData({...formData, nombre: e.target.value})} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-sportify-primary outline-none" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Ciudad</label>
                  <input required type="text" value={formData.ciudad} onChange={e => setFormData({...formData, ciudad: e.target.value})} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-sportify-primary outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono</label>
                  <input type="text" value={formData.telefono} onChange={e => setFormData({...formData, telefono: e.target.value})} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-sportify-primary outline-none" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Dirección</label>
                <input required type="text" value={formData.direccion} onChange={e => setFormData({...formData, direccion: e.target.value})} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-sportify-primary outline-none" />
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" id="activo" checked={formData.activo} onChange={e => setFormData({...formData, activo: e.target.checked})} className="rounded text-sportify-primary focus:ring-sportify-primary" />
                <label htmlFor="activo" className="text-sm font-medium text-gray-700">Sede Activa</label>
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg">Cancelar</button>
                <button type="submit" className="px-4 py-2 bg-sportify-primary text-white rounded-lg hover:bg-red-700">Guardar Sede</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
