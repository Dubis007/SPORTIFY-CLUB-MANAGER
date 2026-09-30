import { apiClient } from './apiClient';
import { User } from '../../models';

export interface CreateUserDto {
  nombre: string;
  apellido: string;
  correo: string;
  contrasena: string;
  rolId: number;
}

export interface UpdateUserDto {
  nombre: string;
  apellido: string;
  correo: string;
  rolId: number;
}

export const userService = {
  getAll: async (): Promise<User[]> => {
    const response = await apiClient.get<User[]>('/api/users');
    return response.data;
  },

  getById: async (id: number): Promise<User> => {
    const response = await apiClient.get<User>(`/api/users/${id}`);
    return response.data;
  },

  create: async (data: CreateUserDto): Promise<User> => {
    const response = await apiClient.post<User>('/api/users', data);
    return response.data;
  },

  update: async (id: number, data: UpdateUserDto): Promise<User> => {
    const response = await apiClient.put<User>(`/api/users/${id}`, data);
    return response.data;
  },

  setStatus: async (id: number, activo: boolean): Promise<void> => {
    await apiClient.patch(`/api/users/${id}/status`, activo, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }
};
