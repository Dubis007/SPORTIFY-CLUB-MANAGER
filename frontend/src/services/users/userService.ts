import { apiClient } from '../api/apiClient';
import { User } from '../../models';

export interface CreateUserDto {
  nombre: string;
  apellido: string;
  correo: string;
  contrasena: string;
  rolNombre: string;
}

export interface UpdateUserDto {
  nombre: string;
  apellido: string;
  correo: string;
  rolNombre: string;
}

export const userService = {
  getAllUsers: async (): Promise<User[]> => {
    const response = await apiClient.get<User[]>('/api/users');
    return response.data;
  },
  
  createUser: async (data: CreateUserDto): Promise<User> => {
    const response = await apiClient.post<User>('/api/users', data);
    return response.data;
  },

  updateUser: async (id: number, data: UpdateUserDto): Promise<User> => {
    const response = await apiClient.put<User>(`/api/users/${id}`, data);
    return response.data;
  },

  updateUserStatus: async (id: number, activo: boolean): Promise<void> => {
    await apiClient.patch(`/api/users/${id}/status`, activo, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
  },

  resetPassword: async (id: number): Promise<void> => {
    await apiClient.post(`/api/users/${id}/reset-password`);
  },

  deleteUser: async (id: number): Promise<void> => {
    await apiClient.delete(`/api/users/${id}`);
  }
};
