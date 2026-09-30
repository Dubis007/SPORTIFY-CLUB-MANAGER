import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from '../pages/auth/LoginPage';
import { ProtectedRoute } from './ProtectedRoute';
import { RoleRoute } from './RoleRoute';
import { useAuth } from '../context/AuthContext';
import AdminLayout from '../layouts/AdminLayout';
import CompetitionsPage from '../pages/admin/CompetitionsPage';
import TrainingsPage from '../pages/admin/TrainingsPage';
import RegistrationsPage from '../pages/admin/RegistrationsPage';
import EvaluationsPage from '../pages/admin/EvaluationsPage';
import DashboardPage from '../pages/admin/DashboardPage';
import UsersPage from '../pages/admin/UsersPage';
import MembershipsPage from '../pages/admin/MembershipsPage';
import LocationsPage from '../pages/admin/LocationsPage';
import PlansPage from '../pages/admin/PlansPage';
import AdminPaymentsPage from '../pages/admin/AdminPaymentsPage';

import AccountantDashboard from '../pages/accountant/AccountantDashboard';

import AccountantLayout from '../layouts/AccountantLayout';

import CoachDashboard from '../pages/coach/CoachDashboard';
import CoachProfile from '../pages/coach/CoachProfile';
import CoachLayout from '../layouts/CoachLayout';

import MemberDashboard from '../pages/member/MemberDashboard';
import MemberLayout from '../layouts/MemberLayout';

import ForgotPasswordPage from '../pages/auth/ForgotPasswordPage';

export default function AppRoutes() {
  const { user, isAuthenticated } = useAuth();

  const getHomeRedirect = () => {
    if (!isAuthenticated || !user) return '/login';
    switch (user.rol) {
      case 'ADMIN': return '/admin/dashboard';
      case 'CONTADOR': return '/accountant/dashboard';
      case 'ENTRENADOR': return '/coach/dashboard';
      default: return '/member/dashboard';
    }
  };

  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/" element={<Navigate to={getHomeRedirect()} replace />} />

      <Route element={<ProtectedRoute />}>
        {/* Rutas Admin */}
        <Route element={<RoleRoute roles={['ADMIN']} />}>
          <Route element={<AdminLayout />}>
            <Route path="/admin/dashboard" element={<DashboardPage />} />
            <Route path="/admin/users" element={<UsersPage />} />
            <Route path="/admin/memberships" element={<MembershipsPage />} />
            <Route path="/admin/competitions" element={<CompetitionsPage />} />
            <Route path="/admin/trainings" element={<TrainingsPage />} />
            <Route path="/admin/registrations" element={<RegistrationsPage />} />
            <Route path="/admin/evaluations" element={<EvaluationsPage />} />
            <Route path="/admin/locations" element={<LocationsPage />} />
            <Route path="/admin/plans" element={<PlansPage />} />
            <Route path="/admin/payments" element={<AdminPaymentsPage />} />
          </Route>
        </Route>

        {/* Rutas Contador */}
        <Route element={<RoleRoute roles={['CONTADOR']} />}>
          <Route element={<AccountantLayout />}>
            <Route path="/accountant/dashboard" element={<AccountantDashboard />} />
          </Route>
        </Route>

        {/* Rutas Entrenador */}
        <Route element={<RoleRoute roles={['ENTRENADOR']} />}>
          <Route element={<CoachLayout />}>
            <Route path="/coach/dashboard" element={<CoachDashboard />} />
            <Route path="/coach/trainings" element={<TrainingsPage />} />
            <Route path="/coach/registrations" element={<RegistrationsPage />} />
            <Route path="/coach/evaluations" element={<EvaluationsPage />} />
            <Route path="/coach/profile" element={<CoachProfile />} />
          </Route>
        </Route>

        {/* Rutas Miembro */}
        <Route element={<RoleRoute roles={['MIEMBRO']} />}>
          <Route element={<MemberLayout />}>
            <Route path="/member/dashboard" element={<MemberDashboard />} />
          </Route>
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
