import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { User, Lock, AlertTriangle, Cake, Save } from 'lucide-react';
import { useProfileViewModel } from '../../viewmodels/useProfileViewModel';

export default function CoachProfile() {
  const { profile, loading, error, changePassword, updateBirthDate } = useProfileViewModel();

  const [pwdData, setPwdData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [savingPwd, setSavingPwd] = useState(false);
  const [birthDateInput, setBirthDateInput] = useState('');
  const [savingBirthDate, setSavingBirthDate] = useState(false);

  useEffect(() => {
    setBirthDateInput(profile?.fechaNacimiento ? profile.fechaNacimiento.substring(0, 10) : '');
  }, [profile?.fechaNacimiento]);

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (pwdData.newPassword !== pwdData.confirmPassword) {
      toast.error('Las contraseñas nuevas no coinciden.');
      return;
    }
    setSavingPwd(true);
    const success = await changePassword({
      currentPassword: pwdData.currentPassword,
      newPassword: pwdData.newPassword,
    });
    setSavingPwd(false);
    if (success) {
      toast.success('Contraseña actualizada correctamente.');
      setPwdData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    }
  };

  const handleSaveBirthDate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingBirthDate(true);
    const ok = await updateBirthDate(birthDateInput || null);
    setSavingBirthDate(false);
    if (ok) {
      toast.success('Fecha de nacimiento actualizada.');
    }
  };

  if (loading && !profile) {
    return (
      <div className="space-y-6 animate-pulse" aria-busy="true">
        <div className="h-14 bg-slate-900 border border-slate-800 rounded-xl w-1/3" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="h-64 bg-slate-900 border border-slate-800 rounded-2xl" />
          <div className="h-64 bg-slate-900 border border-slate-800 rounded-2xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="border-b border-slate-800 pb-4">
        <span className="text-[11px] font-bold uppercase tracking-widest text-blue-400">
          Cuenta Personal
        </span>
        <h1 className="text-2xl font-bold text-slate-100 mt-0.5">Mi Perfil Técnico</h1>
        <p className="text-slate-400 text-xs mt-1">
          Consulta tu información institucional, registra tu cumpleaños y actualiza tu contraseña.
        </p>
      </div>

      {error && (
        <div className="p-4 bg-rose-500/10 border border-rose-500/30 text-rose-300 rounded-xl flex items-center text-xs gap-2">
          <AlertTriangle size={18} className="shrink-0" /> {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-6 space-y-5">
          <h3 className="font-bold text-base text-slate-100 flex items-center gap-2">
            <User size={18} className="text-blue-400" /> Datos Personales
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-xs text-slate-400 uppercase font-semibold">Nombre Completo</p>
              <p className="text-slate-100 font-medium mt-0.5">
                {profile?.nombre} {profile?.apellido}
              </p>
            </div>
            <div>
              <p className="text-xs text-slate-400 uppercase font-semibold">Estado</p>
              <span
                className={`inline-block mt-1 px-2.5 py-0.5 rounded-full text-xs font-bold ${
                  profile?.activo
                    ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                    : 'bg-rose-500/15 text-rose-400 border border-rose-500/30'
                }`}
              >
                {profile?.activo ? 'ACTIVO' : 'INACTIVO'}
              </span>
            </div>
            <div className="sm:col-span-2">
              <p className="text-xs text-slate-400 uppercase font-semibold">Correo Institucional</p>
              <p className="text-slate-100 font-medium mt-0.5">{profile?.correo}</p>
            </div>
          </div>

          <form
            onSubmit={handleSaveBirthDate}
            className="pt-4 border-t border-slate-800 space-y-2"
          >
            <label
              htmlFor="coach-birthdate"
              className="text-xs text-slate-300 font-semibold flex items-center gap-1.5"
            >
              <Cake size={14} className="text-amber-400" /> Fecha de Nacimiento
            </label>
            <div className="flex items-center gap-2">
              <input
                id="coach-birthdate"
                type="date"
                value={birthDateInput}
                onChange={(e) => setBirthDateInput(e.target.value)}
                className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-sm text-slate-100 outline-none focus:border-blue-500"
              />
              <button
                type="submit"
                disabled={savingBirthDate}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-slate-100 border border-slate-700 rounded-xl text-xs font-semibold transition-colors"
              >
                <Save size={13} /> {savingBirthDate ? 'Guardando...' : 'Guardar'}
              </button>
            </div>
            <p className="text-[11px] text-slate-500">
              Se mostrará como aviso de próximo cumpleaños en el calendario del club.
            </p>
          </form>
        </div>

        <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-6">
          <h3 className="font-bold text-base text-slate-100 mb-4 flex items-center gap-2">
            <Lock size={18} className="text-blue-400" /> Cambiar Contraseña
          </h3>
          <form onSubmit={handleChangePassword} className="space-y-4">
            <div>
              <label className="block text-xs text-slate-300 mb-1">Contraseña Actual</label>
              <input
                type="password"
                required
                value={pwdData.currentPassword}
                onChange={(e) => setPwdData({ ...pwdData, currentPassword: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-sm text-slate-100 outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs text-slate-300 mb-1">Nueva Contraseña</label>
              <input
                type="password"
                required
                minLength={6}
                value={pwdData.newPassword}
                onChange={(e) => setPwdData({ ...pwdData, newPassword: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-sm text-slate-100 outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs text-slate-300 mb-1">
                Confirmar Nueva Contraseña
              </label>
              <input
                type="password"
                required
                minLength={6}
                value={pwdData.confirmPassword}
                onChange={(e) => setPwdData({ ...pwdData, confirmPassword: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-sm text-slate-100 outline-none focus:border-blue-500"
              />
            </div>
            <button
              type="submit"
              disabled={savingPwd}
              className="bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white px-4 py-2.5 rounded-xl font-semibold text-xs w-full transition-colors"
            >
              {savingPwd ? 'Actualizando...' : 'Actualizar Contraseña'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
