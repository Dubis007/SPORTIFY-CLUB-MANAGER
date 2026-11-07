import { useState, useEffect } from 'react';
import { memberService } from '../services/members/memberService';
import { paymentService } from '../services/api/paymentService';
import { competitionService } from '../services/competitions/competitionService';
import { registrationService } from '../services/registrations/registrationService';

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

  const updateBirthDate = async (fechaNacimiento: string | null) => {
    try {
      await memberService.updateBirthDate(fechaNacimiento);
      await fetchAllData();
      return true;
    } catch (err: any) {
      setError(err.response?.data?.message || 'No se pudo actualizar la fecha de nacimiento.');
      return false;
    }
  };

  const createPaymentAndUpload = async (membresiaId: number, montoCOP: number, file: File) => {
    setUploading(true);
    try {
      // 1. Crear pago y adjuntar soporte mediante paymentService
      const payment = await paymentService.create({ membresiaId, montoCOP });
      await paymentService.uploadReceipt(payment.id, file);

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
      const data = await competitionService.getAll();
      setAvailableCompetitions(data);
    } catch (err) {
      console.error(err);
    }
  };

  const registerForCompetition = async (competenciaId: number) => {
    try {
      if (!profile) return false;
      await registrationService.create({
        competenciaId,
        usuarioId: profile.id,
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
    updateBirthDate,
    createPaymentAndUpload,
    registerForCompetition,
    refresh: fetchAllData
  };
};
