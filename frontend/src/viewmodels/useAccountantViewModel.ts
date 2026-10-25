import { useState, useEffect, useCallback } from 'react';
import { paymentService } from '../services/api/paymentService';
import { profileService } from '../services/profile/profileService';
import { apiClient } from '../services/api/apiClient';
import { Payment, PaymentSummary } from '../models';

const DEFAULT_PAGE_SIZE = 10;

export const useAccountantViewModel = () => {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [summary, setSummary] = useState<PaymentSummary>({ pendientes: 0, totalAprobadoCOP: 0 });
  const [options, setOptions] = useState<any>({ Members: [], Memberships: [] });
  const [profile, setProfile] = useState<any>(null);

  const [page, setPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(DEFAULT_PAGE_SIZE);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [totalPages, setTotalPages] = useState<number>(0);

  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPayments = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await paymentService.getAll(page, pageSize);
      setPayments(result.items);
      setTotalCount(result.totalCount);
      setTotalPages(result.totalPages);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al obtener pagos');
    } finally {
      setLoading(false);
    }
  }, [page, pageSize]);

  const fetchSummary = useCallback(async () => {
    try {
      setSummary(await paymentService.getSummary());
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al obtener el resumen de pagos');
    }
  }, []);

  const fetchInitialData = useCallback(async () => {
    try {
      const [profData, optData] = await Promise.all([
        profileService.getProfile(),
        apiClient.get('/api/payments/options').then(res => res.data)
      ]);
      setProfile(profData);
      setOptions(optData);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al obtener datos');
    }
  }, []);

  const approvePayment = async (id: number) => {
    try {
      const updated = await paymentService.approve(id);
      setPayments(prev => prev.map(p => p.id === id ? updated : p));
      fetchSummary();
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
      fetchSummary();
      return true;
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al rechazar pago');
      return false;
    }
  };

  const registerManualPayment = async (data: { usuarioId: number; membresiaId?: number; montoCOP: number }) => {
    try {
      await paymentService.registerManual(data);
      // El pago nuevo queda primero (orden por fecha desc): volver a la página 1
      if (page === 1) fetchPayments();
      else setPage(1);
      fetchSummary();
      return true;
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al registrar pago');
      return false;
    }
  };

  const changePageSize = (size: number) => {
    setPageSize(size);
    setPage(1);
  };

  const downloadReport = async () => {
    try {
      await paymentService.downloadPaymentsReport();
    } catch {
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
    fetchSummary();
  }, [fetchInitialData, fetchSummary]);

  useEffect(() => {
    fetchPayments();
  }, [fetchPayments]);

  return {
    payments,
    summary,
    profile,
    options,
    loading,
    error,
    page,
    pageSize,
    totalCount,
    totalPages,
    setPage,
    changePageSize,
    approvePayment,
    rejectPayment,
    registerManualPayment,
    downloadReport,
    changePassword,
    refresh: () => {
      fetchInitialData();
      fetchSummary();
      fetchPayments();
    }
  };
};
