import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ROLE_HOME_ROUTES, UserRole } from '../models';

interface RoleRouteProps {
  roles: (UserRole | string)[];
}

export const RoleRoute: React.FC<RoleRouteProps> = ({ roles }) => {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  const normalizedUserRole = String(user.rol ?? '').toUpperCase();
  const normalizedAllowedRoles = roles.map((r) => String(r).toUpperCase());

  if (!normalizedAllowedRoles.includes(normalizedUserRole)) {
    const safeHome =
      ROLE_HOME_ROUTES[normalizedUserRole as UserRole] ??
      ROLE_HOME_ROUTES[UserRole.MIEMBRO];
    return <Navigate to={safeHome} replace />;
  }

  return <Outlet />;
};

/**
 * Guard específico para proteger el panel administrativo frente a usuarios normales (MIEMBRO, ENTRENADOR, CONTADOR).
 */
export const AdminRouteGuard: React.FC = () => (
  <RoleRoute roles={[UserRole.ADMIN, 'Admin']} />
);
