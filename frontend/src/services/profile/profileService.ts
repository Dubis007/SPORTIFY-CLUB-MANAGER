import { apiClient } from '../api/apiClient';

export const profileService = {
  getProfile: async () => {
    const response = await apiClient.get('/api/profile/me');
    return response.data;
  },
  
  changePassword: async (data: any) => {
    const response = await apiClient.post('/api/profile/change-password', data);
    return response.data;
  }
};
