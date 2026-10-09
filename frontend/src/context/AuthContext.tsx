import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { User } from '../models';
import { setUnauthorizedHandler } from '../services/api/apiClient';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (token: string, user: User) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Se lee al crear el estado (no en un useEffect) para que ProtectedRoute vea la sesión
// desde el primer render y no mande a /login al recargar una página protegida.
const readStoredSession = (): { token: string | null; user: User | null } => {
  const storedToken = localStorage.getItem('token');
  const storedUser = localStorage.getItem('user');

  if (storedToken && storedUser) {
    try {
      return { token: storedToken, user: JSON.parse(storedUser) };
    } catch (e) {
      console.error("Failed to parse user from localStorage", e);
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
  }
  return { token: null, user: null };
};

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => readStoredSession().user);
  const [token, setToken] = useState<string | null>(() => readStoredSession().token);
  const navigate = useNavigate();

  const login = (newToken: string, newUser: User) => {
    setToken(newToken);
    setUser(newUser);
    localStorage.setItem('token', newToken);
    localStorage.setItem('user', JSON.stringify(newUser));
  };

  const logout = useCallback(() => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }, []);

  // 401 en cualquier petición autenticada: cerrar sesión y volver al login sin recargar
  useEffect(() => {
    setUnauthorizedHandler(() => {
      logout();
      navigate('/login', { replace: true });
      toast('Tu sesión expiró. Inicia sesión de nuevo.', { id: 'session-expired', icon: '🔒' });
    });
    return () => setUnauthorizedHandler(null);
  }, [logout, navigate]);

  return (
    <AuthContext.Provider value={{ user, token, isAuthenticated: !!token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
