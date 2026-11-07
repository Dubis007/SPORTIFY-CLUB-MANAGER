import { apiClient } from '../api/apiClient';

export const profileService = {
  getProfile: async () => {
    const response = await apiClient.get('/api/profile/me');
    return response.data;
  },

  changePassword: async (data: { currentPassword: string; newPassword: string }) => {
    const response = await apiClient.post('/api/profile/change-password', data);
    return response.data;
  },

  updateBirthDate: async (fechaNacimiento: string | null) => {
    const response = await apiClient.patch('/api/profile/birth-date', { fechaNacimiento });
    return response.data;
  },
};
