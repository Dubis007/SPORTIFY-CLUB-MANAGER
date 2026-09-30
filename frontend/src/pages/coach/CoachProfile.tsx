import React, { useState } from 'react';
import { User, Lock, AlertTriangle } from 'lucide-react';
import { useProfileViewModel } from '../../viewmodels/useProfileViewModel';

export default function CoachProfile() {
  const { profile, loading, error, changePassword } = useProfileViewModel();
  
  const [pwdData, setPwdData] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [pwdSuccess, setPwdSuccess] = useState('');

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
          <h1 className="text-2xl font-bold text-gray-800">Mi Perfil</h1>
          <p className="text-gray-600">Gestiona tus datos personales y contraseña.</p>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-100 text-red-700 rounded-lg flex items-center">
          <AlertTriangle size={20} className="mr-2" /> {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4">
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
            <User size={20} className="text-sportify-primary"/> Datos Personales
          </h3>
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
              <p className="text-sm text-gray-500 font-semibold">Rol Asignado</p>
              <p className="text-gray-800 font-bold uppercase">ENTRENADOR</p>
            </div>
            <div>
              <p className="text-sm text-gray-500 font-semibold">Estado en el Sistema</p>
              <p>{profile?.activo ? <span className="text-green-600 font-bold">ACTIVO</span> : <span className="text-red-600 font-bold">INACTIVO</span>}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border p-6">
          <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
            <Lock size={20} className="text-sportify-primary"/> Cambiar Contraseña
          </h3>
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
            <button type="submit" className="bg-sportify-primary text-white px-4 py-2 rounded-lg font-semibold w-full hover:bg-red-700 transition-colors">Actualizar Contraseña</button>
          </form>
        </div>
      </div>
    </div>
  );
}
