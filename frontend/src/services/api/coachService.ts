import { apiClient } from './apiClient';

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

  getAllEvaluations: async (): Promise<Evaluation[]> => {
    const response = await apiClient.get<Evaluation[]>('/api/evaluations');
    return response.data;
  },

  downloadPerformanceReport: async (): Promise<Blob> => {
    const response = await apiClient.get('/api/reports/performance/pdf', {
      responseType: 'blob'
    });
    return response.data;
  }
};
