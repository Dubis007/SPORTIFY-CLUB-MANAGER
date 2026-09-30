import { useState, useEffect, useCallback } from 'react';
import { membershipService, MembershipDto, PlanMembresiaDto, CreateMembershipDto } from '../services/api/membershipService';

export const useMembershipsViewModel = () => {
  const [memberships, setMemberships] = useState<MembershipDto[]>([]);
  const [plans, setPlans] = useState<PlanMembresiaDto[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchMemberships = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await membershipService.getAllMemberships();
      setMemberships(data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al obtener membresías');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchPlans = useCallback(async () => {
    try {
      const data = await membershipService.getPlans();
      setPlans(data);
    } catch (err: any) {
      console.error('Error fetching plans:', err);
    }
  }, []);

  const createMembership = async (data: CreateMembershipDto) => {
    try {
      const newMembership = await membershipService.createMembership(data);
      setMemberships(prev => [newMembership, ...prev]);
      return true;
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al crear membresía');
      return false;
    }
  };

  const updateStatus = async (id: number, estado: string) => {
    try {
      const updated = await membershipService.updateMembershipStatus(id, estado);
      setMemberships(prev => prev.map(m => m.id === id ? updated : m));
      return true;
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al actualizar estado de la membresía');
      return false;
    }
  };

  useEffect(() => {
    fetchMemberships();
    fetchPlans();
  }, [fetchMemberships, fetchPlans]);

  return {
    memberships,
    plans,
    loading,
    error,
    fetchMemberships,
    createMembership,
    updateStatus
  };
};
