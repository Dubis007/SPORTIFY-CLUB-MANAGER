import React from 'react';
import { Calendar, ClipboardList, Clock, Star, Users, Download } from 'lucide-react';
import { useCoachViewModel } from '../../viewmodels/useCoachViewModel';

export default function CoachDashboard() {
  const { trainings, evaluations, loading, error, downloadReport } = useCoachViewModel();

  if (loading) {
    return (
      <div className="p-8 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sportify-primary mx-auto mb-4"></div>
        <p className="text-gray-500">Cargando tu panel de entrenador...</p>
      </div>
    );
  }

  const upcomingTrainings = trainings.filter(t => new Date(t.fechaHora) >= new Date());
  const pastTrainings = trainings.filter(t => new Date(t.fechaHora) < new Date());

  return (
    <div className="p-6">
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Panel del Entrenador</h1>
          <p className="text-gray-600">Revisa tus próximos entrenamientos y evaluaciones realizadas.</p>
        </div>
        <button onClick={downloadReport} className="flex items-center gap-2 px-4 py-2 bg-sportify-primary text-white font-semibold rounded-lg hover:bg-red-700 transition-colors shadow">
          <Download size={20} /> Reporte de Desempeño
        </button>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-100 text-red-700 rounded-lg">
          {error}
        </div>
      )}

      {/* Resumen */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 flex items-center gap-4">
          <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center">
            <Calendar size={24} />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Próximos Entrenamientos</p>
            <h3 className="text-2xl font-bold text-gray-800">{upcomingTrainings.length}</h3>
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 flex items-center gap-4">
          <div className="w-12 h-12 bg-green-50 text-green-600 rounded-full flex items-center justify-center">
            <ClipboardList size={24} />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Entrenamientos Pasados</p>
            <h3 className="text-2xl font-bold text-gray-800">{pastTrainings.length}</h3>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 flex items-center gap-4">
          <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-full flex items-center justify-center">
            <Star size={24} />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Evaluaciones Realizadas</p>
            <h3 className="text-2xl font-bold text-gray-800">{evaluations.length}</h3>
          </div>
        </div>
      </div>

      {/* Listados */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Mis Entrenamientos */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-4 border-b border-gray-100 bg-gray-50 flex items-center justify-between">
            <h2 className="font-bold text-gray-800 flex items-center gap-2">
              <Clock size={18} className="text-sportify-primary" /> Mis Próximos Entrenamientos
            </h2>
          </div>
          <div className="p-0">
            {upcomingTrainings.length === 0 ? (
              <p className="p-6 text-center text-gray-500">No tienes entrenamientos programados.</p>
            ) : (
              <ul className="divide-y divide-gray-100">
                {upcomingTrainings.slice(0, 5).map(training => (
                  <li key={training.id} className="p-4 hover:bg-gray-50 transition-colors">
                    <h4 className="font-semibold text-gray-800">{training.titulo}</h4>
                    <p className="text-sm text-gray-500 mb-2">{training.descripcion}</p>
                    <div className="flex items-center gap-4 text-xs font-medium text-gray-600">
                      <span className="flex items-center gap-1">
                        <Calendar size={14} className="text-sportify-primary" />
                        {new Date(training.fechaHora).toLocaleString('es-CO')}
                      </span>
                      <span className="flex items-center gap-1">
                        <Users size={14} className="text-blue-500" />
                        Capacidad: {training.capacidadMaxima}
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* Mis Evaluaciones */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-4 border-b border-gray-100 bg-gray-50 flex items-center justify-between">
            <h2 className="font-bold text-gray-800 flex items-center gap-2">
              <ClipboardList size={18} className="text-green-600" /> Últimas Evaluaciones
            </h2>
          </div>
          <div className="p-0">
            {evaluations.length === 0 ? (
              <p className="p-6 text-center text-gray-500">Aún no has evaluado a ningún atleta.</p>
            ) : (
              <ul className="divide-y divide-gray-100">
                {evaluations.slice(0, 5).map(evaluation => (
                  <li key={evaluation.id} className="p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-semibold text-gray-800">Inscripción #{evaluation.inscripcionId}</h4>
                      <span className="px-2.5 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold">
                        Puntaje: {evaluation.puntaje}
                      </span>
                    </div>
                    {evaluation.comentarios && (
                      <p className="text-sm text-gray-600 italic mb-2">"{evaluation.comentarios}"</p>
                    )}
                    <div className="text-xs font-medium text-gray-500 flex items-center gap-1">
                      <Clock size={12} />
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
