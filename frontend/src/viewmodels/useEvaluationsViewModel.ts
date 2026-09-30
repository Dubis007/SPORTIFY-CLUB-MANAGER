import { useState, useEffect } from 'react';
import { evaluationService } from '../services/evaluations/evaluationService';
import { Evaluation } from '../models';

export const useEvaluationsViewModel = () => {
  const [evaluations, setEvaluations] = useState<Evaluation[]>([]);
  const [options, setOptions] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchEvaluations = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await evaluationService.getAll();
      setEvaluations(data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al obtener observaciones');
    } finally {
      setLoading(false);
    }
  };

  const fetchOptions = async () => {
    try {
      const data = await evaluationService.getOptions();
      setOptions(data);
    } catch (err: any) {
      console.error(err);
    }
  };

  const createEvaluation = async (data: Partial<Evaluation>) => {
    try {
      await evaluationService.create(data);
      fetchEvaluations(); // Refresh fully to get joined data
      return true;
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al registrar observación');
      return false;
    }
  };

  const updateEvaluation = async (id: number, data: Partial<Evaluation>) => {
    try {
      await evaluationService.update(id, data);
      fetchEvaluations();
      return true;
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al actualizar observación');
      return false;
    }
  };

  const deleteEvaluation = async (id: number) => {
    try {
      await evaluationService.delete(id);
      setEvaluations(prev => prev.filter(e => e.id !== id));
      return true;
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al eliminar observación');
      return false;
    }
  };

  useEffect(() => {
    fetchEvaluations();
    fetchOptions();
  }, []);

  return {
    evaluations,
    options,
    loading,
    error,
    createEvaluation,
    updateEvaluation,
    deleteEvaluation,
    refresh: fetchEvaluations
  };
};
