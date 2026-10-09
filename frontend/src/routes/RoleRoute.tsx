import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { UserRole } from '../models';

interface RoleRouteProps {
  roles: UserRole[];
}

export const RoleRoute: React.FC<RoleRouteProps> = ({ roles }) => {
  const { user } = useAuth();

  if (!user || !roles.includes(user.rol)) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
};
