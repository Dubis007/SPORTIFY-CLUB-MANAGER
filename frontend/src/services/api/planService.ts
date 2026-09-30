import { apiClient } from './apiClient';

export interface PlanDto {
  id: number;
  nombre: string;
  descripcion: string;
  precioCOP: number;
  duracionDias: number;
  activo: boolean;
}

export const planService = {
  getAll: async (): Promise<PlanDto[]> => {
    const response = await apiClient.get('/api/plans');
    return response.data;
  },

  create: async (data: any): Promise<PlanDto> => {
    const response = await apiClient.post('/api/plans', data);
    return response.data;
  },

  update: async (id: number, data: any): Promise<PlanDto> => {
    const response = await apiClient.put(`/api/plans/${id}`, data);
    return response.data;
  },

  delete: async (id: number): Promise<void> => {
    await apiClient.delete(`/api/plans/${id}`);
  }
};
