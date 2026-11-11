import { apiClient } from '../api/apiClient';
import { LoginResponse } from '../../models';
import { clearStoredCsrfToken, setStoredCsrfToken } from '../../utils/csrfTokenManager';

export const authService = {
  login: async (correo: string, contrasena: string): Promise<LoginResponse> => {
    const response = await apiClient.post<LoginResponse>('/api/auth/login', { correo, contrasena });
    if (response.data?.csrfToken) {
      setStoredCsrfToken(response.data.csrfToken);
    }
    return response.data;
  },

  refreshCsrfToken: async (): Promise<string> => {
    const response = await apiClient.get<{ csrfToken: string }>('/api/auth/csrf-token');
    if (response.data?.csrfToken) {
      setStoredCsrfToken(response.data.csrfToken);
    }
    return response.data.csrfToken;
  },

  forgotPassword: async (correo: string): Promise<void> => {
    await apiClient.post('/api/auth/forgot-password', { correo });
  },

  resetPassword: async (correo: string, pin: string, nuevaContrasena: string): Promise<void> => {
    await apiClient.post('/api/auth/reset-password', { correo, pin, nuevaContrasena });
  },

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    clearStoredCsrfToken();
  },
};
