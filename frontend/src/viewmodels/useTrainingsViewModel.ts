import { useState, useEffect } from 'react';
import { trainingService } from '../services/trainings/trainingService';
import { Training, TrainingFormOptions } from '../models';

const EMPTY_FORM_OPTIONS: TrainingFormOptions = { sedes: [], entrenadores: [] };

export const useTrainingsViewModel = () => {
  const [trainings, setTrainings] = useState<Training[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Sedes y entrenadores que se pueden elegir en el formulario de sesiones
  const [formOptions, setFormOptions] = useState<TrainingFormOptions>(EMPTY_FORM_OPTIONS);
  const [formOptionsLoaded, setFormOptionsLoaded] = useState<boolean>(false);
  const [formOptionsError, setFormOptionsError] = useState<string | null>(null);

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

  // Se cargan aparte del listado: si fallan, las sesiones se siguen viendo y el formulario ofrece reintentar
  const fetchFormOptions = async () => {
    setFormOptionsError(null);
    try {
      const options = await trainingService.getFormOptions();
      setFormOptions({
        sedes: options?.sedes ?? [],
        entrenadores: options?.entrenadores ?? [],
      });
      setFormOptionsLoaded(true);
    } catch (err: unknown) {
      const apiMessage = (err as { response?: { data?: { message?: string } } })?.response?.data
        ?.message;
      setFormOptionsError(apiMessage || 'No fue posible cargar las sedes y los entrenadores.');
    }
  };

  const createTraining = async (data: Partial<Training>) => {
    setError(null);
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
    setError(null);
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
    fetchFormOptions();
  }, []);

  return {
    trainings,
    loading,
    error,
    formOptions,
    formOptionsLoaded,
    formOptionsError,
    reloadFormOptions: fetchFormOptions,
    createTraining,
    updateTraining,
    deleteTraining,
    closeTraining,
    refresh: fetchTrainings
  };
};
