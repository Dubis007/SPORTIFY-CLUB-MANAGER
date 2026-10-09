import { apiClient } from './apiClient';
import { DashboardStats } from '../../models';

export const dashboardService = {
  getStats: async (): Promise<DashboardStats> => {
    const response = await apiClient.get<DashboardStats>('/api/dashboard/stats');
    return response.data;
  },
};
