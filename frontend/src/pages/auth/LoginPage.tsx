import React from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useLoginViewModel } from '../../viewmodels/useLoginViewModel';
import { loginSchema } from '../../validations/schemas';

type LoginFormInputs = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const { handleLogin, loading, error } = useLoginViewModel();
  
  const { register, handleSubmit, formState: { errors } } = useForm<LoginFormInputs>({
    resolver: zodResolver(loginSchema)
  });

  const onSubmit = (data: LoginFormInputs) => {
    handleLogin(data.correo, data.contrasena);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-sportify-light py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full bg-white rounded-[20px] shadow-[0_20px_50px_rgba(0,0,0,0.1)] overflow-hidden border-0">
        
        {/* Header de la tarjeta */}
        <div className="bg-white p-8 text-center border-b-4 border-sportify-secondary">
          <i className="bi bi-shield-lock-fill text-sportify-primary" style={{ fontSize: '3rem' }}></i>
          <h4 className="font-bold mt-2 text-sportify-dark text-2xl">SPORTIFY CLUB</h4>
          <p className="text-gray-500 text-sm mb-0">Gestión Inteligente Deportiva</p>
        </div>
        
        {/* Cuerpo de la tarjeta */}
        <div className="bg-white p-10">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 rounded-lg p-3 mb-6 text-center text-sm shadow-sm flex items-center justify-center">
              <i className="bi bi-exclamation-circle mr-2"></i> {error}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {/* Usuario */}
            <div>
              <label htmlFor="correo" className="block text-sm font-semibold text-gray-600 mb-1">
                Usuario (Correo)
              </label>
              <div className={`flex border ${errors.correo ? 'border-red-500' : 'border-gray-300'} rounded-lg overflow-hidden focus-within:border-sportify-primary focus-within:ring-1 focus-within:ring-sportify-primary transition-all`}>
                <span className="bg-gray-50 px-4 flex items-center justify-center text-gray-400 border-r border-gray-300">
                  <i className="bi bi-person"></i>
                </span>
                <input
                  id="correo"
                  type="email"
                  className="w-full px-4 py-3 outline-none text-gray-700 bg-white"
                  placeholder="ejemplo@sportify.com"
                  {...register('correo')}
                />
              </div>
              {errors.correo && <p className="text-red-500 text-xs mt-1">{errors.correo.message}</p>}
            </div>

            {/* Contraseña */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-1">
                <label htmlFor="contrasena" className="block text-sm font-semibold text-gray-600">
                  Contraseña
                </label>
                <div className="text-sm">
                  <Link to="/forgot-password" className="font-medium text-sportify-primary hover:text-red-700 transition-colors">
                    ¿Olvidaste tu contraseña?
                  </Link>
                </div>
              </div>
              <div className={`flex border ${errors.contrasena ? 'border-red-500' : 'border-gray-300'} rounded-lg overflow-hidden focus-within:border-sportify-primary focus-within:ring-1 focus-within:ring-sportify-primary transition-all`}>
                <span className="bg-gray-50 px-4 flex items-center justify-center text-gray-400 border-r border-gray-300">
                  <i className="bi bi-lock"></i>
                </span>
                <input
                  id="contrasena"
                  type="password"
                  className="w-full px-4 py-3 outline-none text-gray-700 bg-white"
                  placeholder="••••••••"
                  {...register('contrasena')}
                />
              </div>
              {errors.contrasena && <p className="text-red-500 text-xs mt-1">{errors.contrasena.message}</p>}
            </div>

            {/* Botón */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-sportify-primary hover:bg-red-700 text-white font-semibold py-3 rounded-lg transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_5px_15px_rgba(220,38,38,0.4)]"
            >
              {loading ? 'Ingresando...' : 'Ingresar al Sistema'}
            </button>

          </form>
        </div>

      </div>
    </div>
  );
}
