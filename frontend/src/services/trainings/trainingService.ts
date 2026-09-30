import { apiClient } from '../api/apiClient';
import { Training, AttendanceMember } from '../../models';

export const trainingService = {
  getAll: async (): Promise<Training[]> => {
    const response = await apiClient.get('/api/trainings');
    return response.data;
  },
  
  create: async (data: Partial<Training>): Promise<Training> => {
    const response = await apiClient.post('/api/trainings', data);
    return response.data;
  },

  update: async (id: number, data: Partial<Training>): Promise<Training> => {
    const response = await apiClient.put(`/api/trainings/${id}`, data);
    return response.data;
  },

  delete: async (id: number): Promise<void> => {
    await apiClient.delete(`/api/trainings/${id}`);
  },

  closeTraining: async (id: number): Promise<Training> => {
    const response = await apiClient.patch(`/api/trainings/${id}/close`);
    return response.data;
  },

  getAttendance: async (id: number): Promise<AttendanceMember[]> => {
    const response = await apiClient.get(`/api/trainings/${id}/attendance`);
    return response.data;
  },

  markAttendance: async (id: number, usuarioId: number, observaciones?: string): Promise<void> => {
    await apiClient.post(`/api/trainings/${id}/attendance`, { usuarioId, observaciones });
  }
};
