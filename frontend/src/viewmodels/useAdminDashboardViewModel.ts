import { useState, useEffect, useCallback, useRef } from 'react';
import { dashboardService } from '../services/api/dashboardService';
import { DashboardStats } from '../models';

export const REFRESH_INTERVAL_MS = 30_000;

export const useAdminDashboardViewModel = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState<boolean>(true); // solo la primera carga
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Evita peticiones superpuestas (intervalo + botón + volver a la pestaña)
  const inFlight = useRef(false);

  const refresh = useCallback(async () => {
    if (inFlight.current) return;
    inFlight.current = true;
    setRefreshing(true);
    try {
      setStats(await dashboardService.getStats());
      setLastUpdated(new Date());
      setError(null);
    } catch (err: any) {
      // Se conservan los últimos datos; los 5xx ya muestran un toast desde el interceptor
      setError(err.response?.data?.message || 'No se pudieron actualizar las métricas');
    } finally {
      inFlight.current = false;
      setRefreshing(false);
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();

    // Con la pestaña oculta no se consulta; al volver se refresca de inmediato
    const timer = setInterval(() => {
      if (document.visibilityState === 'visible') refresh();
    }, REFRESH_INTERVAL_MS);

    const onVisibilityChange = () => {
      if (document.visibilityState === 'visible') refresh();
    };
    document.addEventListener('visibilitychange', onVisibilityChange);

    return () => {
      clearInterval(timer);
      document.removeEventListener('visibilitychange', onVisibilityChange);
    };
  }, [refresh]);

  return { stats, loading, refreshing, lastUpdated, error, refresh };
};
