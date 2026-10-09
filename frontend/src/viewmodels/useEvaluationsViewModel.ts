import { useState, useEffect, useCallback } from 'react';
import { evaluationService } from '../services/evaluations/evaluationService';
import { Evaluation } from '../models';

const DEFAULT_PAGE_SIZE = 10;

export const useEvaluationsViewModel = () => {
  const [evaluations, setEvaluations] = useState<Evaluation[]>([]);
  const [options, setOptions] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const [page, setPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(DEFAULT_PAGE_SIZE);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [totalPages, setTotalPages] = useState<number>(0);

  const fetchEvaluations = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await evaluationService.getAll(page, pageSize);
      // Si la página quedó vacía (p. ej. tras eliminar el último registro), retroceder una
      if (result.items.length === 0 && page > 1) {
        setPage(page - 1);
        return;
      }
      setEvaluations(result.items);
      setTotalCount(result.totalCount);
      setTotalPages(result.totalPages);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al obtener observaciones');
    } finally {
      setLoading(false);
    }
  }, [page, pageSize]);

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
      fetchEvaluations();
      return true;
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al eliminar observación');
      return false;
    }
  };

  const changePageSize = (size: number) => {
    setPageSize(size);
    setPage(1);
  };

  useEffect(() => {
    fetchOptions();
  }, []);

  useEffect(() => {
    fetchEvaluations();
  }, [fetchEvaluations]);

  return {
    evaluations,
    options,
    loading,
    error,
    page,
    pageSize,
    totalCount,
    totalPages,
    setPage,
    changePageSize,
    createEvaluation,
    updateEvaluation,
    deleteEvaluation,
    refresh: fetchEvaluations
  };
};
