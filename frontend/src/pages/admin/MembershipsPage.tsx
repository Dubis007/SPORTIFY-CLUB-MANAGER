import React, { useState } from 'react';
import { Plus, CreditCard, Check, X, Clock, AlertTriangle } from 'lucide-react';
import { useMembershipsViewModel } from '../../viewmodels/useMembershipsViewModel';
import { useUsersViewModel } from '../../viewmodels/useUsersViewModel';
import { CreateMembershipDto } from '../../services/api/membershipService';

export default function MembershipsPage() {
  const { memberships, plans, loading, error, createMembership, updateStatus } = useMembershipsViewModel();
  const { users } = useUsersViewModel();
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const [formData, setFormData] = useState({
    usuarioId: 0,
    planMembresiaId: 0,
    fechaInicio: new Date().toISOString().split('T')[0]
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.usuarioId || !formData.planMembresiaId) {
      alert('Por favor selecciona un usuario y un plan.');
      return;
    }
    
    const createDto: CreateMembershipDto = {
      usuarioId: formData.usuarioId,
      planMembresiaId: formData.planMembresiaId,
      fechaInicio: new Date(formData.fechaInicio).toISOString()
    };
    
    const success = await createMembership(createDto);
    if (success) {
      setIsModalOpen(false);
      setFormData({ usuarioId: 0, planMembresiaId: 0, fechaInicio: new Date().toISOString().split('T')[0] });
    }
  };

  const getStatusBadge = (estado: string) => {
    switch (estado) {
      case 'ACTIVA':
        return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700"><Check size={12} /> Activa</span>;
      case 'VENCIDA':
        return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700"><X size={12} /> Vencida</span>;
      case 'SUSPENDIDA':
        return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-700"><AlertTriangle size={12} /> Suspendida</span>;
      default:
        return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700"><Clock size={12} /> Pendiente</span>;
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-CO');
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Gestión de Membresías</h1>
          <p className="text-gray-600">Administra las suscripciones y planes de los usuarios</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-sportify-primary text-white rounded-lg hover:bg-red-700 transition-colors"
        >
          <Plus size={20} />
          Asignar Membresía
        </button>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-100 text-red-700 rounded-lg">
          {error}
        </div>
      )}

      {/* Planes Resumen */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {plans.map(plan => (
          <div key={plan.id} className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 flex flex-col items-center text-center">
            <div className="w-12 h-12 bg-red-50 text-sportify-primary rounded-full flex items-center justify-center mb-4">
              <CreditCard size={24} />
            </div>
            <h3 className="text-lg font-bold text-gray-800 mb-1">{plan.nombre}</h3>
            <p className="text-gray-500 text-sm mb-3">{plan.descripcion}</p>
            <div className="text-2xl font-bold text-sportify-primary mb-1">{formatCurrency(plan.precioCOP)}</div>
            <div className="text-sm text-gray-500">{plan.duracionDias} días</div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="p-4 font-semibold text-gray-600">Usuario</th>
                <th className="p-4 font-semibold text-gray-600">Plan</th>
                <th className="p-4 font-semibold text-gray-600">Fecha Inicio</th>
                <th className="p-4 font-semibold text-gray-600">Fecha Fin</th>
                <th className="p-4 font-semibold text-gray-600 text-center">Estado</th>
                <th className="p-4 font-semibold text-gray-600 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-gray-500">
                    Cargando membresías...
                  </td>
                </tr>
              ) : memberships.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-gray-500">
                    No hay membresías registradas
                  </td>
                </tr>
              ) : (
                memberships.map((membership) => (
                  <tr key={membership.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                    <td className="p-4">
                      <div className="font-medium text-gray-800">{membership.usuarioNombre}</div>
                    </td>
                    <td className="p-4 text-gray-600">{membership.planNombre}</td>
                    <td className="p-4 text-gray-600">{formatDate(membership.fechaInicio)}</td>
                    <td className="p-4 text-gray-600">{formatDate(membership.fechaFin)}</td>
                    <td className="p-4 text-center">
                      {getStatusBadge(membership.estado)}
                    </td>
                    <td className="p-4 text-center">
                      <select 
                        className="text-sm border-gray-300 rounded-md shadow-sm focus:ring-sportify-primary focus:border-sportify-primary"
                        value={membership.estado}
                        onChange={(e) => updateStatus(membership.id, e.target.value)}
                      >
                        <option value="ACTIVA">Marcar Activa</option>
                        <option value="SUSPENDIDA">Suspender</option>
                        <option value="VENCIDA">Vencer</option>
                      </select>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">
              Asignar Nueva Membresía
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Usuario</label>
                <select
                  required
                  value={formData.usuarioId}
                  onChange={e => setFormData({...formData, usuarioId: Number(e.target.value)})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sportify-primary outline-none"
                >
                  <option value={0}>Selecciona un usuario...</option>
                  {users.filter(u => u.activo && u.rol === 'MIEMBRO').map(u => (
                    <option key={u.id} value={u.id}>{u.nombre} {u.apellido} ({u.correo})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Plan de Membresía</label>
                <select
                  required
                  value={formData.planMembresiaId}
                  onChange={e => setFormData({...formData, planMembresiaId: Number(e.target.value)})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sportify-primary outline-none"
                >
                  <option value={0}>Selecciona un plan...</option>
                  {plans.map(p => (
                    <option key={p.id} value={p.id}>{p.nombre} - {p.duracionDias} días</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Fecha de Inicio</label>
                <input
                  type="date"
                  required
                  value={formData.fechaInicio}
                  onChange={e => setFormData({...formData, fechaInicio: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sportify-primary outline-none"
                />
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-sportify-primary text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  Asignar Membresía
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
