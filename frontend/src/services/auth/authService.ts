import { apiClient } from '../api/apiClient';
import { LoginResponse } from '../../models';

export const authService = {
  login: async (correo: string, contrasena: string): Promise<LoginResponse> => {
    const response = await apiClient.post<LoginResponse>('/api/auth/login', { correo, contrasena });
    return response.data;
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
  }
};
