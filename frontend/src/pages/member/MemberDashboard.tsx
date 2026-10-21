import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
  CreditCard,
  Upload,
  Check,
  X,
  Clock,
  AlertTriangle,
  FileUp,
  User,
  Lock,
  Calendar,
  Target,
  Medal,
  Activity,
  Plus,
} from 'lucide-react';
import { useMemberViewModel } from '../../viewmodels/useMemberViewModel';

export default function MemberDashboard() {
  const {
    profile,
    paymentsData,
    activitiesData,
    availableCompetitions,
    loading,
    error,
    uploading,
    changePassword,
    createPaymentAndUpload,
    registerForCompetition,
  } = useMemberViewModel();

  const [searchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') || 'membresias';

  const [showCompModal, setShowCompModal] = useState(false);

  const [selectedMembership, setSelectedMembership] = useState<any | null>(null);
  const [monto, setMonto] = useState<string>('');
  const [file, setFile] = useState<File | null>(null);

  const [pwdData, setPwdData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [pwdSuccess, setPwdSuccess] = useState('');

  const handlePaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMembership || !monto || !file) return;

    const montoNum = parseFloat(monto);
    if (isNaN(montoNum) || montoNum < 1000) {
      toast.error('El monto debe ser un número válido mayor a $1.000 COP');
      return;
    }

    const success = await createPaymentAndUpload(selectedMembership.id, montoNum, file);
    if (success) {
      toast.success('Pago registrado y comprobante enviado a auditoría contable.');
      setSelectedMembership(null);
      setMonto('');
      setFile(null);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPwdSuccess('');
    if (pwdData.newPassword !== pwdData.confirmPassword) {
      toast.error('Las contraseñas no coinciden.');
      return;
    }
    const success = await changePassword({
      currentPassword: pwdData.currentPassword,
      newPassword: pwdData.newPassword,
    });
    if (success) {
      setPwdSuccess('¡Contraseña actualizada correctamente!');
      toast.success('Contraseña actualizada.');
      setPwdData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    }
  };

  const getStatusBadge = (estado: string) => {
    switch (estado) {
      case 'ACTIVA':
      case 'APROBADO':
      case 'CONFIRMADA':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
            <Check size={12} /> {estado}
          </span>
        );
      case 'VENCIDA':
      case 'CANCELADA':
      case 'RECHAZADO':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-500/15 text-rose-400 border border-rose-500/30">
            <X size={12} /> {estado}
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-500/15 text-amber-400 border border-amber-500/30">
            <Clock size={12} /> {estado}
          </span>
        );
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-20 bg-slate-900 border border-slate-800 rounded-xl animate-pulse" />
        <div className="h-64 bg-slate-900 border border-slate-800 rounded-xl animate-pulse" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-end justify-between border-b border-slate-800 pb-4">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-widest text-blue-400">
            Portal de Autogestión del Atleta
          </span>
          <h1 className="text-2xl font-bold text-slate-100 mt-0.5">
            Bienvenido, {profile?.nombre || 'Mario'} {profile?.apellido || 'Miembro'}
          </h1>
          <p className="text-slate-400 text-xs mt-1">
            Consulta tu estado de membresía, sube soportes de pago y gestiona tu calendario de competencias
          </p>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-rose-500/10 border border-rose-500/30 text-rose-300 rounded-xl flex items-center text-xs">
          <AlertTriangle size={18} className="mr-2" /> {error}
        </div>
      )}

      {/* SECCIÓN 1: MEMBRESÍAS Y PAGOS */}
      {activeTab === 'membresias' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-slate-900/90 rounded-2xl border border-slate-800 overflow-hidden">
            <div className="p-4 border-b border-slate-800 bg-slate-950/50">
              <h2 className="font-bold text-slate-100 text-sm flex items-center gap-2">
                <CreditCard size={17} className="text-blue-400" /> Mis Membresías Suscritas
              </h2>
            </div>
            <div>
              {paymentsData.Memberships?.length === 0 ? (
                <p className="p-6 text-center text-slate-400 text-sm">
                  No tienes membresías registradas.
                </p>
              ) : (
                <ul className="divide-y divide-slate-800">
                  {paymentsData.Memberships?.map((m: any) => (
                    <li key={m.id} className="p-5 hover:bg-slate-800/40 transition-colors">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-bold text-slate-100 text-base">{m.plan}</h4>
                        {getStatusBadge(m.estado)}
                      </div>
                      <div className="text-xs text-slate-400 space-y-1 mb-4">
                        <p>
                          <strong className="text-slate-300">Vigencia desde:</strong>{' '}
                          {new Date(m.fechaInicio).toLocaleDateString('es-CO')}
                        </p>
                        <p>
                          <strong className="text-slate-300">Fecha de corte:</strong>{' '}
                          {new Date(m.fechaFin).toLocaleDateString('es-CO')}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setSelectedMembership(m)}
                        className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl transition-colors text-xs font-semibold flex justify-center items-center gap-2"
                      >
                        <Upload size={15} /> Subir Comprobante de Pago / Renovación
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          <div className="bg-slate-900/90 rounded-2xl border border-slate-800 overflow-hidden">
            <div className="p-4 border-b border-slate-800 bg-slate-950/50">
              <h2 className="font-bold text-slate-100 text-sm flex items-center gap-2">
                <FileUp size={17} className="text-emerald-400" /> Historial de Pagos Reportados
              </h2>
            </div>
            <div>
              {paymentsData.Payments?.length === 0 ? (
                <p className="p-6 text-center text-slate-400 text-sm">
                  No tienes pagos registrados.
                </p>
              ) : (
                <ul className="divide-y divide-slate-800">
                  {paymentsData.Payments?.map((p: any) => (
                    <li key={p.id} className="p-5 hover:bg-slate-800/40 transition-colors">
                      <div className="flex justify-between items-start mb-1">
                        <h4 className="font-bold text-slate-100 text-base">
                          ${p.montoCOP.toLocaleString('es-CO')} COP
                        </h4>
                        {getStatusBadge(p.estado)}
                      </div>
                      <div className="text-xs text-slate-400">
                        <p className="text-slate-300 font-medium">{p.plan}</p>
                        <p className="mt-1">
                          Fecha de registro: {new Date(p.fechaPago).toLocaleDateString('es-CO')}
                        </p>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      )}

      {/* SECCIÓN 2: MIS ACTIVIDADES Y TORNEOS */}
      {activeTab === 'actividades' && (
        <div className="space-y-6">
          <div className="flex justify-end">
            <button
              type="button"
              onClick={() => setShowCompModal(true)}
              className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl text-xs transition-colors shadow-sm"
            >
              <Plus size={16} /> Inscribirse a Competencia Oficial
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-slate-900/90 rounded-2xl border border-slate-800 overflow-hidden flex flex-col">
              <div className="p-4 border-b border-slate-800 bg-slate-950/50">
                <h2 className="font-bold text-slate-100 text-sm flex items-center gap-2">
                  <Medal size={17} className="text-blue-400" /> Mis Competencias Inscritas
                </h2>
              </div>
              <ul className="divide-y divide-slate-800 flex-1 overflow-y-auto max-h-80">
                {activitiesData.competitions?.length === 0 ? (
                  <p className="p-6 text-center text-slate-400 text-sm">
                    No estás inscrito en competencias.
                  </p>
                ) : (
                  activitiesData.competitions?.map((c: any, i: number) => (
                    <li key={i} className="p-4 hover:bg-slate-800/40">
                      <div className="flex justify-between items-start mb-1.5">
                        <h4 className="font-bold text-slate-100 text-sm">{c.nombre}</h4>
                        {getStatusBadge(c.estadoInscripcion)}
                      </div>
                      <p className="text-xs text-slate-400 flex items-center gap-1.5">
                        <Calendar size={12} className="text-blue-400" />{' '}
                        {new Date(c.fechaInicio).toLocaleDateString('es-CO')}
                      </p>
                      <p className="text-xs text-slate-400 flex items-center gap-1.5 mt-1">
                        <Target size={12} className="text-emerald-400" /> {c.ubicacion}
                      </p>
                    </li>
                  ))
                )}
              </ul>
            </div>

            <div className="bg-slate-900/90 rounded-2xl border border-slate-800 overflow-hidden flex flex-col">
              <div className="p-4 border-b border-slate-800 bg-slate-950/50">
                <h2 className="font-bold text-slate-100 text-sm flex items-center gap-2">
                  <Clock size={17} className="text-emerald-400" /> Próximos Entrenamientos
                </h2>
              </div>
              <ul className="divide-y divide-slate-800 flex-1 overflow-y-auto max-h-80">
                {activitiesData.upcomingTrainings?.length === 0 ? (
                  <p className="p-6 text-center text-slate-400 text-sm">
                    No hay entrenamientos programados próximos.
                  </p>
                ) : (
                  activitiesData.upcomingTrainings?.slice(0, 5).map((t: any, i: number) => (
                    <li key={i} className="p-4 hover:bg-slate-800/40">
                      <h4 className="font-bold text-slate-100 text-sm mb-1">{t.titulo}</h4>
                      <p className="text-xs text-slate-400 flex items-center gap-1.5">
                        <Calendar size={12} className="text-blue-400" />
                        {new Date(t.fechaHora).toLocaleDateString('es-CO')} ·{' '}
                        {new Date(t.fechaHora).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                    </li>
                  ))
                )}
              </ul>
            </div>
          </div>

          <div className="bg-slate-900/90 rounded-2xl border border-slate-800 overflow-hidden">
            <div className="p-4 border-b border-slate-800 bg-slate-950/50">
              <h2 className="font-bold text-slate-100 text-sm flex items-center gap-2">
                <Activity size={17} className="text-blue-400" /> Historial de Asistencias
              </h2>
            </div>
            <ul className="divide-y divide-slate-800">
              {activitiesData.attendances?.length === 0 ? (
                <p className="p-6 text-center text-slate-400 text-sm">
                  No tienes asistencias registradas.
                </p>
              ) : (
                activitiesData.attendances?.map((a: any, i: number) => (
                  <li
                    key={i}
                    className="p-4 hover:bg-slate-800/40 flex justify-between items-center"
                  >
                    <div>
                      <h4 className="font-bold text-slate-100 text-sm">{a.titulo}</h4>
                      <p className="text-xs text-slate-400 mt-0.5">
                        {new Date(a.fechaHora).toLocaleDateString('es-CO')}
                      </p>
                    </div>
                    <span className="bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 text-xs px-2.5 py-0.5 rounded-full font-semibold">
                      ASISTIÓ
                    </span>
                  </li>
                ))
              )}
            </ul>
          </div>
        </div>
      )}

      {/* SECCIÓN 3: PERFIL */}
      {activeTab === 'perfil' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-6">
            <h3 className="font-bold text-base text-slate-100 mb-4 flex items-center gap-2">
              <User size={18} className="text-blue-400" /> Ficha del Atleta
            </h3>
            <div className="space-y-4 text-sm">
              <div>
                <p className="text-xs text-slate-400 font-semibold uppercase">Nombre Completo</p>
                <p className="text-slate-100 font-medium mt-0.5">
                  {profile?.nombre} {profile?.apellido}
                </p>
              </div>
              <div>
                <p className="text-xs text-slate-400 font-semibold uppercase">Correo Electrónico</p>
                <p className="text-slate-100 font-medium mt-0.5">{profile?.correo}</p>
              </div>
              <div>
                <p className="text-xs text-slate-400 font-semibold uppercase">Estado en el Club</p>
                <span className="inline-block mt-1 px-2.5 py-0.5 rounded bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 text-xs font-bold">
                  {profile?.activo ? 'MIEMBRO ACTIVO' : 'INACTIVO'}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-6">
            <h3 className="font-bold text-base text-slate-100 mb-4 flex items-center gap-2">
              <Lock size={18} className="text-blue-400" /> Seguridad de la Cuenta
            </h3>
            {pwdSuccess && (
              <div className="mb-4 p-3 bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 rounded-xl text-xs font-semibold">
                {pwdSuccess}
              </div>
            )}
            <form onSubmit={handleChangePassword} className="space-y-4">
              <div>
                <label className="block text-xs text-slate-300 mb-1">Contraseña Actual</label>
                <input
                  type="password"
                  required
                  value={pwdData.currentPassword}
                  onChange={(e) => setPwdData({ ...pwdData, currentPassword: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-sm text-slate-100 outline-none"
                />
              </div>
              <div>
                <label className="block text-xs text-slate-300 mb-1">Nueva Contraseña</label>
                <input
                  type="password"
                  required
                  value={pwdData.newPassword}
                  onChange={(e) => setPwdData({ ...pwdData, newPassword: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-sm text-slate-100 outline-none"
                />
              </div>
              <div>
                <label className="block text-xs text-slate-300 mb-1">
                  Confirmar Nueva Contraseña
                </label>
                <input
                  type="password"
                  required
                  value={pwdData.confirmPassword}
                  onChange={(e) => setPwdData({ ...pwdData, confirmPassword: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-sm text-slate-100 outline-none"
                />
              </div>
              <button
                type="submit"
                className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2.5 rounded-xl font-semibold text-xs w-full transition-colors"
              >
                Actualizar Contraseña
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Modal Subir Comprobante */}
      {selectedMembership && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl max-w-md w-full p-6">
            <h2 className="text-lg font-bold text-slate-100 mb-2 flex items-center gap-2">
              <FileUp size={20} className="text-blue-400" /> Reportar Comprobante de Pago
            </h2>
            <p className="text-xs text-slate-400 mb-4">
              Plan asociado: <strong className="text-slate-200">{selectedMembership.plan}</strong>
            </p>

            <form onSubmit={handlePaymentSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase text-slate-300 mb-1">
                  Valor Pagado (COP)
                </label>
                <input
                  type="number"
                  required
                  min="1000"
                  value={monto}
                  onChange={(e) => setMonto(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-slate-100 outline-none"
                  placeholder="Ej: 120000"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-slate-300 mb-1">
                  Archivo de Soporte (PDF / Imagen)
                </label>
                <input
                  type="file"
                  required
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={(e) => setFile(e.target.files ? e.target.files[0] : null)}
                  className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-300 outline-none"
                />
              </div>

              <div className="flex justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedMembership(null)}
                  className="px-4 py-2 text-xs font-semibold text-slate-300 bg-slate-800 hover:bg-slate-700 rounded-xl"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={uploading}
                  className="px-4 py-2 text-xs font-semibold bg-blue-600 text-white rounded-xl hover:bg-blue-500 disabled:opacity-50"
                >
                  {uploading ? 'Subiendo archivo...' : 'Enviar Comprobante'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Inscribirse a Competencia */}
      {showCompModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl max-w-md w-full p-6">
            <h2 className="text-lg font-bold text-slate-100 mb-2 flex items-center gap-2">
              <Medal size={20} className="text-blue-400" /> Inscribirse a Competencia
            </h2>
            <p className="text-slate-400 text-xs mb-4">
              Selecciona una convocatoria activa para registrar tu participación oficial.
            </p>

            <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
              {availableCompetitions.length === 0 ? (
                <p className="text-center text-slate-400 py-4 text-xs">
                  No hay competencias disponibles en este momento.
                </p>
              ) : (
                availableCompetitions.map((comp) => {
                  const yaInscrito = activitiesData.competitions?.some(
                    (c: any) => c.competenciaId === comp.id
                  );
                  return (
                    <div
                      key={comp.id}
                      className="p-4 border border-slate-800 bg-slate-950 rounded-xl"
                    >
                      <h4 className="font-bold text-slate-100 text-sm">{comp.nombre}</h4>
                      <p className="text-xs text-slate-400 mb-3">
                        {new Date(comp.fechaInicio).toLocaleDateString('es-CO')} · {comp.ubicacion}
                      </p>
                      {yaInscrito ? (
                        <span className="text-[11px] font-bold text-emerald-400 bg-emerald-500/15 border border-emerald-500/30 px-2.5 py-1 rounded-full">
                          Inscripción activa
                        </span>
                      ) : (
                        <button
                          type="button"
                          onClick={async () => {
                            const success = await registerForCompetition(comp.id);
                            if (success) {
                              toast.success('Inscripción confirmada.');
                              setShowCompModal(false);
                            }
                          }}
                          className="text-xs px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-500 font-semibold w-full"
                        >
                          Confirmar Inscripción
                        </button>
                      )}
                    </div>
                  );
                })
              )}
            </div>

            <div className="flex justify-end mt-5">
              <button
                type="button"
                onClick={() => setShowCompModal(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-300 bg-slate-800 hover:bg-slate-700 rounded-xl"
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
