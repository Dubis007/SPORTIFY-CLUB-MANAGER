import React, { useState } from 'react';
import { CreditCard, Upload, Check, X, Clock, AlertTriangle, FileUp, User, Lock, Calendar, Target, Medal, Activity, Plus } from 'lucide-react';
import { useMemberViewModel } from '../../viewmodels/useMemberViewModel';

export default function MemberDashboard() {
  const { profile, paymentsData, activitiesData, availableCompetitions, loading, error, uploading, changePassword, createPaymentAndUpload, registerForCompetition } = useMemberViewModel();
  const [activeTab, setActiveTab] = useState('membresias');
  const [showCompModal, setShowCompModal] = useState(false);
  
  // Payment State
  const [selectedMembership, setSelectedMembership] = useState<any | null>(null);
  const [monto, setMonto] = useState<string>('');
  const [file, setFile] = useState<File | null>(null);

  // Profile State
  const [pwdData, setPwdData] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [pwdSuccess, setPwdSuccess] = useState('');

  const handlePaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMembership || !monto || !file) return;

    const montoNum = parseFloat(monto);
    if (isNaN(montoNum) || montoNum < 1000) {
      alert('El monto debe ser un número válido mayor a $1.000 COP');
      return;
    }

    const success = await createPaymentAndUpload(selectedMembership.id, montoNum, file);
    if (success) {
      alert('Pago registrado y comprobante subido con éxito. El contador lo revisará pronto.');
      setSelectedMembership(null);
      setMonto('');
      setFile(null);
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

  const getStatusBadge = (estado: string) => {
    switch (estado) {
      case 'ACTIVA':
      case 'APROBADO':
      case 'CONFIRMADA':
        return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700"><Check size={12} /> {estado}</span>;
      case 'VENCIDA':
      case 'CANCELADA':
      case 'RECHAZADO':
        return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700"><X size={12} /> {estado}</span>;
      case 'SUSPENDIDA':
        return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-700"><AlertTriangle size={12} /> {estado}</span>;
      default:
        return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700"><Clock size={12} /> {estado}</span>;
    }
  };

  if (loading) {
    return (
      <div className="p-8 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sportify-primary mx-auto mb-4"></div>
        <p className="text-gray-500">Cargando tu información...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="mb-6 flex flex-col md:flex-row md:items-end justify-between border-b pb-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Panel de Miembro</h1>
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
          onClick={() => setActiveTab('perfil')}
          className={`py-3 px-6 text-sm font-semibold border-b-2 transition-colors ${activeTab === 'perfil' ? 'border-sportify-primary text-sportify-primary' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
        >
          <div className="flex items-center gap-2"><User size={16} /> Mi Perfil</div>
        </button>
        <button
          onClick={() => setActiveTab('membresias')}
          className={`py-3 px-6 text-sm font-semibold border-b-2 transition-colors ${activeTab === 'membresias' ? 'border-sportify-primary text-sportify-primary' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
        >
          <div className="flex items-center gap-2"><CreditCard size={16} /> Membresías y Pagos</div>
        </button>
        <button
          onClick={() => setActiveTab('actividades')}
          className={`py-3 px-6 text-sm font-semibold border-b-2 transition-colors ${activeTab === 'actividades' ? 'border-sportify-primary text-sportify-primary' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
        >
          <div className="flex items-center gap-2"><Activity size={16} /> Mis Actividades</div>
        </button>
      </div>

      {/* CONTENT */}
      <div className="pt-4">
        
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
                  <p className="text-sm text-gray-500 font-semibold">Estado en el Sistema</p>
                  <p>{profile?.activo ? <span className="text-green-600 font-bold">ACTIVO</span> : <span className="text-red-600 font-bold">INACTIVO</span>}</p>
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

        {/* MEMBRESÍAS Y PAGOS */}
        {activeTab === 'membresias' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-4 border-b bg-gray-50">
                  <h2 className="font-bold text-gray-800 flex items-center gap-2"><CreditCard size={18} className="text-sportify-primary" /> Mis Membresías</h2>
                </div>
                <div>
                  {paymentsData.Memberships?.length === 0 ? (
                    <p className="p-6 text-center text-gray-500">No tienes membresías registradas.</p>
                  ) : (
                    <ul className="divide-y divide-gray-100">
                      {paymentsData.Memberships?.map((m: any) => (
                        <li key={m.id} className="p-4 hover:bg-gray-50 transition-colors">
                          <div className="flex justify-between items-start mb-2">
                            <h4 className="font-bold text-gray-800">{m.plan}</h4>
                            {getStatusBadge(m.estado)}
                          </div>
                          <div className="text-sm text-gray-600 mb-3">
                            <p><strong>Inicio:</strong> {new Date(m.fechaInicio).toLocaleDateString()}</p>
                            <p><strong>Fin:</strong> {new Date(m.fechaFin).toLocaleDateString()}</p>
                          </div>
                          {m.estado !== 'ACTIVA' && (
                            <button
                              onClick={() => setSelectedMembership(m)}
                              className="w-full py-2 bg-sportify-primary text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium flex justify-center items-center gap-2"
                            >
                              <Upload size={16} /> Subir Comprobante de Pago
                            </button>
                          )}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-4 border-b bg-gray-50">
                  <h2 className="font-bold text-gray-800 flex items-center gap-2"><FileUp size={18} className="text-sportify-primary" /> Historial de Pagos</h2>
                </div>
                <div>
                  {paymentsData.Payments?.length === 0 ? (
                    <p className="p-6 text-center text-gray-500">No tienes pagos registrados.</p>
                  ) : (
                    <ul className="divide-y divide-gray-100">
                      {paymentsData.Payments?.map((p: any) => (
                        <li key={p.id} className="p-4 hover:bg-gray-50 transition-colors">
                          <div className="flex justify-between items-start mb-1">
                            <h4 className="font-bold text-gray-800">${p.montoCOP.toLocaleString()} COP</h4>
                            {getStatusBadge(p.estado)}
                          </div>
                          <div className="text-sm text-gray-600">
                            <p>{p.plan}</p>
                            <p className="text-xs mt-1 text-gray-400">Fecha: {new Date(p.fechaPago).toLocaleDateString()}</p>
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ACTIVIDADES */}
        {activeTab === 'actividades' && (
          <>
            <div className="flex justify-end mb-4">
              <button 
                onClick={() => setShowCompModal(true)} 
                className="flex items-center gap-2 px-4 py-2 bg-sportify-primary text-white font-semibold rounded-lg hover:bg-red-700 transition-colors shadow"
              >
                <Plus size={20} /> Inscribirse a Competencia
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
              {/* Mis Competencias */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden flex flex-col">
                <div className="p-4 border-b bg-gray-50">
                  <h2 className="font-bold text-gray-800 flex items-center gap-2"><Medal size={18} className="text-sportify-primary" /> Mis Competencias</h2>
                </div>
                <ul className="divide-y divide-gray-100 flex-1 overflow-y-auto max-h-80">
                  {activitiesData.competitions?.length === 0 ? (
                    <p className="p-6 text-center text-gray-500">No estás inscrito en competencias.</p>
                  ) : (
                    activitiesData.competitions?.map((c: any, i: number) => (
                      <li key={i} className="p-4 hover:bg-gray-50">
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="font-bold text-gray-800">{c.nombre}</h4>
                          {getStatusBadge(c.estadoInscripcion)}
                        </div>
                        <p className="text-sm text-gray-600"><Calendar size={12} className="inline mr-1"/> {new Date(c.fechaInicio).toLocaleDateString()}</p>
                        <p className="text-sm text-gray-600 mt-1"><Target size={12} className="inline mr-1"/> {c.ubicacion}</p>
                      </li>
                    ))
                  )}
                </ul>
              </div>

              {/* Entrenamientos Programados (El Entrenamiento de HOY) */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden flex flex-col">
                <div className="p-4 border-b bg-gray-50">
                  <h2 className="font-bold text-gray-800 flex items-center gap-2"><Clock size={18} className="text-sportify-primary" /> Próximos Entrenamientos</h2>
                </div>
                <ul className="divide-y divide-gray-100 flex-1 overflow-y-auto max-h-80">
                  {activitiesData.upcomingTrainings?.length === 0 ? (
                    <p className="p-6 text-center text-gray-500">No hay entrenamientos programados próximos.</p>
                  ) : (
                    activitiesData.upcomingTrainings?.slice(0, 5).map((t: any, i: number) => (
                      <li key={i} className="p-4 hover:bg-gray-50">
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="font-bold text-gray-800">{t.titulo}</h4>
                        </div>
                        <p className="text-sm text-gray-600 font-semibold mb-1"><Calendar size={12} className="inline mr-1"/> {new Date(t.fechaHora).toLocaleDateString()} a las {new Date(t.fechaHora).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
                      </li>
                    ))
                  )}
                </ul>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-4 border-b bg-gray-50">
                <h2 className="font-bold text-gray-800 flex items-center gap-2"><Activity size={18} className="text-sportify-primary" /> Historial de Asistencias a Entrenamientos</h2>
              </div>
              <ul className="divide-y divide-gray-100">
                {activitiesData.attendances?.length === 0 ? (
                  <p className="p-6 text-center text-gray-500">No tienes asistencias registradas.</p>
                ) : (
                  activitiesData.attendances?.map((a: any, i: number) => (
                    <li key={i} className="p-4 hover:bg-gray-50 flex justify-between items-center">
                      <div>
                        <h4 className="font-bold text-gray-800">{a.titulo}</h4>
                        <p className="text-sm text-gray-600 mt-1"><Calendar size={12} className="inline mr-1"/> {new Date(a.fechaHora).toLocaleDateString()}</p>
                      </div>
                      <span className="bg-blue-100 text-blue-800 text-xs px-3 py-1 rounded-full font-bold">ASISTIÓ</span>
                    </li>
                  ))
                )}
              </ul>
            </div>
          </>
        )}

      </div>

      {/* Modal de Pago */}
      {selectedMembership && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <FileUp size={24} className="text-sportify-primary" /> Reportar Pago
            </h2>
            <p className="text-sm text-gray-600 mb-4">
              Estás reportando el pago para tu plan <strong>{selectedMembership.plan}</strong>.
            </p>
            
            <form onSubmit={handlePaymentSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Monto Pagado (COP)</label>
                <input
                  type="number"
                  required
                  min="1000"
                  value={monto}
                  onChange={e => setMonto(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sportify-primary outline-none"
                  placeholder="Ej: 50000"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Comprobante (Archivo)</label>
                <input
                  type="file"
                  required
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={e => setFile(e.target.files ? e.target.files[0] : null)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sportify-primary outline-none text-sm"
                />
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setSelectedMembership(null)}
                  className="px-4 py-2 text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={uploading}
                  className="px-4 py-2 bg-sportify-primary text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
                >
                  {uploading ? 'Procesando...' : 'Enviar Reporte'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL PARA INSCRIBIRSE A COMPETENCIA */}
      {showCompModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <Medal size={24} className="text-sportify-primary" />
              Inscribirse a Competencia
            </h2>
            <p className="text-gray-600 text-sm mb-4">Selecciona una competencia próxima para registrar tu participación.</p>
            
            <div className="space-y-4 max-h-64 overflow-y-auto pr-2">
              {availableCompetitions.length === 0 ? (
                <p className="text-center text-gray-500 py-4">No hay competencias disponibles.</p>
              ) : (
                availableCompetitions.map(comp => {
                  const yaInscrito = activitiesData.competitions?.some((c: any) => c.competenciaId === comp.id);
                  return (
                    <div key={comp.id} className={`p-4 border rounded-lg ${yaInscrito ? 'bg-gray-50 border-gray-200' : 'bg-white border-sportify-primary'}`}>
                      <h4 className="font-bold text-gray-800">{comp.nombre}</h4>
                      <p className="text-xs text-gray-500 mb-2">{new Date(comp.fechaInicio).toLocaleDateString()} - {comp.ubicacion}</p>
                      {yaInscrito ? (
                        <span className="text-xs font-bold text-green-600 bg-green-100 px-2 py-1 rounded-full">Ya estás inscrito</span>
                      ) : (
                        <button 
                          onClick={async () => {
                            const success = await registerForCompetition(comp.id);
                            if (success) {
                              alert('Te has inscrito correctamente.');
                              setShowCompModal(false);
                            }
                          }}
                          className="text-sm px-3 py-1 bg-sportify-primary text-white rounded-md hover:bg-red-700 font-semibold w-full"
                        >
                          Inscribirme Ahora
                        </button>
                      )}
                    </div>
                  );
                })
              )}
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setShowCompModal(false)}
                className="px-4 py-2 text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
