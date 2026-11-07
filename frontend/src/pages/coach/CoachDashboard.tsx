import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Calendar,
  ClipboardList,
  Clock,
  Star,
  Users,
  Download,
  Cake,
  CheckSquare,
  ArrowRight,
  AlertTriangle,
} from 'lucide-react';
import { useCoachViewModel } from '../../viewmodels/useCoachViewModel';
import { userService } from '../../services/users/userService';
import { UpcomingBirthday } from '../../models';

export default function CoachDashboard() {
  const { trainings, evaluations, evaluationsTotal, loading, error, downloadReport } =
    useCoachViewModel();
  const [birthdays, setBirthdays] = useState<UpcomingBirthday[]>([]);

  useEffect(() => {
    userService
      .getUpcomingBirthdays(14)
      .then((data) => setBirthdays(data))
      .catch(() => setBirthdays([]));
  }, []);

  if (loading && trainings.length === 0) {
    return (
      <div className="space-y-6 animate-pulse" aria-busy="true">
        <div className="flex justify-between items-center border-b border-slate-800 pb-4">
          <div className="space-y-2">
            <div className="h-6 w-52 bg-slate-800 rounded-lg" />
            <div className="h-4 w-72 bg-slate-900 rounded-lg" />
          </div>
          <div className="h-10 w-44 bg-slate-800 rounded-xl" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {[1, 2, 3].map((k) => (
            <div key={k} className="h-24 bg-slate-900 border border-slate-800 rounded-2xl" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="h-72 bg-slate-900 border border-slate-800 rounded-2xl" />
          <div className="h-72 bg-slate-900 border border-slate-800 rounded-2xl" />
        </div>
      </div>
    );
  }

  const upcomingTrainings = trainings.filter((t) => new Date(t.fechaHora) >= new Date());
  const pastTrainings = trainings.filter((t) => new Date(t.fechaHora) < new Date());

  return (
    <div className="space-y-6">
      {/* Encabezado limpio y centrado en el entrenador */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between border-b border-slate-800 pb-4 gap-4">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-widest text-blue-400">
            Dirección Técnica
          </span>
          <h1 className="text-2xl font-bold text-slate-100 mt-0.5">Panel del Entrenador</h1>
          <p className="text-slate-400 text-xs mt-1">
            Tus sesiones programadas, toma rápida de asistencia y seguimiento de atletas.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Link
            to="/coach/trainings"
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-xl transition-colors shadow-sm"
          >
            <CheckSquare size={15} /> Gestionar Asistencias
          </Link>
          <button
            type="button"
            onClick={downloadReport}
            className="inline-flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-100 border border-slate-700 text-xs font-semibold rounded-xl transition-colors"
          >
            <Download size={15} className="text-blue-400" /> Reporte de Desempeño
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-rose-500/10 border border-rose-500/30 text-rose-300 rounded-xl flex items-center text-xs gap-2">
          <AlertTriangle size={16} className="shrink-0" /> {error}
        </div>
      )}

      {/* Aviso breve de próximos cumpleaños del equipo */}
      {birthdays.length > 0 && (
        <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-300 shrink-0">
              <Cake size={18} />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold text-amber-200">
                Próximos cumpleaños del club ({birthdays.length})
              </p>
              <p className="text-xs text-slate-300 truncate">
                {birthdays
                  .slice(0, 3)
                  .map(
                    (b) =>
                      `${b.nombreCompleto} (${
                        b.diasFaltantes === 0
                          ? '¡Hoy!'
                          : b.diasFaltantes === 1
                          ? 'Mañana'
                          : `en ${b.diasFaltantes} días`
                      })`
                  )
                  .join(' · ')}
              </p>
            </div>
          </div>
          <Link
            to="/coach/calendar"
            className="inline-flex items-center gap-1 text-xs font-semibold text-amber-300 hover:text-amber-200 shrink-0"
          >
            Ver en calendario <ArrowRight size={13} />
          </Link>
        </div>
      )}

      {/* KPIs esenciales para el entrenador */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="bg-slate-900/90 rounded-2xl p-5 border border-slate-800 flex items-center gap-4">
          <div className="w-12 h-12 bg-blue-500/15 border border-blue-500/30 text-blue-400 rounded-xl flex items-center justify-center">
            <Calendar size={22} />
          </div>
          <div>
            <p className="text-xs text-slate-400 font-semibold uppercase">
              Próximos Entrenamientos
            </p>
            <h3 className="text-2xl font-bold text-slate-100">{upcomingTrainings.length}</h3>
          </div>
        </div>

        <div className="bg-slate-900/90 rounded-2xl p-5 border border-slate-800 flex items-center gap-4">
          <div className="w-12 h-12 bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 rounded-xl flex items-center justify-center">
            <ClipboardList size={22} />
          </div>
          <div>
            <p className="text-xs text-slate-400 font-semibold uppercase">Sesiones Realizadas</p>
            <h3 className="text-2xl font-bold text-slate-100">{pastTrainings.length}</h3>
          </div>
        </div>

        <div className="bg-slate-900/90 rounded-2xl p-5 border border-slate-800 flex items-center gap-4">
          <div className="w-12 h-12 bg-violet-500/15 border border-violet-500/30 text-violet-400 rounded-xl flex items-center justify-center">
            <Star size={22} />
          </div>
          <div>
            <p className="text-xs text-slate-400 font-semibold uppercase">
              Observaciones Registradas
            </p>
            <h3 className="text-2xl font-bold text-slate-100">{evaluationsTotal}</h3>
          </div>
        </div>
      </div>

      {/* Paneles de acción directa */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Próximos Entrenamientos con acceso de 1 clic a asistencia */}
        <div className="bg-slate-900/90 rounded-2xl border border-slate-800 overflow-hidden">
          <div className="p-4 border-b border-slate-800 bg-slate-950/50 flex items-center justify-between">
            <h2 className="font-bold text-sm text-slate-100 flex items-center gap-2">
              <Clock size={16} className="text-blue-400" /> Mis Próximos Entrenamientos
            </h2>
            <Link
              to="/coach/trainings"
              className="text-xs font-semibold text-blue-400 hover:text-blue-300"
            >
              Ver todos
            </Link>
          </div>
          <div>
            {upcomingTrainings.length === 0 ? (
              <div className="p-8 text-center space-y-2">
                <p className="text-sm text-slate-400">No tienes entrenamientos próximos programados.</p>
                <Link
                  to="/coach/trainings"
                  className="inline-flex items-center gap-1 text-xs font-semibold text-blue-400 hover:text-blue-300"
                >
                  Programar nueva sesión <ArrowRight size={13} />
                </Link>
              </div>
            ) : (
              <ul className="divide-y divide-slate-800/80">
                {upcomingTrainings.slice(0, 5).map((training) => (
                  <li
                    key={training.id}
                    className="p-4 hover:bg-slate-800/40 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div className="min-w-0">
                      <h4 className="font-semibold text-sm text-slate-100 truncate">
                        {training.titulo}
                      </h4>
                      {training.descripcion && (
                        <p className="text-xs text-slate-400 mt-0.5 line-clamp-1">
                          {training.descripcion}
                        </p>
                      )}
                      <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400 mt-2">
                        <span className="inline-flex items-center gap-1">
                          <Calendar size={13} className="text-blue-400" />
                          {new Date(training.fechaHora).toLocaleString('es-CO', {
                            dateStyle: 'medium',
                            timeStyle: 'short',
                          })}
                        </span>
                        <span className="inline-flex items-center gap-1">
                          <Users size={13} className="text-emerald-400" />
                          Cupo: {training.capacidadMaxima}
                        </span>
                      </div>
                    </div>
                    <Link
                      to={`/coach/trainings?attendance=${training.id}`}
                      className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-blue-600/20 text-blue-300 hover:bg-blue-600/30 border border-blue-500/30 shrink-0 transition-colors"
                    >
                      <CheckSquare size={13} /> Tomar asistencia
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* Últimas Evaluaciones */}
        <div className="bg-slate-900/90 rounded-2xl border border-slate-800 overflow-hidden">
          <div className="p-4 border-b border-slate-800 bg-slate-950/50 flex items-center justify-between">
            <h2 className="font-bold text-sm text-slate-100 flex items-center gap-2">
              <ClipboardList size={16} className="text-emerald-400" /> Últimas Observaciones de Torneos
            </h2>
            <Link
              to="/coach/evaluations"
              className="text-xs font-semibold text-blue-400 hover:text-blue-300"
            >
              Registrar nueva
            </Link>
          </div>
          <div>
            {evaluations.length === 0 ? (
              <div className="p-8 text-center space-y-2">
                <p className="text-sm text-slate-400">
                  Aún no has registrado observaciones técnicas en competencias.
                </p>
                <Link
                  to="/coach/evaluations"
                  className="inline-flex items-center gap-1 text-xs font-semibold text-blue-400 hover:text-blue-300"
                >
                  Evaluar participación <ArrowRight size={13} />
                </Link>
              </div>
            ) : (
              <ul className="divide-y divide-slate-800/80">
                {evaluations.slice(0, 5).map((evaluation) => (
                  <li key={evaluation.id} className="p-4 hover:bg-slate-800/40 transition-colors">
                    <div className="flex justify-between items-start gap-2 mb-1.5">
                      <h4 className="font-semibold text-sm text-slate-100">
                        {evaluation.usuarioNombre
                          ? `${evaluation.usuarioNombre} · ${evaluation.competenciaNombre || ''}`
                          : `Inscripción #${evaluation.inscripcionId}`}
                      </h4>
                      <span className="px-2.5 py-0.5 bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 rounded-full text-xs font-bold shrink-0">
                        Puntaje: {evaluation.puntaje}
                      </span>
                    </div>
                    {evaluation.comentarios && (
                      <p className="text-xs text-slate-300 italic mb-1.5">
                        "{evaluation.comentarios}"
                      </p>
                    )}
                    <div className="text-[11px] text-slate-500 flex items-center gap-1">
                      <Clock size={11} />
                      Evaluado el {new Date(evaluation.evaluadoEn).toLocaleDateString('es-CO')}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
