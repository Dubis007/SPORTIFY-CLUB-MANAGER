import { apiClient } from '../api/apiClient';
import { Evaluation, PagedResult } from '../../models';

export const evaluationService = {
  getAll: async (page: number, pageSize: number): Promise<PagedResult<Evaluation>> => {
    const response = await apiClient.get<PagedResult<Evaluation>>('/api/evaluations', { params: { page, pageSize } });
    return response.data;
  },

  getOptions: async (): Promise<any[]> => {
    const response = await apiClient.get('/api/evaluations/options');
    return response.data;
  },
  
  create: async (data: Partial<Evaluation>): Promise<Evaluation> => {
    const response = await apiClient.post('/api/evaluations', data);
    return response.data;
  },

  update: async (id: number, data: Partial<Evaluation>): Promise<Evaluation> => {
    const response = await apiClient.put(`/api/evaluations/${id}`, data);
    return response.data;
  },

  delete: async (id: number): Promise<void> => {
    await apiClient.delete(`/api/evaluations/${id}`);
  }
};
