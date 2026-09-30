import React, { useState } from 'react';
import { Plus, Edit2, Trash2, CalendarDays, DollarSign, Activity } from 'lucide-react';
import { usePlansViewModel } from '../../viewmodels/usePlansViewModel';

export default function PlansPage() {
  const { plans, loading, error, createPlan, updatePlan, deletePlan } = usePlansViewModel();
  
  const [showModal, setShowModal] = useState(false);
  const [editingPlan, setEditingPlan] = useState<any>(null);
  const [formData, setFormData] = useState({ nombre: '', descripcion: '', precioCOP: 0, duracionDias: 30, activo: true });

  const openCreateModal = () => {
    setEditingPlan(null);
    setFormData({ nombre: '', descripcion: '', precioCOP: 0, duracionDias: 30, activo: true });
    setShowModal(true);
  };

  const openEditModal = (plan: any) => {
    setEditingPlan(plan);
    setFormData({ nombre: plan.nombre, descripcion: plan.descripcion, precioCOP: plan.precioCOP, duracionDias: plan.duracionDias, activo: plan.activo });
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    let success = false;
    if (editingPlan) {
      success = await updatePlan(editingPlan.id, formData);
    } else {
      success = await createPlan(formData);
    }
    
    if (success) setShowModal(false);
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('¿Estás seguro de desactivar este plan? (Los usuarios con este plan activo no se verán afectados, pero ya no se podrá adquirir).')) {
      await deletePlan(id);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(amount);
  };

  if (loading && plans.length === 0) return <div className="p-8 text-center">Cargando planes...</div>;

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <Activity size={24} className="text-sportify-primary" /> Gestión de Planes de Membresía
          </h1>
          <p className="text-gray-600">Crea y administra los planes (1 Mes, Trimestral, Anual) disponibles para los atletas.</p>
        </div>
        <button onClick={openCreateModal} className="flex items-center gap-2 px-4 py-2 bg-sportify-primary text-white font-semibold rounded-lg hover:bg-red-700 transition-colors">
          <Plus size={20} /> Nuevo Plan
        </button>
      </div>

      {error && <div className="mb-4 p-4 bg-red-100 text-red-700 rounded-lg">{error}</div>}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {plans.map((plan) => (
          <div key={plan.id} className="bg-white rounded-xl shadow-sm border p-6 flex flex-col relative overflow-hidden">
            {!plan.activo && <div className="absolute top-0 right-0 bg-red-500 text-white text-xs font-bold px-3 py-1 rounded-bl-lg">INACTIVO</div>}
            
            <h3 className="text-2xl font-black text-gray-800 mb-2 uppercase">{plan.nombre}</h3>
            <p className="text-3xl font-bold text-sportify-primary mb-4">{formatCurrency(plan.precioCOP)}</p>
            <p className="text-gray-600 text-sm mb-6 flex-1">{plan.descripcion}</p>
            
            <div className="flex items-center gap-2 text-gray-700 font-semibold mb-6">
              <CalendarDays size={18} className="text-gray-400"/>
              Válido por {plan.duracionDias} días
            </div>

            <div className="flex gap-2 border-t pt-4">
              <button onClick={() => openEditModal(plan)} className="flex-1 flex justify-center items-center gap-2 py-2 text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg font-semibold transition-colors">
                <Edit2 size={18} /> Editar
              </button>
              {plan.activo && (
                <button onClick={() => handleDelete(plan.id)} className="flex-1 flex justify-center items-center gap-2 py-2 text-red-600 bg-red-50 hover:bg-red-100 rounded-lg font-semibold transition-colors">
                  <Trash2 size={18} /> Desactivar
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">{editingPlan ? 'Editar Plan' : 'Nuevo Plan'}</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nombre del Plan</label>
                <input required type="text" placeholder="Ej. Trimestral Premium" value={formData.nombre} onChange={e => setFormData({...formData, nombre: e.target.value})} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-sportify-primary outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
                <textarea required rows={3} placeholder="Beneficios del plan..." value={formData.descripcion} onChange={e => setFormData({...formData, descripcion: e.target.value})} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-sportify-primary outline-none resize-none" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Precio (COP)</label>
                  <input required type="number" min="0" value={formData.precioCOP} onChange={e => setFormData({...formData, precioCOP: Number(e.target.value)})} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-sportify-primary outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Duración (Días)</label>
                  <input required type="number" min="1" value={formData.duracionDias} onChange={e => setFormData({...formData, duracionDias: Number(e.target.value)})} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-sportify-primary outline-none" />
                </div>
              </div>
              <div className="flex items-center gap-2 pt-2">
                <input type="checkbox" id="activo" checked={formData.activo} onChange={e => setFormData({...formData, activo: e.target.checked})} className="rounded text-sportify-primary focus:ring-sportify-primary" />
                <label htmlFor="activo" className="text-sm font-medium text-gray-700">Plan habilitado para compra</label>
              </div>

              <div className="flex justify-end gap-3 mt-6 border-t pt-4">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg">Cancelar</button>
                <button type="submit" className="px-4 py-2 bg-sportify-primary text-white rounded-lg hover:bg-red-700">Guardar Plan</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
