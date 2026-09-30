import { apiClient } from './apiClient';

export interface PlanMembresiaDto {
  id: number;
  nombre: string;
  descripcion: string;
  precioCOP: number;
  duracionDias: number;
  activo: boolean;
}

export interface MembershipDto {
  id: number;
  usuarioId: number;
  usuarioNombre: string;
  planMembresiaId: number;
  planNombre: string;
  fechaInicio: string;
  fechaFin: string;
  estado: string;
  creadoEn: string;
}

export interface CreateMembershipDto {
  usuarioId: number;
  planMembresiaId: number;
  fechaInicio: string;
}

export const membershipService = {
  getPlans: async (): Promise<PlanMembresiaDto[]> => {
    const response = await apiClient.get<PlanMembresiaDto[]>('/api/memberships/plans');
    return response.data;
  },

  getAllMemberships: async (): Promise<MembershipDto[]> => {
    const response = await apiClient.get<MembershipDto[]>('/api/memberships');
    return response.data;
  },

  getMembershipsByUser: async (userId: number): Promise<MembershipDto[]> => {
    const response = await apiClient.get<MembershipDto[]>(`/api/memberships/user/${userId}`);
    return response.data;
  },

  createMembership: async (data: CreateMembershipDto): Promise<MembershipDto> => {
    const response = await apiClient.post<MembershipDto>('/api/memberships', data);
    return response.data;
  },

  updateMembershipStatus: async (id: number, estado: string): Promise<MembershipDto> => {
    const response = await apiClient.patch<MembershipDto>(`/api/memberships/${id}/status`, { estado });
    return response.data;
  }
};
