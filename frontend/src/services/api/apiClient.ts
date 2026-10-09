import axios from 'axios';
import toast from 'react-hot-toast';

const API_URL = 'http://localhost:5000';

export const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// AuthContext registra aquí cómo cerrar sesión y navegar a /login sin recargar la página
let onUnauthorized: (() => void) | null = null;
let handlingUnauthorized = false;

export const setUnauthorizedHandler = (handler: (() => void) | null) => {
  onUnauthorized = handler;
  handlingUnauthorized = false;
};

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => {
    // Una respuesta exitosa (p. ej. el login) habilita de nuevo la redirección por 401
    handlingUnauthorized = false;
    return response;
  },
  (error) => {
    const status: number | undefined = error.response?.status;
    const url: string = error.config?.url ?? '';

    // En /api/auth/* el 401 significa credenciales inválidas: lo muestra la propia pantalla
    if (status === 401 && !url.startsWith('/api/auth/')) {
      // Varias peticiones pueden fallar a la vez con el token vencido: redirigir una sola vez
      if (!handlingUnauthorized) {
        handlingUnauthorized = true;
        if (onUnauthorized) {
          onUnauthorized();
        } else {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          window.location.href = '/login';
        }
      }
    } else if (status !== undefined && status >= 500) {
      // id fijo: errores repetidos (p. ej. el refresco del dashboard) no apilan toasts
      toast.error(error.response?.data?.message || 'Error del servidor. Intenta de nuevo más tarde.', {
        id: 'server-error',
      });
    }

    return Promise.reject(error);
  }
);
