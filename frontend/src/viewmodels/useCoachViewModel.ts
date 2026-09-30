import { useState, useEffect, useCallback } from 'react';
import { coachService, Training, Evaluation } from '../services/api/coachService';
import { useAuth } from '../context/AuthContext';

export const useCoachViewModel = () => {
  const { user } = useAuth();
  const [trainings, setTrainings] = useState<Training[]>([]);
  const [evaluations, setEvaluations] = useState<Evaluation[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboardData = useCallback(async () => {
    if (!user) return;
    
    setLoading(true);
    setError(null);
    try {
      const [allTrainings, allEvaluations] = await Promise.all([
        coachService.getAllTrainings(),
        coachService.getAllEvaluations()
      ]);

      // Filter by the logged-in coach
      const myTrainings = allTrainings.filter(t => t.entrenadorId === user.id);
      const myEvaluations = allEvaluations.filter(e => e.evaluadoPorId === user.id);

      setTrainings(myTrainings);
      setEvaluations(myEvaluations);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al cargar los datos del entrenador');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const downloadReport = async () => {
    try {
      const response = await coachService.downloadPerformanceReport();
      const url = window.URL.createObjectURL(new Blob([response]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Reporte_Desempeño_${new Date().toISOString().split('T')[0]}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err: any) {
      setError('Error al descargar el reporte');
    }
  };

  return {
    trainings,
    evaluations,
    loading,
    error,
    refresh: fetchDashboardData,
    downloadReport
  };
};
