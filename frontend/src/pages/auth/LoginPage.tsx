import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ShieldCheck, Mail, Lock, AlertCircle, ArrowRight } from 'lucide-react';
import { useLoginViewModel } from '../../viewmodels/useLoginViewModel';
import { loginSchema } from '../../validations/schemas';

type LoginFormInputs = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const { handleLogin, loading, error } = useLoginViewModel();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormInputs>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = (data: LoginFormInputs) => {
    handleLogin(data.correo, data.contrasena);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Iluminación ambiental sobria */}
      <div className="pointer-events-none absolute -top-40 left-1/2 -translate-x-1/2 w-[680px] h-[340px] bg-blue-600/10 blur-[130px] rounded-full" />

      <div className="max-w-md w-full bg-slate-900/95 rounded-2xl shadow-2xl border border-slate-800/90 overflow-hidden relative z-10">
        {/* Header Corporativo */}
        <div className="px-8 pt-8 pb-6 text-center border-b border-slate-800/80 bg-slate-950/50">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-blue-600/15 border border-blue-500/30 flex items-center justify-center text-blue-400 mb-4 shadow-inner">
            <ShieldCheck size={30} />
          </div>
          <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-slate-900 border border-slate-800 text-[11px] font-semibold uppercase tracking-widest text-blue-400 mb-2">
            Enterprise Sports ERP
          </div>
          <h1 className="font-bold text-slate-100 text-2xl tracking-tight">SPORTIFY CLUB MANAGER</h1>
          <p className="text-slate-400 text-xs mt-1">
            Plataforma Integral de Gestión Deportiva, Financiera y Control de Sesiones
          </p>
        </div>

        {/* Formulario */}
        <div className="p-8">
          {error && (
            <div
              role="alert"
              className="bg-rose-500/10 border border-rose-500/30 text-rose-300 rounded-xl p-3.5 mb-6 text-xs font-medium flex items-center gap-2.5"
            >
              <AlertCircle size={16} className="shrink-0 text-rose-400" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
            <div>
              <label htmlFor="correo" className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">
                Correo Institucional
              </label>
              <div
                className={`flex items-center bg-slate-950 border ${
                  errors.correo ? 'border-rose-500/80' : 'border-slate-800'
                } rounded-xl overflow-hidden focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-500/20 transition-all`}
              >
                <span className="pl-3.5 pr-2 text-slate-500">
                  <Mail size={17} />
                </span>
                <input
                  id="correo"
                  type="email"
                  autoComplete="email"
                  className="w-full px-2.5 py-3 outline-none text-sm text-slate-100 bg-transparent placeholder-slate-600"
                  placeholder="usuario@sportify.com"
                  {...register('correo')}
                />
              </div>
              {errors.correo && (
                <p className="text-rose-400 text-xs mt-1.5 font-medium">{errors.correo.message}</p>
              )}
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label htmlFor="contrasena" className="block text-xs font-semibold uppercase tracking-wider text-slate-300">
                  Contraseña
                </label>
                <Link
                  to="/forgot-password"
                  className="text-xs font-medium text-blue-400 hover:text-blue-300 transition-colors"
                >
                  ¿Olvidaste tu contraseña?
                </Link>
              </div>
              <div
                className={`flex items-center bg-slate-950 border ${
                  errors.contrasena ? 'border-rose-500/80' : 'border-slate-800'
                } rounded-xl overflow-hidden focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-500/20 transition-all`}
              >
                <span className="pl-3.5 pr-2 text-slate-500">
                  <Lock size={17} />
                </span>
                <input
                  id="contrasena"
                  type="password"
                  autoComplete="current-password"
                  className="w-full px-2.5 py-3 outline-none text-sm text-slate-100 bg-transparent placeholder-slate-600"
                  placeholder="••••••••"
                  {...register('contrasena')}
                />
              </div>
              {errors.contrasena && (
                <p className="text-rose-400 text-xs mt-1.5 font-medium">{errors.contrasena.message}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-semibold py-3 px-4 rounded-xl transition-all shadow-lg shadow-blue-950/50 flex items-center justify-center gap-2 text-sm"
            >
              <span>{loading ? 'Verificando credenciales...' : 'Iniciar Sesión en ERP'}</span>
              {!loading && <ArrowRight size={16} />}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
