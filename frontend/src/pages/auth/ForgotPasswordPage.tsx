import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Mail, CheckCircle2, ArrowLeft, ShieldAlert } from 'lucide-react';
import { authService } from '../../services/auth/authService';

const forgotPasswordSchema = z.object({
  correo: z
    .string()
    .min(1, 'El correo electrónico es obligatorio')
    .email('Ingresa un correo electrónico institucional válido'),
});

type ForgotPasswordInputs = z.infer<typeof forgotPasswordSchema>;

export default function ForgotPasswordPage() {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordInputs>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const onSubmit = async (data: ForgotPasswordInputs) => {
    setError('');
    setLoading(true);

    try {
      await authService.forgotPassword(data.correo);
      setSuccess(true);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Hubo un error al procesar tu solicitud.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-slate-900/95 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden">
          <div className="p-8 border-b border-slate-800 bg-slate-950/50 text-center">
            <h1 className="text-xl font-bold text-slate-100">Recuperación de Credenciales</h1>
            <p className="mt-1 text-xs text-slate-400">
              Solicita autorización al administrador del club para restablecer tu clave
            </p>
          </div>

          <div className="p-8">
            {success ? (
              <div className="text-center space-y-4">
                <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400">
                  <CheckCircle2 size={24} />
                </div>
                <h3 className="text-base font-bold text-slate-100">Solicitud registrada en auditoría</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Hemos notificado al panel de administración de Sportify ERP que requieres restablecer tu clave de acceso.
                </p>
                <Link
                  to="/login"
                  className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-sm font-semibold text-white bg-blue-600 hover:bg-blue-500 transition-colors"
                >
                  <ArrowLeft size={16} /> Volver al Portal de Acceso
                </Link>
              </div>
            ) : (
              <form className="space-y-5" onSubmit={handleSubmit(onSubmit)} noValidate>
                <div>
                  <label htmlFor="correo" className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">
                    Correo electrónico registrado
                  </label>
                  <div
                    className={`flex items-center bg-slate-950 border ${
                      errors.correo ? 'border-rose-500/80' : 'border-slate-800'
                    } rounded-xl overflow-hidden focus-within:border-blue-500`}
                  >
                    <span className="pl-3.5 pr-2 text-slate-500">
                      <Mail size={16} />
                    </span>
                    <input
                      id="correo"
                      type="email"
                      autoComplete="email"
                      placeholder="usuario@sportify.com"
                      className="w-full px-2.5 py-2.5 bg-transparent text-sm text-slate-100 outline-none placeholder-slate-600"
                      {...register('correo')}
                    />
                  </div>
                  {errors.correo && (
                    <p className="text-xs text-rose-400 mt-1.5 font-medium">{errors.correo.message}</p>
                  )}
                </div>

                {error && (
                  <div className="text-rose-300 text-xs bg-rose-500/10 p-3 rounded-xl border border-rose-500/30 flex items-center gap-2">
                    <ShieldAlert size={16} className="shrink-0 text-rose-400" />
                    <span>{error}</span>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex justify-center py-2.5 px-4 rounded-xl text-sm font-semibold text-white bg-blue-600 hover:bg-blue-500 disabled:opacity-50 transition-colors"
                >
                  {loading ? 'Enviando solicitud...' : 'Solicitar restablecimiento'}
                </button>

                <div className="text-center pt-2">
                  <Link
                    to="/login"
                    className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-400 hover:text-slate-200"
                  >
                    <ArrowLeft size={14} /> Regresar al inicio de sesión
                  </Link>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
