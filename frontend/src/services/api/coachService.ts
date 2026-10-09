import { apiClient } from './apiClient';
import { PagedResult } from '../../models';

export interface Training {
  id: number;
  sedeId: number;
  entrenadorId: number;
  titulo: string;
  descripcion: string;
  fechaHora: string;
  capacidadMaxima: number;
  creadoEn: string;
}

export interface Evaluation {
  id: number;
  inscripcionId: number;
  puntaje: number;
  posicion?: number;
  comentarios?: string;
  evaluadoEn: string;
  evaluadoPorId: number;
}

export const coachService = {
  getAllTrainings: async (): Promise<Training[]> => {
    const response = await apiClient.get<Training[]>('/api/trainings');
    return response.data;
  },

  getRecentEvaluations: async (evaluadoPorId: number, pageSize = 5): Promise<PagedResult<Evaluation>> => {
    const response = await apiClient.get<PagedResult<Evaluation>>('/api/evaluations', {
      params: { page: 1, pageSize, evaluadoPorId }
    });
    return response.data;
  },

  downloadPerformanceReport: async (): Promise<Blob> => {
    const response = await apiClient.get('/api/reports/performance/pdf', {
      responseType: 'blob'
    });
    return response.data;
  }
};
