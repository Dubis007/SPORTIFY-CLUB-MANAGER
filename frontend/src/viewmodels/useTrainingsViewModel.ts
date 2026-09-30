import { useState, useEffect } from 'react';
import { trainingService } from '../services/trainings/trainingService';
import { Training } from '../models';

export const useTrainingsViewModel = () => {
  const [trainings, setTrainings] = useState<Training[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchTrainings = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await trainingService.getAll();
      setTrainings(data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al obtener entrenamientos');
    } finally {
      setLoading(false);
    }
  };

  const createTraining = async (data: Partial<Training>) => {
    try {
      const newTraining = await trainingService.create(data);
      setTrainings(prev => [newTraining, ...prev]);
      return true;
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al crear entrenamiento');
      return false;
    }
  };

  const updateTraining = async (id: number, data: Partial<Training>) => {
    try {
      const updated = await trainingService.update(id, data);
      setTrainings(prev => prev.map(t => t.id === id ? updated : t));
      return true;
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al actualizar entrenamiento');
      return false;
    }
  };

  const deleteTraining = async (id: number) => {
    try {
      await trainingService.delete(id);
      setTrainings(prev => prev.filter(t => t.id !== id));
      return true;
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al eliminar entrenamiento');
      return false;
    }
  };

  const closeTraining = async (id: number) => {
    try {
      const updated = await trainingService.closeTraining(id);
      setTrainings(prev => prev.map(t => t.id === id ? updated : t));
      return true;
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al cerrar entrenamiento');
      return false;
    }
  };

  useEffect(() => {
    fetchTrainings();
  }, []);

  return {
    trainings,
    loading,
    error,
    createTraining,
    updateTraining,
    deleteTraining,
    closeTraining,
    refresh: fetchTrainings
  };
};
