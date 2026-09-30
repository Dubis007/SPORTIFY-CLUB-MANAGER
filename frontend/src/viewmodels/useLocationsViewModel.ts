import { useState, useEffect, useCallback } from 'react';
import { locationService, LocationDto } from '../services/api/locationService';

export const useLocationsViewModel = () => {
  const [locations, setLocations] = useState<LocationDto[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchLocations = useCallback(async () => {
    setLoading(true);
    try {
      const data = await locationService.getAll();
      setLocations(data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al cargar sedes');
    } finally {
      setLoading(false);
    }
  }, []);

  const createLocation = async (data: any) => {
    try {
      await locationService.create(data);
      fetchLocations();
      return true;
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al crear sede');
      return false;
    }
  };

  const updateLocation = async (id: number, data: any) => {
    try {
      await locationService.update(id, data);
      fetchLocations();
      return true;
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al actualizar sede');
      return false;
    }
  };

  const deleteLocation = async (id: number) => {
    try {
      await locationService.delete(id);
      fetchLocations();
      return true;
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al eliminar sede');
      return false;
    }
  };

  const downloadReport = async () => {
    try {
      await locationService.downloadReport();
    } catch (err: any) {
      setError('Error al descargar el reporte');
    }
  };

  useEffect(() => {
    fetchLocations();
  }, [fetchLocations]);

  return {
    locations,
    loading,
    error,
    createLocation,
    updateLocation,
    deleteLocation,
    downloadReport
  };
};
