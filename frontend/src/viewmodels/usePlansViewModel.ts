import { useState, useEffect, useCallback } from 'react';
import { planService, PlanDto } from '../services/api/planService';

export const usePlansViewModel = () => {
  const [plans, setPlans] = useState<PlanDto[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPlans = useCallback(async () => {
    setLoading(true);
    try {
      const data = await planService.getAll();
      setPlans(data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al cargar planes');
    } finally {
      setLoading(false);
    }
  }, []);

  const createPlan = async (data: any) => {
    try {
      await planService.create(data);
      fetchPlans();
      return true;
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al crear plan');
      return false;
    }
  };

  const updatePlan = async (id: number, data: any) => {
    try {
      await planService.update(id, data);
      fetchPlans();
      return true;
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al actualizar plan');
      return false;
    }
  };

  const deletePlan = async (id: number) => {
    try {
      await planService.delete(id);
      fetchPlans();
      return true;
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al eliminar plan');
      return false;
    }
  };

  useEffect(() => {
    fetchPlans();
  }, [fetchPlans]);

  return {
    plans,
    loading,
    error,
    createPlan,
    updatePlan,
    deletePlan
  };
};
