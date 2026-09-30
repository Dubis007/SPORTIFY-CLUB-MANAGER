import React, { useState } from 'react';
import { DollarSign, Download, Check, X, Clock, AlertTriangle, User, Lock, PlusCircle, CreditCard } from 'lucide-react';
import { useAccountantViewModel } from '../../viewmodels/useAccountantViewModel';
import { Payment } from '../../models';
import { apiClient } from '../../services/api/apiClient';
import MembershipsPage from '../admin/MembershipsPage';

export default function AccountantDashboard() {
  const { payments, profile, options, loading, error, approvePayment, rejectPayment, registerManualPayment, downloadReport, changePassword } = useAccountantViewModel();
  
  const [activeTab, setActiveTab] = useState('pagos');
  const [rejectingPayment, setRejectingPayment] = useState<Payment | null>(null);
  const [comentario, setComentario] = useState('');
  
  // Profile State
  const [pwdData, setPwdData] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [pwdSuccess, setPwdSuccess] = useState('');

  // Manual Payment State
  const [manualPayment, setManualPayment] = useState({
    usuarioId: '',
    membresiaId: '',
    montoCOP: ''
  });

  const handleApprove = async (id: number) => {
    if (window.confirm('¿Estás seguro de aprobar este pago?')) {
      await approvePayment(id);
    }
  };

  const handleReject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rejectingPayment || !comentario) return;
    
    const success = await rejectPayment(rejectingPayment.id, comentario);
    if (success) {
      setRejectingPayment(null);
      setComentario('');
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPwdSuccess('');
    if (pwdData.newPassword !== pwdData.confirmPassword) {
      alert('Las contraseñas no coinciden');
      return;
    }
    const success = await changePassword({
      currentPassword: pwdData.currentPassword,
      newPassword: pwdData.newPassword
    });
    if (success) {
      setPwdSuccess('¡Contraseña actualizada correctamente!');
      setPwdData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    }
  };

  const handleManualPaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      usuarioId: parseInt(manualPayment.usuarioId),
      membresiaId: manualPayment.membresiaId ? parseInt(manualPayment.membresiaId) : undefined,
      montoCOP: parseFloat(manualPayment.montoCOP)
    };

    const success = await registerManualPayment(payload);
    if (success) {
      alert('Pago registrado exitosamente.');
      setManualPayment({ usuarioId: '', membresiaId: '', montoCOP: '' });
      setActiveTab('pagos');
    }
  };

  const handleDownloadReceipt = async (pagoId: number) => {
    try {
      const response = await apiClient.get(`/api/receipts/${pagoId}/preview`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Comprobante_Pago_${pagoId}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      alert('No se pudo descargar el comprobante. Puede que no tenga archivo adjunto.');
    }
  };

  const getStatusBadge = (estado: string) => {
    switch (estado) {
      case 'APROBADO':
        return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700"><Check size={12} /> Aprobado</span>;
      case 'RECHAZADO':
        return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700"><X size={12} /> Rechazado</span>;
      default:
        return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-700"><Clock size={12} /> Pendiente</span>;
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const pendingCount = payments.filter(p => p.estado === 'PENDIENTE').length;
  const approvedTotal = payments.filter(p => p.estado === 'APROBADO').reduce((sum, p) => sum + p.montoCOP, 0);

  if (loading && payments.length === 0) {
    return <div className="p-8 text-center text-gray-500">Cargando datos...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between md:items-end border-b pb-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Panel del Contador</h1>
          <p className="text-gray-600">Bienvenido, {profile?.nombre}</p>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-100 text-red-700 rounded-lg flex items-center">
          <AlertTriangle size={20} className="mr-2" /> {error}
        </div>
      )}

      {/* TABS */}
      <div className="flex space-x-1 border-b">
        <button
          onClick={() => setActiveTab('pagos')}
          className={`py-3 px-6 text-sm font-semibold border-b-2 transition-colors ${activeTab === 'pagos' ? 'border-sportify-primary text-sportify-primary' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
        >
          <div className="flex items-center gap-2"><CreditCard size={16} /> Dashboard (Pagos)</div>
        </button>
        <button
          onClick={() => setActiveTab('manual')}
          className={`py-3 px-6 text-sm font-semibold border-b-2 transition-colors ${activeTab === 'manual' ? 'border-sportify-primary text-sportify-primary' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
        >
          <div className="flex items-center gap-2"><PlusCircle size={16} /> Registrar Pago Manual</div>
        </button>
        <button
          onClick={() => setActiveTab('membresias')}
          className={`py-3 px-6 text-sm font-semibold border-b-2 transition-colors ${activeTab === 'membresias' ? 'border-sportify-primary text-sportify-primary' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
        >
          <div className="flex items-center gap-2"><User size={16} /> Gestión de Membresías</div>
        </button>
        <button
          onClick={() => setActiveTab('perfil')}
          className={`py-3 px-6 text-sm font-semibold border-b-2 transition-colors ${activeTab === 'perfil' ? 'border-sportify-primary text-sportify-primary' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
        >
          <div className="flex items-center gap-2"><User size={16} /> Mi Perfil</div>
        </button>
      </div>

      <div className="pt-4">
        {/* PAGOS */}
        {activeTab === 'pagos' && (
          <>
            <div className="flex justify-end mb-4">
              <button
                onClick={downloadReport}
                className="flex items-center gap-2 px-4 py-2 bg-sportify-primary text-white rounded-lg hover:bg-red-700 transition-colors shadow"
              >
                <Download size={20} /> Exportar Reporte Financiero
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div className="bg-white rounded-xl shadow-sm p-6 border flex items-center gap-4">
                <div className="w-12 h-12 bg-yellow-50 text-yellow-600 rounded-full flex items-center justify-center">
                  <Clock size={24} />
                </div>
                <div>
                  <p className="text-sm text-gray-500 font-medium">Pagos Pendientes por Revisar</p>
                  <h3 className="text-2xl font-bold text-gray-800">{pendingCount}</h3>
                </div>
              </div>
              
              <div className="bg-white rounded-xl shadow-sm p-6 border flex items-center gap-4">
                <div className="w-12 h-12 bg-green-50 text-green-600 rounded-full flex items-center justify-center">
                  <DollarSign size={24} />
                </div>
                <div>
                  <p className="text-sm text-gray-500 font-medium">Total Recaudado (Aprobado)</p>
                  <h3 className="text-2xl font-bold text-gray-800">{formatCurrency(approvedTotal)}</h3>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm overflow-hidden border">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-100">
                      <th className="p-4 font-semibold text-gray-600">ID Pago</th>
                      <th className="p-4 font-semibold text-gray-600">Usuario</th>
                      <th className="p-4 font-semibold text-gray-600">Monto</th>
                      <th className="p-4 font-semibold text-gray-600">Fecha Pago</th>
                      <th className="p-4 font-semibold text-gray-600 text-center">Estado</th>
                      <th className="p-4 font-semibold text-gray-600 text-center">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {payments.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="p-8 text-center text-gray-500">No hay pagos registrados.</td>
                      </tr>
                    ) : (
                      payments.map((payment) => (
                        <tr key={payment.id} className="border-b border-gray-50 hover:bg-gray-50">
                          <td className="p-4 text-gray-600">#{payment.id}</td>
                          <td className="p-4 font-medium text-gray-800">{payment.nombreUsuario}</td>
                          <td className="p-4 font-bold text-gray-800">{formatCurrency(payment.montoCOP)}</td>
                          <td className="p-4 text-gray-600">{new Date(payment.fechaPago).toLocaleDateString()}</td>
                          <td className="p-4 text-center">
                            {getStatusBadge(payment.estado)}
                          </td>
                          <td className="p-4 text-center space-x-2">
                            <button onClick={() => handleDownloadReceipt(payment.id)} className="text-blue-600 hover:text-blue-800 text-sm font-semibold underline">Ver Anexo</button>
                            {payment.estado === 'PENDIENTE' && (
                              <>
                                <button
                                  onClick={() => handleApprove(payment.id)}
                                  className="px-3 py-1 bg-green-100 text-green-700 hover:bg-green-200 rounded text-sm font-medium transition-colors"
                                >
                                  Aprobar
                                </button>
                                <button
                                  onClick={() => setRejectingPayment(payment)}
                                  className="px-3 py-1 bg-red-100 text-red-700 hover:bg-red-200 rounded text-sm font-medium transition-colors"
                                >
                                  Rechazar
                                </button>
                              </>
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}

        {/* REGISTRAR PAGO MANUAL */}
        {activeTab === 'manual' && (
          <div className="bg-white rounded-xl shadow-sm border p-6 max-w-2xl mx-auto">
            <h3 className="font-bold text-lg mb-4 flex items-center gap-2"><PlusCircle size={20} className="text-sportify-primary"/> Registrar Nuevo Ingreso</h3>
            <p className="text-gray-500 text-sm mb-6">Usa este formulario para registrar pagos recibidos en efectivo o consignaciones directas que no pasaron por el portal del miembro. Este pago quedará Aprobado automáticamente.</p>
            
            <form onSubmit={handleManualPaymentSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Miembro</label>
                <select 
                  required
                  className="w-full border rounded-lg px-3 py-2 outline-none focus:border-sportify-primary"
                  value={manualPayment.usuarioId}
                  onChange={(e) => setManualPayment({...manualPayment, usuarioId: e.target.value})}
                >
                  <option value="">Seleccione el miembro que realiza el pago...</option>
                  {options.Members?.map((m: any) => (
                    <option key={m.id} value={m.id}>{m.nombre} {m.apellido} (ID: {m.id})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Membresía a Pagar (Opcional)</label>
                <select 
                  className="w-full border rounded-lg px-3 py-2 outline-none focus:border-sportify-primary"
                  value={manualPayment.membresiaId}
                  onChange={(e) => setManualPayment({...manualPayment, membresiaId: e.target.value})}
                >
                  <option value="">Ninguna - Cobro por otros servicios</option>
                  {manualPayment.usuarioId && options.Memberships?.filter((mem: any) => mem.usuarioId.toString() === manualPayment.usuarioId).map((mem: any) => (
                    <option key={mem.id} value={mem.id}>Plan {mem.plan} - {mem.estado} ({new Date(mem.fechaInicio).toLocaleDateString()})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Monto (COP)</label>
                <input 
                  type="number" 
                  required 
                  min="1000"
                  value={manualPayment.montoCOP}
                  onChange={(e) => setManualPayment({...manualPayment, montoCOP: e.target.value})}
                  className="w-full border rounded-lg px-3 py-2 outline-none focus:border-sportify-primary" 
                  placeholder="Ej. 100000"
                />
              </div>

              <button type="submit" className="bg-sportify-primary text-white px-4 py-2 rounded-lg font-semibold w-full hover:bg-red-700">Registrar Pago en Sistema</button>
            </form>
          </div>
        )}

        {/* MEMBRESIAS */}
        {activeTab === 'membresias' && (
          <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
             <MembershipsPage />
          </div>
        )}

        {/* PERFIL */}
        {activeTab === 'perfil' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white rounded-xl shadow-sm border p-6">
              <h3 className="font-bold text-lg mb-4 flex items-center gap-2"><User size={20} className="text-sportify-primary"/> Datos Personales</h3>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-500 font-semibold">Nombre Completo</p>
                  <p className="text-gray-800 text-lg">{profile?.nombre} {profile?.apellido}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 font-semibold">Correo Electrónico</p>
                  <p className="text-gray-800 text-lg">{profile?.correo}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 font-semibold">Rol</p>
                  <p className="text-gray-800 font-bold uppercase">CONTADOR</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border p-6">
              <h3 className="font-bold text-lg mb-4 flex items-center gap-2"><Lock size={20} className="text-sportify-primary"/> Cambiar Contraseña</h3>
              {pwdSuccess && <div className="mb-4 p-3 bg-green-100 text-green-700 rounded-lg text-sm font-semibold">{pwdSuccess}</div>}
              <form onSubmit={handleChangePassword} className="space-y-4">
                <div>
                  <label className="block text-sm text-gray-700 mb-1">Contraseña Actual</label>
                  <input type="password" required value={pwdData.currentPassword} onChange={e => setPwdData({...pwdData, currentPassword: e.target.value})} className="w-full border rounded-lg px-3 py-2 outline-none focus:border-sportify-primary" />
                </div>
                <div>
                  <label className="block text-sm text-gray-700 mb-1">Nueva Contraseña</label>
                  <input type="password" required value={pwdData.newPassword} onChange={e => setPwdData({...pwdData, newPassword: e.target.value})} className="w-full border rounded-lg px-3 py-2 outline-none focus:border-sportify-primary" />
                </div>
                <div>
                  <label className="block text-sm text-gray-700 mb-1">Confirmar Nueva Contraseña</label>
                  <input type="password" required value={pwdData.confirmPassword} onChange={e => setPwdData({...pwdData, confirmPassword: e.target.value})} className="w-full border rounded-lg px-3 py-2 outline-none focus:border-sportify-primary" />
                </div>
                <button type="submit" className="bg-sportify-primary text-white px-4 py-2 rounded-lg font-semibold w-full hover:bg-red-700">Actualizar Contraseña</button>
              </form>
            </div>
          </div>
        )}

      </div>

      {/* Modal de Rechazo */}
      {rejectingPayment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
            <div className="flex items-center gap-3 mb-4 text-red-600">
              <AlertTriangle size={24} />
              <h2 className="text-xl font-bold">Rechazar Pago</h2>
            </div>
            <p className="text-gray-600 mb-4">
              Por favor, indica el motivo del rechazo para el pago de <strong>{rejectingPayment.nombreUsuario}</strong>.
            </p>
            <form onSubmit={handleReject} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Motivo / Comentario</label>
                <textarea
                  required
                  rows={3}
                  value={comentario}
                  onChange={e => setComentario(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 outline-none resize-none"
                  placeholder="Ej: El comprobante está borroso, monto incorrecto..."
                />
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setRejectingPayment(null)}
                  className="px-4 py-2 text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  Confirmar Rechazo
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
