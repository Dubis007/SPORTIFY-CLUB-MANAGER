import { apiClient } from '../api/apiClient';

export interface MemberMembership {
  id: number;
  plan: string;
  estado: string;
  fechaInicio: string;
  fechaFin: string;
}

export interface MemberPayment {
  id: number;
  montoCOP: number;
  estado: string;
  fechaPago: string;
  plan: string;
  /** Indica si el pago tiene un comprobante que el deportista puede volver a consultar. */
  tieneComprobante: boolean;
}

/** La API serializa en camelCase: `GET /api/members/me/payments` devuelve `{ memberships, payments }`. */
export interface MemberPaymentsData {
  memberships: MemberMembership[];
  payments: MemberPayment[];
}

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

  getPayments: async (): Promise<MemberPaymentsData> => {
    const response = await apiClient.get<Partial<MemberPaymentsData>>('/api/members/me/payments');
    return {
      memberships: response.data?.memberships ?? [],
      payments: response.data?.payments ?? [],
    };
  },

  getActivities: async () => {
    const response = await apiClient.get('/api/members/me/activities');
    return response.data;
  },

  /** Baja voluntaria de una membresía propia: el backend toma el titular del JWT y la deja SUSPENDIDA. */
  cancelMembership: async (membresiaId: number) => {
    const response = await apiClient.post(`/api/members/me/memberships/${membresiaId}/cancel`);
    return response.data;
  },

  /** Acepta una convocatoria propia a un torneo: la inscripción pasa a CONFIRMADA (exige membresía activa). */
  acceptInvitation: async (inscripcionId: number) => {
    const response = await apiClient.post(`/api/members/me/registrations/${inscripcionId}/accept`);
    return response.data;
  },

  /** Rechaza una convocatoria propia a un torneo: la inscripción pasa a CANCELADA. */
  declineInvitation: async (inscripcionId: number) => {
    const response = await apiClient.post(`/api/members/me/registrations/${inscripcionId}/decline`);
    return response.data;
  },
};
