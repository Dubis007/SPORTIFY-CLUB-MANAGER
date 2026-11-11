import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export const ProtectedRoute = () => {
  const { isAuthenticated, token, user } = useAuth();

  if (!isAuthenticated || !token || !user) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
};
