import React, { useEffect, useState } from 'react';
import { apiClient } from '../../services/api/apiClient';

interface DashboardStats {
  totalUsers: number;
  totalMemberships: number;
  totalRevenue: number;
  pendingPayments: number;
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    totalMemberships: 0,
    totalRevenue: 0,
    pendingPayments: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulando carga de datos del dashboard
    // En una API real harías un GET /api/dashboard/stats
    const fetchStats = async () => {
      try {
        setLoading(true);
        // Simulamos retardo y datos ficticios ya que no hay un controller especifico de estadisticas
        setTimeout(() => {
          setStats({
            totalUsers: 145,
            totalMemberships: 89,
            totalRevenue: 4500000,
            pendingPayments: 12
          });
          setLoading(false);
        }, 800);
      } catch (error) {
        console.error('Error fetching stats', error);
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const handleDownloadReport = async (type: 'members' | 'payments') => {
    try {
      const response = await apiClient.get(`/api/reports/${type}/pdf`, {
        responseType: 'blob'
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `reporte_${type}_${new Date().getTime()}.pdf`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Error descargando el reporte', error);
      alert('Hubo un error al generar el reporte PDF.');
    }
  };

  return (
    <div className="space-y-6">
      <div className="border-b pb-4">
        <h1 className="text-3xl font-bold text-sportify-dark">Dashboard Principal</h1>
        <p className="text-gray-500 mt-1">Resumen estadístico y reportes del club</p>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-20">
          <div className="spinner-border text-sportify-primary" role="status"></div>
        </div>
      ) : (
        <>
          {/* Tarjetas de Indicadores */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex items-center">
              <div className="bg-blue-100 p-4 rounded-full text-blue-600 mr-4">
                <i className="bi bi-people-fill text-2xl"></i>
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-500 uppercase">Usuarios Totales</p>
                <p className="text-3xl font-bold text-sportify-dark">{stats.totalUsers}</p>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex items-center">
              <div className="bg-green-100 p-4 rounded-full text-green-600 mr-4">
                <i className="bi bi-card-checklist text-2xl"></i>
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-500 uppercase">Membresías Activas</p>
                <p className="text-3xl font-bold text-sportify-dark">{stats.totalMemberships}</p>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex items-center">
              <div className="bg-yellow-100 p-4 rounded-full text-yellow-600 mr-4">
                <i className="bi bi-currency-dollar text-2xl"></i>
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-500 uppercase">Ingresos Mensuales</p>
                <p className="text-3xl font-bold text-sportify-dark">${stats.totalRevenue.toLocaleString()}</p>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex items-center">
              <div className="bg-red-100 p-4 rounded-full text-red-600 mr-4">
                <i className="bi bi-exclamation-circle-fill text-2xl"></i>
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-500 uppercase">Pagos Pendientes</p>
                <p className="text-3xl font-bold text-sportify-dark">{stats.pendingPayments}</p>
              </div>
            </div>
          </div>

          {/* Generación de Reportes PDF */}
          <div className="mt-10 bg-white rounded-xl shadow-sm border border-gray-100 p-8">
            <h2 className="text-xl font-bold text-sportify-dark mb-4 border-b pb-2"><i className="bi bi-file-earmark-pdf-fill text-red-600 mr-2"></i>Generación de Reportes PDF</h2>
            <p className="text-gray-600 mb-6">Descarga los reportes consolidados del sistema en formato PDF generados dinámicamente con QuestPDF.</p>
            
            <div className="flex flex-wrap gap-4">
              <button 
                onClick={() => handleDownloadReport('members')}
                className="bg-sportify-dark hover:bg-black text-white px-6 py-3 rounded-lg font-semibold shadow-sm transition-colors flex items-center"
              >
                <i className="bi bi-cloud-download mr-2"></i> Reporte de Miembros
              </button>
              
              <button 
                onClick={() => handleDownloadReport('payments')}
                className="bg-sportify-primary hover:bg-red-700 text-white px-6 py-3 rounded-lg font-semibold shadow-sm transition-colors flex items-center"
              >
                <i className="bi bi-cloud-download mr-2"></i> Reporte de Pagos
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
