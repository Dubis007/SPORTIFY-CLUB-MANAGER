import { useState, useEffect } from 'react';
import { registrationService } from '../services/registrations/registrationService';
import { Registration } from '../models';

export const useRegistrationsViewModel = () => {
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [options, setOptions] = useState<{competitions: any[], members: any[]}>({ competitions: [], members: [] });

  const fetchRegistrations = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await registrationService.getAll();
      setRegistrations(data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al obtener inscripciones');
    } finally {
      setLoading(false);
    }
  };

  const fetchOptions = async () => {
    try {
      const data = await registrationService.getOptions();
      setOptions(data);
    } catch (err: any) {
      console.error(err);
    }
  };

  const createRegistration = async (data: Partial<Registration>) => {
    try {
      await registrationService.create(data);
      // Actualizamos con fetchRegistrations para traer los nombres del Join
      fetchRegistrations();
      return true;
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al crear inscripción');
      return false;
    }
  };

  const updateRegistration = async (id: number, data: Partial<Registration>) => {
    try {
      await registrationService.update(id, data);
      fetchRegistrations();
      return true;
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al actualizar inscripción');
      return false;
    }
  };

  const deleteRegistration = async (id: number) => {
    try {
      await registrationService.delete(id);
      setRegistrations(prev => prev.filter(r => r.id !== id));
      return true;
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al eliminar inscripción');
      return false;
    }
  };

  useEffect(() => {
    fetchRegistrations();
    fetchOptions();
  }, []);

  return {
    registrations,
    options,
    loading,
    error,
    createRegistration,
    updateRegistration,
    deleteRegistration,
    refresh: fetchRegistrations
  };
};
