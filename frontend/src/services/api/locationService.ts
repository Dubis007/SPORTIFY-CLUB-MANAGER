import { apiClient } from './apiClient';

export interface LocationDto {
  id: number;
  nombre: string;
  direccion: string;
  ciudad: string;
  telefono?: string;
  activo: boolean;
  usuariosActivos?: number;
  empleados?: number;
}

export const locationService = {
  getAll: async (): Promise<LocationDto[]> => {
    const response = await apiClient.get('/api/locations');
    return response.data;
  },

  create: async (data: any): Promise<LocationDto> => {
    const response = await apiClient.post('/api/locations', data);
    return response.data;
  },

  update: async (id: number, data: any): Promise<LocationDto> => {
    const response = await apiClient.put(`/api/locations/${id}`, data);
    return response.data;
  },

  delete: async (id: number): Promise<void> => {
    await apiClient.delete(`/api/locations/${id}`);
  },

  downloadReport: async (): Promise<void> => {
    const response = await apiClient.get('/api/reports/locations/pdf', {
      responseType: 'blob'
    });
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Reporte_Sedes_${new Date().toISOString().split('T')[0]}.pdf`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  }
};
