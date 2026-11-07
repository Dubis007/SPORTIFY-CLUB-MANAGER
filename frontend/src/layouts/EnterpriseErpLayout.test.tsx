import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import AdminLayout from './AdminLayout';
import AccountantLayout from './AccountantLayout';
import CoachLayout from './CoachLayout';
import MemberLayout from './MemberLayout';
import { UserRole } from '../models';
import { microserviceClient } from '../services/api/microserviceClient';

let mockCurrentUser: {
  id: number;
  nombre: string;
  apellido: string;
  correo: string;
  rol: UserRole;
  activo: boolean;
} | null = null;

const mockLogout = vi.fn();

vi.mock('../context/AuthContext', () => ({
  useAuth: () => ({
    user: mockCurrentUser,
    token: 'mock-jwt-token',
    isAuthenticated: !!mockCurrentUser,
    login: vi.fn(),
    logout: mockLogout,
  }),
}));

vi.mock('../services/api/microserviceClient', () => ({
  microserviceClient: {
    checkEcosystemHealth: vi.fn(),
    auditSession: vi.fn(),
  },
}));

describe('EnterpriseErpLayout — Interfaces Independientes Centradas por Rol', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(microserviceClient.checkEcosystemHealth).mockResolvedValue({
      coreApi: { online: true, status: 'Healthy', latencyMs: 12 },
      ms1Auth: { online: true, status: 'Healthy', activeSessions: 1, port: 5101 },
      ms2Reports: { online: true, status: 'Healthy', engine: 'Zod', port: 5102 },
      checkedAt: '2026-11-07T10:00:00Z',
    });
    vi.mocked(microserviceClient.auditSession).mockResolvedValue({
      userId: '1',
      email: 'admin@sportify.com',
      role: 'ADMIN',
      activeSessionCount: 1,
      revokedSessionsCount: 0,
      revokedSessionIds: [],
      coreApiReachable: true,
      auditedAt: '2026-11-07T10:00:00Z',
    });
  });

  it('muestra telemetría de servicios y sesiones únicamente para el rol ADMIN sin selector de suplantación', async () => {
    mockCurrentUser = {
      id: 1,
      nombre: 'Ana',
      apellido: 'Admin',
      correo: 'admin@sportify.com',
      rol: UserRole.ADMIN,
      activo: true,
    };

    render(
      <MemoryRouter initialEntries={['/admin/dashboard']}>
        <Routes>
          <Route element={<AdminLayout />}>
            <Route path="/admin/dashboard" element={<div>Contenido Admin</div>} />
          </Route>
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(microserviceClient.checkEcosystemHealth).toHaveBeenCalledTimes(1);
    });

    expect(screen.getByTestId('admin-nodes-health')).toBeInTheDocument();
    expect(screen.getByTestId('admin-session-telemetry')).toBeInTheDocument();
    expect(screen.getByText('Dashboard Ejecutivo')).toBeInTheDocument();
    expect(screen.queryByRole('combobox')).not.toBeInTheDocument();
  });

  it('oculta telemetría técnica y expone solo herramientas contables con pestañas activas para CONTADOR', () => {
    mockCurrentUser = {
      id: 2,
      nombre: 'Carlos',
      apellido: 'Contador',
      correo: 'contador@sportify.com',
      rol: UserRole.CONTADOR,
      activo: true,
    };

    render(
      <MemoryRouter initialEntries={['/accountant/dashboard?tab=manual']}>
        <Routes>
          <Route element={<AccountantLayout />}>
            <Route path="/accountant/dashboard" element={<div>Vista Contable</div>} />
          </Route>
        </Routes>
      </MemoryRouter>
    );

    expect(microserviceClient.checkEcosystemHealth).not.toHaveBeenCalled();
    expect(screen.queryByTestId('admin-nodes-health')).not.toBeInTheDocument();
    expect(screen.queryByTestId('admin-session-telemetry')).not.toBeInTheDocument();

    expect(screen.getByText('Sesión activa')).toBeInTheDocument();
    expect(screen.getByText('Auditoría de Pagos')).toBeInTheDocument();
    expect(screen.queryByText('Sedes e Instalaciones')).not.toBeInTheDocument();

    const manualLink = screen.getByRole('link', { name: /Registrar Pago Manual/i });
    const pagosLink = screen.getByRole('link', { name: /Auditoría de Pagos/i });
    expect(manualLink.className).toContain('border-blue-500');
    expect(pagosLink.className).toContain('border-transparent');
  });

  it('aísla las vistas de ENTRENADOR y MIEMBRO mostrando exclusivamente sus opciones necesarias', () => {
    mockCurrentUser = {
      id: 3,
      nombre: 'Elena',
      apellido: 'Coach',
      correo: 'entrenador@sportify.com',
      rol: UserRole.ENTRENADOR,
      activo: true,
    };

    const { unmount } = render(
      <MemoryRouter initialEntries={['/coach/dashboard']}>
        <Routes>
          <Route element={<CoachLayout />}>
            <Route path="/coach/dashboard" element={<div>Vista Coach</div>} />
          </Route>
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText('Entrenamientos y Asistencia')).toBeInTheDocument();
    expect(screen.queryByText('Pagos Financieros')).not.toBeInTheDocument();
    expect(screen.queryByTestId('admin-nodes-health')).not.toBeInTheDocument();
    unmount();

    mockCurrentUser = {
      id: 4,
      nombre: 'Mario',
      apellido: 'Miembro',
      correo: 'miembro@sportify.com',
      rol: UserRole.MIEMBRO,
      activo: true,
    };

    render(
      <MemoryRouter initialEntries={['/member/dashboard?tab=membresias']}>
        <Routes>
          <Route element={<MemberLayout />}>
            <Route path="/member/dashboard" element={<div>Vista Miembro</div>} />
          </Route>
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText('Membresías y Pagos')).toBeInTheDocument();
    expect(screen.getByText('Mis Actividades y Torneos')).toBeInTheDocument();
    expect(screen.queryByText('Gestión Usuarios')).not.toBeInTheDocument();
    expect(screen.queryByTestId('admin-session-telemetry')).not.toBeInTheDocument();
  });
});
