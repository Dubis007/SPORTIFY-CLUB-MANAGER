import { useState, useEffect } from 'react';
import { memberService } from '../services/members/memberService';
import { paymentService } from '../services/api/paymentService';
import { apiClient } from '../services/api/apiClient';

export const useMemberViewModel = () => {
  const [profile, setProfile] = useState<any>(null);
  const [paymentsData, setPaymentsData] = useState<any>({ Memberships: [], Payments: [] });
  const [activitiesData, setActivitiesData] = useState<any>({ UpcomingTrainings: [], Attendances: [], Competitions: [] });
  const [loading, setLoading] = useState<boolean>(true);
  const [uploading, setUploading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAllData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [prof, pay, act] = await Promise.all([
        memberService.getProfile(),
        memberService.getPayments(),
        memberService.getActivities()
      ]);
      setProfile(prof);
      setPaymentsData(pay);
      setActivitiesData(act);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al cargar datos del miembro.');
    } finally {
      setLoading(false);
    }
  };

  const changePassword = async (data: any) => {
    try {
      await memberService.changePassword(data);
      return true;
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al cambiar contraseña.');
      return false;
    }
  };

  const createPaymentAndUpload = async (membresiaId: number, montoCOP: number, file: File) => {
    setUploading(true);
    try {
      // 1. Crear pago
      const payment = await paymentService.create({ membresiaId, montoCOP });
      
      // 2. Subir comprobante
      const formData = new FormData();
      formData.append('pagoId', payment.id.toString());
      formData.append('archivo', file);
      
      await apiClient.post('/api/receipts', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      // Refrescar datos
      await fetchAllData();
      return true;
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al procesar el pago y comprobante.');
      return false;
    } finally {
      setUploading(false);
    }
  };

  const [availableCompetitions, setAvailableCompetitions] = useState<any[]>([]);

  const fetchAvailableCompetitions = async () => {
    try {
      const response = await apiClient.get('/api/competitions');
      setAvailableCompetitions(response.data);
    } catch (err) {
      console.error(err);
    }
  };

  const registerForCompetition = async (competenciaId: number) => {
    try {
      if (!profile) return false;
      await apiClient.post('/api/registrations', {
        competenciaId,
        usuarioId: profile.id
      });
      await fetchAllData();
      return true;
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al inscribirse a la competencia.');
      return false;
    }
  };

  useEffect(() => {
    fetchAllData();
    fetchAvailableCompetitions();
  }, []);

  return {
    profile,
    paymentsData,
    activitiesData,
    loading,
    uploading,
    error,
    availableCompetitions,
    changePassword,
    createPaymentAndUpload,
    registerForCompetition,
    refresh: fetchAllData
  };
};
