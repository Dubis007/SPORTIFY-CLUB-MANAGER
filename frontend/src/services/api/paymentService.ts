import { apiClient } from './apiClient';
import { Payment, PagedResult, PaymentSummary } from '../../models';
import { validateUploadFile } from '../../utils/fileValidation';
import { buildReceiptFileName, ReceiptMimeType, resolveReceiptMimeType } from '../../utils/receiptFile';

/** Comprobante descargado con sesión y listo para mostrarse o guardarse. */
export interface ReceiptFile {
  /** URL de objeto (`blob:`) propia de esta pestaña. Quien la pide la libera con `URL.revokeObjectURL`. */
  url: string;
  mimeType: ReceiptMimeType;
  fileName: string;
}

/** Coincide con `RejectPaymentDto.ComentarioRechazo` del backend (RN-05, mínimo 10 caracteres). */
export interface RejectPaymentDto {
  comentarioRechazo: string;
}

export interface PaymentMemberOption {
  id: number;
  nombre: string;
  apellido: string;
}

export interface PaymentMembershipOption {
  id: number;
  usuarioId: number;
  plan: string;
  estado: string;
}

/** La API serializa en camelCase: `GET /api/payments/options` devuelve `{ members, memberships }`. */
export interface PaymentOptionsDto {
  members: PaymentMemberOption[];
  memberships: PaymentMembershipOption[];
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

  getOptions: async (): Promise<PaymentOptionsDto> => {
    const response = await apiClient.get<Partial<PaymentOptionsDto>>('/api/payments/options');
    return {
      members: response.data?.members ?? [],
      memberships: response.data?.memberships ?? [],
    };
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

  uploadReceipt: async (pagoId: number, file: File): Promise<void> => {
    const check = validateUploadFile(file);
    if (!check.valid) {
      throw new Error(check.error);
    }
    const formData = new FormData();
    formData.append('pagoId', pagoId.toString());
    formData.append('archivo', file);
    await apiClient.post('/api/receipts', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },

  reject: async (id: number, data: RejectPaymentDto): Promise<Payment> => {
    const response = await apiClient.patch<Payment>(`/api/payments/${id}/reject`, data);
    return response.data;
  },

  /**
   * Descarga el comprobante de un pago con el token de sesión. El backend lo entrega al contador, al
   * administrador y al deportista dueño del pago; el archivo no tiene una URL pública.
   */
  getReceiptFile: async (pagoId: number): Promise<ReceiptFile> => {
    const response = await apiClient.get<Blob>(`/api/receipts/${pagoId}/preview`, {
      responseType: 'blob'
    });
    const mimeType = resolveReceiptMimeType(
      String(response.headers?.['content-type'] ?? response.data?.type ?? '')
    );
    // El tipo del blob sale de una lista cerrada (ver resolveReceiptMimeType), nunca del contenido
    const blob = new Blob([response.data], { type: mimeType });
    return {
      url: window.URL.createObjectURL(blob),
      mimeType,
      fileName: buildReceiptFileName(pagoId, mimeType),
    };
  },

  downloadReceiptAttachment: async (pagoId: number): Promise<void> => {
    const file = await paymentService.getReceiptFile(pagoId);
    const link = document.createElement('a');
    link.href = file.url;
    link.setAttribute('download', file.fileName);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(file.url);
  },

  getPaymentVoucherBlobUrl: async (pagoId: number): Promise<string> => {
    const response = await apiClient.get(`/api/reports/payments/${pagoId}/voucher-pdf`, {
      responseType: 'blob'
    });
    return window.URL.createObjectURL(
      new Blob([response.data], { type: 'application/pdf' })
    );
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
