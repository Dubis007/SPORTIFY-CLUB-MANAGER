import { useState, useEffect, useCallback } from 'react';
import { profileService } from '../services/profile/profileService';

export const useProfileViewModel = () => {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProfile = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await profileService.getProfile();
      setProfile(data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al obtener perfil');
    } finally {
      setLoading(false);
    }
  }, []);

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
    fetchProfile();
  }, [fetchProfile]);

  return {
    profile,
    loading,
    error,
    changePassword,
    refresh: fetchProfile
  };
};
