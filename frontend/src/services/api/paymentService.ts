import { apiClient } from './apiClient';
import { Payment, PagedResult, PaymentSummary } from '../../models';

export interface RejectPaymentDto {
  comentario: string;
}

export const paymentService = {
  getAll: async (page: number, pageSize: number): Promise<PagedResult<Payment>> => {
    const response = await apiClient.get<PagedResult<Payment>>('/api/payments', { params: { page, pageSize } });
    return response.data;
  },

  getSummary: async (): Promise<PaymentSummary> => {
    const response = await apiClient.get<PaymentSummary>('/api/payments/summary');
    return response.data;
  },

  approve: async (id: number): Promise<Payment> => {
    const response = await apiClient.patch<Payment>(`/api/payments/${id}/approve`);
    return response.data;
  },

  registerManual: async (data: { usuarioId: number; membresiaId?: number; montoCOP: number }): Promise<Payment> => {
    const response = await apiClient.post<Payment>('/api/payments/manual', data);
    return response.data;
  },

  create: async (data: { membresiaId?: number; montoCOP: number }): Promise<Payment> => {
    const response = await apiClient.post<Payment>('/api/payments', data);
    return response.data;
  },

  reject: async (id: number, data: RejectPaymentDto): Promise<Payment> => {
    const response = await apiClient.patch<Payment>(`/api/payments/${id}/reject`, data);
    return response.data;
  },

  downloadPaymentsReport: async (): Promise<void> => {
    const response = await apiClient.get('/api/reports/payments/pdf', {
      responseType: 'blob'
    });
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Reporte_Pagos_${new Date().toISOString().split('T')[0]}.pdf`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  }
};
