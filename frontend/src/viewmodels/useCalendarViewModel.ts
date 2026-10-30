import { useState, useEffect, useCallback, useMemo } from 'react';
import { trainingService } from '../services/trainings/trainingService';
import { competitionService } from '../services/competitions/competitionService';
import { Training, Competition } from '../models';

export type CalendarEventType = 'ENTRENAMIENTO' | 'COMPETENCIA';
export type CalendarViewMode = 'MES' | 'LISTA';
export type CalendarTypeFilter = 'TODOS' | CalendarEventType;

export interface CalendarEventItem {
  id: string;
  numericId: number;
  type: CalendarEventType;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  location: string;
  status?: string;
  capacity?: number;
}

export function toLocalDateKey(dateInput: Date | string): string {
  const d = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function toGoogleCalendarTimestamp(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) {
    return new Date().toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
  }
  return d.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
}

export function buildGoogleCalendarUrl(event: CalendarEventItem): string {
  const start = toGoogleCalendarTimestamp(event.startDate);
  const parsedEnd = new Date(event.endDate);
  const parsedStart = new Date(event.startDate);
  const validEnd =
    !Number.isNaN(parsedEnd.getTime()) && parsedEnd.getTime() > parsedStart.getTime()
      ? event.endDate
      : new Date(parsedStart.getTime() + 90 * 60 * 1000).toISOString();
  const end = toGoogleCalendarTimestamp(validEnd);

  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: `[Sportify] ${event.title}`,
    dates: `${start}/${end}`,
    details: event.description || `Evento deportivo (${event.type}) en Sportify Club Manager.`,
    location: event.location,
  });

  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

export const useCalendarViewModel = (initialDate?: Date) => {
  const baseDate = initialDate ?? new Date();
  const [currentMonth, setCurrentMonth] = useState<Date>(
    () => new Date(baseDate.getFullYear(), baseDate.getMonth(), 1)
  );
  const [selectedDateKey, setSelectedDateKey] = useState<string>(() =>
    toLocalDateKey(baseDate)
  );
  const [viewMode, setViewMode] = useState<CalendarViewMode>('MES');
  const [typeFilter, setTypeFilter] = useState<CalendarTypeFilter>('TODOS');

  const [trainings, setTrainings] = useState<Training[]>([]);
  const [competitions, setCompetitions] = useState<Competition[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCalendarData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [trainingsData, competitionsData] = await Promise.all([
        trainingService.getAll(),
        competitionService.getAll(),
      ]);
      setTrainings(trainingsData ?? []);
      setCompetitions(competitionsData ?? []);
    } catch (err: any) {
      setError(
        err.response?.data?.message ||
          'No fue posible cargar la programación del calendario deportivo.'
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCalendarData();
  }, [fetchCalendarData]);

  const allEvents = useMemo<CalendarEventItem[]>(() => {
    const mappedTrainings: CalendarEventItem[] = trainings.map((t) => ({
      id: `training-${t.id}`,
      numericId: t.id,
      type: 'ENTRENAMIENTO',
      title: t.titulo,
      description: t.descripcion,
      startDate: t.fechaHora,
      endDate: t.fechaFin || t.fechaHora,
      location: `Sede #${t.sedeId}`,
      status: t.estado,
      capacity: t.capacidadMaxima,
    }));

    const mappedCompetitions: CalendarEventItem[] = competitions.map((c) => ({
      id: `competition-${c.id}`,
      numericId: c.id,
      type: 'COMPETENCIA',
      title: c.nombre,
      description: c.descripcion,
      startDate: c.fechaInicio,
      endDate: c.fechaFin || c.fechaInicio,
      location: c.ubicacion || 'Ubicación por confirmar',
      status: 'PROGRAMADA',
    }));

    return [...mappedTrainings, ...mappedCompetitions].sort(
      (a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime()
    );
  }, [trainings, competitions]);

  const filteredEvents = useMemo(() => {
    if (typeFilter === 'TODOS') return allEvents;
    return allEvents.filter((e) => e.type === typeFilter);
  }, [allEvents, typeFilter]);

  const eventsForCurrentMonth = useMemo(() => {
    const targetYear = currentMonth.getFullYear();
    const targetMonth = currentMonth.getMonth();
    return filteredEvents.filter((e) => {
      const d = new Date(e.startDate);
      return d.getFullYear() === targetYear && d.getMonth() === targetMonth;
    });
  }, [filteredEvents, currentMonth]);

  const eventsByDateMap = useMemo(() => {
    const map: Record<string, CalendarEventItem[]> = {};
    for (const ev of filteredEvents) {
      const key = toLocalDateKey(ev.startDate);
      if (!map[key]) map[key] = [];
      map[key].push(ev);
    }
    return map;
  }, [filteredEvents]);

  const eventsForSelectedDate = useMemo(() => {
    return eventsByDateMap[selectedDateKey] ?? [];
  }, [eventsByDateMap, selectedDateKey]);

  const prevMonth = () => {
    setCurrentMonth((prev) => {
      const next = new Date(prev.getFullYear(), prev.getMonth() - 1, 1);
      setSelectedDateKey(toLocalDateKey(next));
      return next;
    });
  };

  const nextMonth = () => {
    setCurrentMonth((prev) => {
      const next = new Date(prev.getFullYear(), prev.getMonth() + 1, 1);
      setSelectedDateKey(toLocalDateKey(next));
      return next;
    });
  };

  const goToToday = () => {
    const now = new Date();
    setCurrentMonth(new Date(now.getFullYear(), now.getMonth(), 1));
    setSelectedDateKey(toLocalDateKey(now));
  };

  return {
    currentMonth,
    selectedDateKey,
    setSelectedDateKey,
    viewMode,
    setViewMode,
    typeFilter,
    setTypeFilter,
    eventsForCurrentMonth,
    eventsForSelectedDate,
    eventsByDateMap,
    loading,
    error,
    prevMonth,
    nextMonth,
    goToToday,
    refresh: fetchCalendarData,
  };
};
