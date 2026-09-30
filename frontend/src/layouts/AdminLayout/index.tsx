import React from 'react';
import { Outlet, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function AdminLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-sportify-light flex flex-col">
      {/* Navbar Superior */}
      <nav className="bg-white shadow-sm border-b-4 border-sportify-secondary">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <i className="bi bi-shield-lock-fill text-sportify-primary text-2xl mr-2"></i>
              <span className="font-bold text-sportify-dark text-xl tracking-tight">SPORTIFY ADMIN</span>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600 font-medium">
                <i className="bi bi-person-circle mr-1"></i> {user?.nombre || 'Administrador'}
              </span>
              <button 
                onClick={handleLogout}
                className="text-sportify-primary hover:text-red-800 text-sm font-semibold transition-colors"
              >
                <i className="bi bi-box-arrow-right mr-1"></i> Salir
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="flex-1 flex max-w-7xl w-full mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {/* Sidebar Menú Lateral */}
        <aside className="w-64 flex-shrink-0 pr-8 hidden md:block">
          <nav className="space-y-2">
            <Link to="/admin/dashboard" className="flex items-center px-4 py-3 bg-white text-sportify-dark rounded-lg hover:bg-gray-50 transition-colors shadow-sm font-semibold border-l-4 border-transparent hover:border-sportify-primary">
              <i className="bi bi-house-door mr-3 text-lg text-gray-400"></i>
              Dashboard
            </Link>
            <Link to="/admin/users" className="flex items-center px-4 py-3 bg-white text-sportify-dark rounded-lg hover:bg-gray-50 transition-colors shadow-sm font-semibold border-l-4 border-transparent hover:border-sportify-primary">
              <i className="bi bi-people mr-3 text-lg text-gray-400"></i>
              Gestión Usuarios
            </Link>
            <Link to="/admin/memberships" className="flex items-center px-4 py-3 bg-white text-sportify-dark rounded-lg hover:bg-gray-50 transition-colors shadow-sm font-semibold border-l-4 border-transparent hover:border-sportify-primary">
              <i className="bi bi-card-checklist mr-3 text-lg text-gray-400"></i>
              Membresías
            </Link>
            <Link to="/admin/competitions" className="flex items-center px-4 py-3 bg-white text-sportify-dark rounded-lg hover:bg-gray-50 transition-colors shadow-sm font-semibold border-l-4 border-transparent hover:border-sportify-primary">
              <i className="bi bi-trophy mr-3 text-lg text-gray-400"></i>
              Competencias
            </Link>
            <Link to="/admin/trainings" className="flex items-center px-4 py-3 bg-white text-sportify-dark rounded-lg hover:bg-gray-50 transition-colors shadow-sm font-semibold border-l-4 border-transparent hover:border-sportify-primary">
              <i className="bi bi-stopwatch mr-3 text-lg text-gray-400"></i>
              Entrenamientos
            </Link>
            <Link to="/admin/registrations" className="flex items-center px-4 py-3 bg-white text-sportify-dark rounded-lg hover:bg-gray-50 transition-colors shadow-sm font-semibold border-l-4 border-transparent hover:border-sportify-primary">
              <i className="bi bi-person-check mr-3 text-lg text-gray-400"></i>
              Inscripciones
            </Link>
            <Link to="/admin/evaluations" className="flex items-center px-4 py-3 bg-white text-sportify-dark rounded-lg hover:bg-gray-50 transition-colors shadow-sm font-semibold border-l-4 border-transparent hover:border-sportify-primary">
              <i className="bi bi-star-fill mr-3 text-lg text-gray-400"></i>
              Observaciones
            </Link>
            <Link to="/admin/locations" className="flex items-center px-4 py-3 bg-white text-sportify-dark rounded-lg hover:bg-gray-50 transition-colors shadow-sm font-semibold border-l-4 border-transparent hover:border-sportify-primary">
              <i className="bi bi-building mr-3 text-lg text-gray-400"></i>
              Sedes
            </Link>
            <Link to="/admin/plans" className="flex items-center px-4 py-3 bg-white text-sportify-dark rounded-lg hover:bg-gray-50 transition-colors shadow-sm font-semibold border-l-4 border-transparent hover:border-sportify-primary">
              <i className="bi bi-tags mr-3 text-lg text-gray-400"></i>
              Planes Membresía
            </Link>
            <Link to="/admin/payments" className="flex items-center px-4 py-3 bg-white text-sportify-dark rounded-lg hover:bg-gray-50 transition-colors shadow-sm font-semibold border-l-4 border-transparent hover:border-sportify-primary">
              <i className="bi bi-currency-dollar mr-3 text-lg text-gray-400"></i>
              Pagos Financieros
            </Link>
          </nav>
        </aside>

        {/* Contenido Principal */}
        <main className="flex-1 bg-white rounded-[20px] shadow-[0_10px_30px_rgba(0,0,0,0.05)] p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
