import { apiClient } from '../api/apiClient';
import { Registration } from '../../models';

export const registrationService = {
  getAll: async (): Promise<Registration[]> => {
    const response = await apiClient.get('/api/registrations');
    return response.data;
  },
  
  getOptions: async (): Promise<{competitions: any[], members: any[]}> => {
    const response = await apiClient.get('/api/registrations/options');
    return response.data;
  },
  
  create: async (data: Partial<Registration>): Promise<Registration> => {
    const response = await apiClient.post('/api/registrations', data);
    return response.data;
  },

  update: async (id: number, data: Partial<Registration>): Promise<Registration> => {
    const response = await apiClient.put(`/api/registrations/${id}`, data);
    return response.data;
  },

  delete: async (id: number): Promise<void> => {
    await apiClient.delete(`/api/registrations/${id}`);
  }
};
