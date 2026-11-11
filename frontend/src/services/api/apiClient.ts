import axios from 'axios';
import toast from 'react-hot-toast';
import { sanitizePayloadObject } from '../../utils/xssSanitizer';
import {
  getStoredCsrfToken,
  isStateChangingMethod,
  setStoredCsrfToken,
} from '../../utils/csrfTokenManager';

// En Docker/nube se define al compilar con VITE_API_URL; en desarrollo se usa .env.development o la API local
const rawApiUrl = (import.meta.env.VITE_API_URL ?? 'http://localhost:5000').replace(/\/+$/, '');
export const API_URL = rawApiUrl.endsWith('/api') ? rawApiUrl.slice(0, -4) : rawApiUrl;

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

  // En peticiones mutadoras (POST, PUT, PATCH, DELETE), enviar token anti-CSRF si existe
  if (isStateChangingMethod(config.method)) {
    const csrfToken = getStoredCsrfToken();
    if (csrfToken) {
      config.headers['X-CSRF-TOKEN'] = csrfToken;
    }
  }

  if (config.data && typeof config.data === 'object') {
    config.data = sanitizePayloadObject(config.data);
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => {
    // Una respuesta exitosa (p. ej. el login) habilita de nuevo la redirección por 401
    handlingUnauthorized = false;

    const headerCsrf =
      response.headers?.['x-csrf-token'] ??
      (response.data && typeof response.data === 'object' ? response.data.csrfToken : undefined);
    if (typeof headerCsrf === 'string' && headerCsrf.trim().length > 0) {
      setStoredCsrfToken(headerCsrf);
    }

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
