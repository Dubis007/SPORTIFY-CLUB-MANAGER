import { apiClient } from '../api/apiClient';

export const memberService = {
  getProfile: async () => {
    const response = await apiClient.get('/api/members/me');
    return response.data;
  },

  updateBirthDate: async (fechaNacimiento: string | null) => {
    const response = await apiClient.patch('/api/profile/birth-date', { fechaNacimiento });
    return response.data;
  },

  changePassword: async (data: any) => {
    const response = await apiClient.post('/api/members/me/change-password', data);
    return response.data;
  },

  getPayments: async () => {
    const response = await apiClient.get('/api/members/me/payments');
    return response.data;
  },

  getActivities: async () => {
    const response = await apiClient.get('/api/members/me/activities');
    return response.data;
  },
};
