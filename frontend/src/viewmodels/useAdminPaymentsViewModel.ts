import { useState, useEffect, useCallback, useMemo } from 'react';
import { paymentService, PaymentOptionsDto } from '../services/api/paymentService';
import { Payment, PaymentSummary } from '../models';

const DEFAULT_PAGE_SIZE = 10;

export type PaymentStatusFilter = 'TODOS' | 'PENDIENTE' | 'APROBADO' | 'RECHAZADO';

export const useAdminPaymentsViewModel = () => {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [summary, setSummary] = useState<PaymentSummary>({ pendientes: 0, totalAprobadoCOP: 0 });
  const [options, setOptions] = useState<PaymentOptionsDto>({ Members: [], Memberships: [] });

  const [statusFilter, setStatusFilter] = useState<PaymentStatusFilter>('TODOS');
  const [searchTerm, setSearchTerm] = useState<string>('');

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

  const fetchOptions = useCallback(async () => {
    try {
      const optData = await paymentService.getOptions();
      setOptions(optData);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al obtener opciones de pago');
    }
  }, []);

  const filteredPayments = useMemo(() => {
    return payments.filter((p) => {
      const matchesStatus = statusFilter === 'TODOS' || p.estado === statusFilter;
      const normalizedSearch = searchTerm.trim().toLowerCase();
      const matchesSearch =
        normalizedSearch.length === 0 ||
        p.nombreUsuario.toLowerCase().includes(normalizedSearch) ||
        String(p.id).includes(normalizedSearch);
      return matchesStatus && matchesSearch;
    });
  }, [payments, statusFilter, searchTerm]);

  const approvePayment = async (id: number): Promise<boolean> => {
    try {
      const updated = await paymentService.approve(id);
      setPayments((prev) => prev.map((p) => (p.id === id ? updated : p)));
      await fetchSummary();
      return true;
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al aprobar pago');
      return false;
    }
  };

  const rejectPayment = async (id: number, comentario: string): Promise<boolean> => {
    try {
      const updated = await paymentService.reject(id, { comentario });
      setPayments((prev) => prev.map((p) => (p.id === id ? updated : p)));
      await fetchSummary();
      return true;
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al rechazar pago');
      return false;
    }
  };

  const registerManualPayment = async (data: {
    usuarioId: number;
    membresiaId?: number;
    montoCOP: number;
  }): Promise<boolean> => {
    try {
      await paymentService.registerManual(data);
      if (page === 1) await fetchPayments();
      else setPage(1);
      await fetchSummary();
      return true;
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al registrar pago');
      return false;
    }
  };

  const downloadAttachment = async (pagoId: number): Promise<boolean> => {
    try {
      await paymentService.downloadReceiptAttachment(pagoId);
      return true;
    } catch {
      return false;
    }
  };

  const downloadReport = async (): Promise<boolean> => {
    try {
      await paymentService.downloadPaymentsReport();
      return true;
    } catch {
      setError('Error al generar el reporte PDF');
      return false;
    }
  };

  const changePageSize = (size: number) => {
    setPageSize(size);
    setPage(1);
  };

  useEffect(() => {
    fetchOptions();
    fetchSummary();
  }, [fetchOptions, fetchSummary]);

  useEffect(() => {
    fetchPayments();
  }, [fetchPayments]);

  return {
    payments,
    filteredPayments,
    summary,
    options,
    statusFilter,
    setStatusFilter,
    searchTerm,
    setSearchTerm,
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
    downloadAttachment,
    downloadReport,
    refresh: () => {
      fetchOptions();
      fetchSummary();
      fetchPayments();
    }
  };
};
