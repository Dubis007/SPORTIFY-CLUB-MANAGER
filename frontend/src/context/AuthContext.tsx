import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { User } from '../models';
import { setUnauthorizedHandler } from '../services/api/apiClient';
import {
  clearStoredCsrfToken,
  getStoredCsrfToken,
  isJwtTokenValid,
  setStoredCsrfToken,
} from '../utils/csrfTokenManager';

interface AuthContextType {
  user: User | null;
  token: string | null;
  csrfToken: string | null;
  isAuthenticated: boolean;
  login: (token: string, user: User, csrfToken?: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Se lee al crear el estado (no en un useEffect) para que ProtectedRoute vea la sesión
// desde el primer render y no mande a /login al recargar una página protegida.
const readStoredSession = (): {
  token: string | null;
  user: User | null;
  csrfToken: string | null;
} => {
  const storedToken = localStorage.getItem('token');
  const storedUser = localStorage.getItem('user');
  const storedCsrf = getStoredCsrfToken();

  if (storedToken && storedUser && isJwtTokenValid(storedToken)) {
    try {
      return { token: storedToken, user: JSON.parse(storedUser), csrfToken: storedCsrf };
    } catch (e) {
      console.error('Failed to parse user from localStorage', e);
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      clearStoredCsrfToken();
    }
  }
  return { token: null, user: null, csrfToken: null };
};

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => readStoredSession().user);
  const [token, setToken] = useState<string | null>(() => readStoredSession().token);
  const [csrfToken, setCsrfToken] = useState<string | null>(() => readStoredSession().csrfToken);
  const navigate = useNavigate();

  const login = (newToken: string, newUser: User, newCsrfToken?: string) => {
    setToken(newToken);
    setUser(newUser);
    localStorage.setItem('token', newToken);
    localStorage.setItem('user', JSON.stringify(newUser));
    if (newCsrfToken) {
      setCsrfToken(newCsrfToken);
      setStoredCsrfToken(newCsrfToken);
    }
  };

  const logout = useCallback(() => {
    setToken(null);
    setUser(null);
    setCsrfToken(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    clearStoredCsrfToken();
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
    <AuthContext.Provider
      value={{
        user,
        token,
        csrfToken,
        isAuthenticated: !!token && isJwtTokenValid(token),
        login,
        logout,
      }}
    >
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
