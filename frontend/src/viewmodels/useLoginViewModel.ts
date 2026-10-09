import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { authService } from '../services/auth/authService';
import { UserRole, ROLE_HOME_ROUTES } from '../models';

export function useLoginViewModel() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (correo: string, contrasena: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await authService.login(correo, contrasena);
      login(response.token, response.usuario);
      
      navigate(ROLE_HOME_ROUTES[response.usuario.rol] ?? ROLE_HOME_ROUTES[UserRole.MIEMBRO]);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al iniciar sesión. Verifica tus credenciales.');
    } finally {
      setLoading(false);
    }
  };

  return { handleLogin, loading, error };
}
