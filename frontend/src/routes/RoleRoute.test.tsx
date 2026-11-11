import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import { UserRole } from '../models';
import { ProtectedRoute } from './ProtectedRoute';
import { AdminRouteGuard, RoleRoute } from './RoleRoute';

const mockUseAuth = vi.fn();

vi.mock('../context/AuthContext', () => ({
  useAuth: () => mockUseAuth(),
}));

describe('Control de Acceso y Route Guards (ProtectedRoute, RoleRoute y AdminRouteGuard)', () => {
  it('bloquea a un usuario normal (MIEMBRO) cuando intenta entrar a /admin/dashboard y lo redirige a /member/dashboard', () => {
    mockUseAuth.mockReturnValue({
      isAuthenticated: true,
      token: 'jwt-member-token',
      user: {
        id: 4,
        nombre: 'Mario',
        apellido: 'Miembro',
        correo: 'miembro@sportify.com',
        rol: UserRole.MIEMBRO,
      },
    });

    render(
      <MemoryRouter initialEntries={['/admin/dashboard']}>
        <Routes>
          <Route element={<ProtectedRoute />}>
            <Route element={<AdminRouteGuard />}>
              <Route path="/admin/dashboard" element={<div>Panel Secreto Admin</div>} />
            </Route>
            <Route element={<RoleRoute roles={[UserRole.MIEMBRO]} />}>
              <Route path="/member/dashboard" element={<div>Portal de Miembro</div>} />
            </Route>
          </Route>
        </Routes>
      </MemoryRouter>
    );

    expect(screen.queryByText('Panel Secreto Admin')).not.toBeInTheDocument();
    expect(screen.getByText('Portal de Miembro')).toBeInTheDocument();
  });

  it('redirige a /login cuando un visitante no autenticado intenta abrir una ruta privada', () => {
    mockUseAuth.mockReturnValue({
      isAuthenticated: false,
      token: null,
      user: null,
    });

    render(
      <MemoryRouter initialEntries={['/admin/users']}>
        <Routes>
          <Route path="/login" element={<div>Pantalla Login</div>} />
          <Route element={<ProtectedRoute />}>
            <Route element={<AdminRouteGuard />}>
              <Route path="/admin/users" element={<div>Gestión de Usuarios</div>} />
            </Route>
          </Route>
        </Routes>
      </MemoryRouter>
    );

    expect(screen.queryByText('Gestión de Usuarios')).not.toBeInTheDocument();
    expect(screen.getByText('Pantalla Login')).toBeInTheDocument();
  });

  it('permite el acceso al panel de administración cuando el usuario tiene rol ADMIN o Admin', () => {
    mockUseAuth.mockReturnValue({
      isAuthenticated: true,
      token: 'jwt-admin-token',
      user: {
        id: 1,
        nombre: 'Admin',
        apellido: 'Sportify',
        correo: 'admin@sportify.com',
        rol: UserRole.ADMIN,
      },
    });

    render(
      <MemoryRouter initialEntries={['/admin/dashboard']}>
        <Routes>
          <Route element={<ProtectedRoute />}>
            <Route element={<AdminRouteGuard />}>
              <Route path="/admin/dashboard" element={<div>Panel Secreto Admin</div>} />
            </Route>
          </Route>
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText('Panel Secreto Admin')).toBeInTheDocument();
  });
});
