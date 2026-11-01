import { useMemo, useState } from 'react';
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Clock,
  ExternalLink,
  List,
  MapPin,
  Trophy,
  Timer,
  Cake,
  X,
  AlertTriangle,
} from 'lucide-react';
import {
  useCalendarViewModel,
  buildGoogleCalendarUrl,
  toLocalDateKey,
  CalendarEventItem,
  CalendarTypeFilter,
} from '../../viewmodels/useCalendarViewModel';

const WEEKDAY_LABELS = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];

const MONTH_NAMES = [
  'Enero',
  'Febrero',
  'Marzo',
  'Abril',
  'Mayo',
  'Junio',
  'Julio',
  'Agosto',
  'Septiembre',
  'Octubre',
  'Noviembre',
  'Diciembre',
];

function formatDaysRemaining(days: number): string {
  if (days === 0) return '¡Hoy!';
  if (days === 1) return 'Mañana';
  return `En ${days} días`;
}

export default function CalendarPage() {
  const {
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
    upcomingBirthdaysNotice,
    focusDate,
    loading,
    error,
    prevMonth,
    nextMonth,
    goToToday,
  } = useCalendarViewModel();

  const [selectedEvent, setSelectedEvent] = useState<CalendarEventItem | null>(null);

  const calendarCells = useMemo(() => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const startOffset = (firstDay.getDay() + 6) % 7;

    const cells: Array<{ date: Date | null; key: string }> = [];
    for (let i = 0; i < startOffset; i++) {
      cells.push({ date: null, key: `empty-start-${i}` });
    }
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      cells.push({ date, key: toLocalDateKey(date) });
    }
    return cells;
  }, [currentMonth]);

  const todayKey = toLocalDateKey(new Date());

  const formatTime = (iso: string) => {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return '--:--';
    return d.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' });
  };

  const formatFullDate = (isoOrKey: string) => {
    const d = isoOrKey.length === 10 ? new Date(`${isoOrKey}T12:00:00`) : new Date(isoOrKey);
    if (Number.isNaN(d.getTime())) return isoOrKey;
    return d.toLocaleDateString('es-CO', {
      weekday: 'short',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  const getDurationHours = (event: CalendarEventItem): string => {
    if (event.type === 'CUMPLEANOS') return 'Todo el día';
    const start = new Date(event.startDate).getTime();
    const end = new Date(event.endDate).getTime();
    if (Number.isNaN(start) || Number.isNaN(end) || end <= start) return '1.5 h aprox.';
    const hours = (end - start) / (1000 * 60 * 60);
    return `${hours.toFixed(1)} h`;
  };

  const getEventStyle = (type: CalendarEventItem['type']) => {
    if (type === 'COMPETENCIA') {
      return {
        chip: 'bg-rose-500/15 text-rose-300 border-rose-500/30 hover:bg-rose-500/25',
        iconBox: 'bg-rose-500/15 text-rose-400 border border-rose-500/30',
        badge: 'bg-rose-500/15 text-rose-300',
        label: 'COMPETENCIA',
      };
    }
    if (type === 'CUMPLEANOS') {
      return {
        chip: 'bg-amber-500/15 text-amber-300 border-amber-500/30 hover:bg-amber-500/25',
        iconBox: 'bg-amber-500/15 text-amber-300 border border-amber-500/30',
        badge: 'bg-amber-500/15 text-amber-300',
        label: 'CUMPLEAÑOS',
      };
    }
    return {
      chip: 'bg-blue-500/15 text-blue-300 border-blue-500/30 hover:bg-blue-500/25',
      iconBox: 'bg-blue-500/15 text-blue-400 border border-blue-500/30',
      badge: 'bg-blue-500/15 text-blue-300',
      label: 'ENTRENAMIENTO',
    };
  };

  if (loading) {
    return (
      <div aria-busy="true" className="space-y-6 animate-pulse" data-testid="calendar-skeleton">
        <div className="h-12 bg-slate-800/80 rounded-xl w-1/3" />
        <div className="h-20 bg-slate-900 rounded-2xl border border-slate-800" />
        <div className="h-96 bg-slate-900 rounded-2xl border border-slate-800" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="h-44 bg-slate-900 rounded-2xl border border-slate-800" />
          <div className="h-44 bg-slate-900 rounded-2xl border border-slate-800" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Encabezado y controles */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
            <CalendarDays size={24} className="text-blue-400" /> Calendario del Club
          </h1>
          <p className="text-slate-400 text-xs mt-1">
            Entrenamientos, competencias y avisos de próximos cumpleaños en un solo lugar
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Filtro por tipo */}
          {(
            ['TODOS', 'COMPETENCIA', 'ENTRENAMIENTO', 'CUMPLEANOS'] as CalendarTypeFilter[]
          ).map((filter) => (
            <button
              key={filter}
              type="button"
              onClick={() => setTypeFilter(filter)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors ${
                typeFilter === filter
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-900 text-slate-300 border border-slate-800 hover:bg-slate-800'
              }`}
            >
              {filter === 'TODOS'
                ? 'Todos'
                : filter === 'COMPETENCIA'
                ? 'Competencias'
                : filter === 'ENTRENAMIENTO'
                ? 'Entrenamientos'
                : 'Cumpleaños'}
            </button>
          ))}

          {/* Conmutador Mes / Lista */}
          <div className="flex items-center bg-slate-900 border border-slate-800 rounded-xl p-0.5">
            <button
              type="button"
              onClick={() => setViewMode('MES')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 ${
                viewMode === 'MES' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <CalendarDays size={13} /> Mes
            </button>
            <button
              type="button"
              onClick={() => setViewMode('LISTA')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 ${
                viewMode === 'LISTA' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <List size={13} /> Lista
            </button>
          </div>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-rose-500/10 border border-rose-500/30 text-rose-300 rounded-xl flex items-center text-xs">
          <AlertTriangle size={18} className="mr-2 shrink-0" /> {error}
        </div>
      )}

      {/* Aviso de Próximos Cumpleaños (TAREA-P2-06C / DEC-009) */}
      {upcomingBirthdaysNotice.length > 0 && (
        <div
          data-testid="calendar-birthday-notice"
          className="bg-amber-500/10 border border-amber-500/25 rounded-2xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-3"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/30 text-amber-300 flex items-center justify-center shrink-0">
              <Cake size={20} />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-100">
                Aviso de Próximos Cumpleaños
              </h2>
              <p className="text-xs text-slate-300 mt-0.5">
                Selecciona una fecha para ubicarla directamente en el calendario.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {upcomingBirthdaysNotice.map((b) => {
              const dateLabel = new Date(`${b.proximaFecha.slice(0, 10)}T12:00:00`).toLocaleDateString(
                'es-CO',
                { day: 'numeric', month: 'short' }
              );
              return (
                <button
                  key={b.usuarioId}
                  type="button"
                  onClick={() => focusDate(b.proximaFecha)}
                  className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-950/80 hover:bg-slate-900 border border-amber-500/30 text-xs transition-colors"
                >
                  <Cake size={13} className="text-amber-400" />
                  <span className="font-semibold text-slate-100">{b.nombreCompleto}</span>
                  <span className="text-slate-400">({dateLabel})</span>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      b.diasFaltantes === 0
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                        : 'bg-amber-500/20 text-amber-300'
                    }`}
                  >
                    {formatDaysRemaining(b.diasFaltantes)}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Barra de navegación de mes */}
      <div className="flex items-center justify-between bg-slate-900/90 border border-slate-800 rounded-2xl px-5 py-3.5">
        <div className="flex items-center gap-2">
          <button
            type="button"
            aria-label="Mes anterior"
            onClick={prevMonth}
            className="p-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-300 hover:bg-slate-800"
          >
            <ChevronLeft size={16} />
          </button>
          <button
            type="button"
            aria-label="Mes siguiente"
            onClick={nextMonth}
            className="p-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-300 hover:bg-slate-800"
          >
            <ChevronRight size={16} />
          </button>
          <h2 className="text-lg font-bold text-slate-100 ml-2">
            {MONTH_NAMES[currentMonth.getMonth()]} {currentMonth.getFullYear()}
          </h2>
        </div>

        <button
          type="button"
          onClick={goToToday}
          className="px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700"
        >
          Hoy
        </button>
      </div>

      {/* Vista Mensual */}
      {viewMode === 'MES' ? (
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl overflow-hidden">
          <div className="grid grid-cols-7 bg-slate-950/80 border-b border-slate-800">
            {WEEKDAY_LABELS.map((dayLabel) => (
              <div
                key={dayLabel}
                className="py-2.5 text-center text-xs font-semibold uppercase tracking-wider text-slate-400"
              >
                {dayLabel}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 divide-x divide-y divide-slate-800/70">
            {calendarCells.map((cell) => {
              if (!cell.date) {
                return <div key={cell.key} className="min-h-[96px] bg-slate-950/30" />;
              }

              const dayEvents = eventsByDateMap[cell.key] ?? [];
              const isSelected = cell.key === selectedDateKey;
              const isToday = cell.key === todayKey;

              return (
                <div
                  key={cell.key}
                  onClick={() => setSelectedDateKey(cell.key)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') setSelectedDateKey(cell.key);
                  }}
                  className={`min-h-[104px] p-2 transition-colors cursor-pointer ${
                    isSelected
                      ? 'bg-blue-950/40 ring-1 ring-inset ring-blue-500/60'
                      : 'hover:bg-slate-800/40'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span
                      className={`w-6 h-6 rounded-full text-xs font-bold flex items-center justify-center ${
                        isToday
                          ? 'bg-blue-600 text-white'
                          : isSelected
                          ? 'text-blue-300'
                          : 'text-slate-300'
                      }`}
                    >
                      {cell.date.getDate()}
                    </span>
                    {dayEvents.length > 0 && (
                      <span className="text-[10px] font-semibold text-slate-400">
                        {dayEvents.length}
                      </span>
                    )}
                  </div>

                  <div className="space-y-1">
                    {dayEvents.slice(0, 3).map((ev) => {
                      const style = getEventStyle(ev.type);
                      return (
                        <button
                          key={ev.id}
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedEvent(ev);
                          }}
                          className={`w-full text-left truncate px-1.5 py-0.5 rounded text-[11px] font-medium border flex items-center gap-1 ${style.chip}`}
                        >
                          {ev.type === 'CUMPLEANOS' && <Cake size={11} className="shrink-0" />}
                          <span className="truncate">{ev.title}</span>
                        </button>
                      );
                    })}
                    {dayEvents.length > 3 && (
                      <div className="text-[10px] text-slate-400 pl-1">
                        +{dayEvents.length - 3} más
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : null}

      {/* Paneles inferiores: Día seleccionado y Todo el mes */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Eventos del día seleccionado */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 space-y-3">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="text-sm font-bold text-slate-100">
              Agenda del Día ({formatFullDate(selectedDateKey)})
            </h3>
            <span className="text-xs font-semibold text-slate-400">
              {eventsForSelectedDate.length} evento(s)
            </span>
          </div>

          {eventsForSelectedDate.length === 0 ? (
            <div className="py-8 text-center text-slate-400 text-xs">
              Sin eventos programados para el día seleccionado.
            </div>
          ) : (
            <div className="space-y-2.5">
              {eventsForSelectedDate.map((ev) => {
                const style = getEventStyle(ev.type);
                return (
                  <div
                    key={ev.id}
                    onClick={() => setSelectedEvent(ev)}
                    className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 hover:border-slate-700 cursor-pointer flex items-center justify-between gap-3"
                  >
                    <div className="flex items-start gap-3">
                      <div className={`p-2 rounded-lg mt-0.5 ${style.iconBox}`}>
                        {ev.type === 'COMPETENCIA' ? (
                          <Trophy size={15} />
                        ) : ev.type === 'CUMPLEANOS' ? (
                          <Cake size={15} />
                        ) : (
                          <Timer size={15} />
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-slate-100">{ev.title}</p>
                        <p className="text-xs text-slate-400 flex items-center gap-2 mt-0.5">
                          {ev.type === 'CUMPLEANOS' ? (
                            <span>Celebración institucional</span>
                          ) : (
                            <>
                              <Clock size={12} /> {formatTime(ev.startDate)} • <MapPin size={12} />{' '}
                              {ev.location}
                            </>
                          )}
                        </p>
                      </div>
                    </div>
                    <span
                      className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${style.badge}`}
                    >
                      {style.label}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Eventos de todo el mes */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 space-y-3">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="text-sm font-bold text-slate-100">
              Todo el Mes ({MONTH_NAMES[currentMonth.getMonth()]} {currentMonth.getFullYear()})
            </h3>
            <span className="text-xs font-semibold text-slate-400">
              {eventsForCurrentMonth.length} evento(s)
            </span>
          </div>

          {eventsForCurrentMonth.length === 0 ? (
            <div className="py-8 text-center text-slate-400 text-xs">
              Sin eventos programados este mes.
            </div>
          ) : (
            <div className="space-y-2.5 max-h-80 overflow-y-auto pr-1">
              {eventsForCurrentMonth.map((ev) => {
                const style = getEventStyle(ev.type);
                return (
                  <div
                    key={ev.id}
                    onClick={() => setSelectedEvent(ev)}
                    className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 hover:border-slate-700 cursor-pointer flex items-center justify-between gap-3"
                  >
                    <div>
                      <p className="text-sm font-semibold text-slate-100">{ev.title}</p>
                      <p className="text-xs text-slate-400 mt-0.5">
                        {formatFullDate(ev.startDate)}
                        {ev.type !== 'CUMPLEANOS' &&
                          ` • ${formatTime(ev.startDate)} — ${ev.location}`}
                      </p>
                    </div>
                    <span
                      className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full shrink-0 ${style.badge}`}
                    >
                      {style.label}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Modal de detalle del evento + exportación a Google Calendar */}
      {selectedEvent && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl max-w-lg w-full p-6 space-y-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <span
                  className={`inline-block text-[10px] font-bold uppercase px-2.5 py-0.5 rounded-full mb-2 ${
                    getEventStyle(selectedEvent.type).badge
                  }`}
                >
                  {getEventStyle(selectedEvent.type).label}
                </span>
                <h2 className="text-lg font-bold text-slate-100">{selectedEvent.title}</h2>
              </div>
              <button
                type="button"
                aria-label="Cerrar detalle"
                onClick={() => setSelectedEvent(null)}
                className="p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700"
              >
                <X size={16} />
              </button>
            </div>

            <div className="space-y-2 text-xs text-slate-300 bg-slate-950/70 p-4 rounded-xl border border-slate-800">
              <p>
                <strong className="text-slate-400">Fecha:</strong>{' '}
                {formatFullDate(selectedEvent.startDate)}
                {selectedEvent.type !== 'CUMPLEANOS' &&
                  ` (${formatTime(selectedEvent.startDate)})`}
              </p>
              <p>
                <strong className="text-slate-400">Duración:</strong>{' '}
                {getDurationHours(selectedEvent)}
              </p>
              <p>
                <strong className="text-slate-400">Ubicación:</strong> {selectedEvent.location}
              </p>
              {selectedEvent.capacity ? (
                <p>
                  <strong className="text-slate-400">Capacidad máxima:</strong>{' '}
                  {selectedEvent.capacity} deportistas
                </p>
              ) : null}
              <p>
                <strong className="text-slate-400">Detalle:</strong>{' '}
                {selectedEvent.description || 'Sin descripción adicional registrada.'}
              </p>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <a
                href={buildGoogleCalendarUrl(selectedEvent)}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white"
              >
                <ExternalLink size={14} /> Añadir a Google Calendar
              </a>
              <button
                type="button"
                onClick={() => setSelectedEvent(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
