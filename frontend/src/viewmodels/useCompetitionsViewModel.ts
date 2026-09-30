import { useState, useEffect } from 'react';
import { competitionService } from '../services/competitions/competitionService';
import { Competition } from '../models';

export const useCompetitionsViewModel = () => {
  const [competitions, setCompetitions] = useState<Competition[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCompetitions = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await competitionService.getAll();
      setCompetitions(data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al obtener competencias');
    } finally {
      setLoading(false);
    }
  };

  const createCompetition = async (data: Partial<Competition>) => {
    try {
      const newCompetition = await competitionService.create(data);
      setCompetitions(prev => [...prev, newCompetition]);
      return true;
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al crear competencia');
      return false;
    }
  };

  const updateCompetition = async (id: number, data: Partial<Competition>) => {
    try {
      const updated = await competitionService.update(id, data);
      setCompetitions(prev => prev.map(c => c.id === id ? updated : c));
      return true;
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al actualizar competencia');
      return false;
    }
  };

  const deleteCompetition = async (id: number) => {
    try {
      await competitionService.delete(id);
      setCompetitions(prev => prev.filter(c => c.id !== id));
      return true;
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al eliminar competencia');
      return false;
    }
  };

  useEffect(() => {
    fetchCompetitions();
  }, []);

  return {
    competitions,
    loading,
    error,
    createCompetition,
    updateCompetition,
    deleteCompetition,
    refresh: fetchCompetitions
  };
};
