import { apiClient } from './apiClient';
import { MembershipDto } from './membershipService';

export const memberService = {
  getMyMemberships: async (userId: number): Promise<MembershipDto[]> => {
    const response = await apiClient.get<MembershipDto[]>(`/api/memberships/user/${userId}`);
    return response.data;
  },

  uploadReceipt: async (pagoId: number, file: File): Promise<any> => {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await apiClient.post(`/api/receipts/upload`, formData, {
      params: { pagoId },
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  }
};
