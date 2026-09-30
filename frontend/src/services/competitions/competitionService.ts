import { apiClient } from '../api/apiClient';
import { Competition } from '../../models';

export const competitionService = {
  getAll: async (): Promise<Competition[]> => {
    const response = await apiClient.get('/api/competitions');
    return response.data;
  },
  
  create: async (data: Partial<Competition>): Promise<Competition> => {
    const response = await apiClient.post('/api/competitions', data);
    return response.data;
  },

  update: async (id: number, data: Partial<Competition>): Promise<Competition> => {
    const response = await apiClient.put(`/api/competitions/${id}`, data);
    return response.data;
  },

  delete: async (id: number): Promise<void> => {
    await apiClient.delete(`/api/competitions/${id}`);
  }
};
