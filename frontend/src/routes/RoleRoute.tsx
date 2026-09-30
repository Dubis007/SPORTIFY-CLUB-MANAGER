import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

interface RoleRouteProps {
  roles: string[];
}

export const RoleRoute: React.FC<RoleRouteProps> = ({ roles }) => {
  const { user } = useAuth();
  
  if (!user || !roles.includes(user.rol)) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
};
