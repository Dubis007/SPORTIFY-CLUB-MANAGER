import { useState, useEffect, useCallback } from 'react';
import { paymentService } from '../services/api/paymentService';
import { profileService } from '../services/profile/profileService';
import { apiClient } from '../services/api/apiClient';
import { Payment } from '../models';

export const useAccountantViewModel = () => {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [options, setOptions] = useState<any>({ Members: [], Memberships: [] });
  const [profile, setProfile] = useState<any>(null);
  
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchInitialData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [payData, profData, optData] = await Promise.all([
        paymentService.getAll(),
        profileService.getProfile(),
        apiClient.get('/api/payments/options').then(res => res.data)
      ]);
      setPayments(payData);
      setProfile(profData);
      setOptions(optData);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al obtener datos');
    } finally {
      setLoading(false);
    }
  }, []);

  const approvePayment = async (id: number) => {
    try {
      const updated = await paymentService.approve(id);
      setPayments(prev => prev.map(p => p.id === id ? updated : p));
      return true;
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al aprobar pago');
      return false;
    }
  };

  const rejectPayment = async (id: number, comentario: string) => {
    try {
      const updated = await paymentService.reject(id, { comentario });
      setPayments(prev => prev.map(p => p.id === id ? updated : p));
      return true;
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al rechazar pago');
      return false;
    }
  };

  const registerManualPayment = async (data: { usuarioId: number; membresiaId?: number; montoCOP: number }) => {
    try {
      await paymentService.registerManual(data);
      // Actualizar pagos para mostrar el nuevo
      const payData = await paymentService.getAll();
      setPayments(payData);
      return true;
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al registrar pago');
      return false;
    }
  };

  const downloadReport = async () => {
    try {
      await paymentService.downloadPaymentsReport();
    } catch (err: any) {
      setError('Error al generar el reporte PDF');
    }
  };

  const changePassword = async (data: any) => {
    try {
      await profileService.changePassword(data);
      return true;
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al cambiar contraseña.');
      return false;
    }
  };

  useEffect(() => {
    fetchInitialData();
  }, [fetchInitialData]);

  return {
    payments,
    profile,
    options,
    loading,
    error,
    approvePayment,
    rejectPayment,
    registerManualPayment,
    downloadReport,
    changePassword,
    refresh: fetchInitialData
  };
};
