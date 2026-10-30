import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import UsersPage from './UsersPage';
import { userService } from '../../services/users/userService';
import { locationService } from '../../services/api/locationService';
import { buildUsersExcelCsv } from '../../viewmodels/useUsersViewModel';
import { UserRole } from '../../models';

vi.mock('../../services/users/userService', () => ({
  userService: {
    getAllUsers: vi.fn(),
    createUser: vi.fn(),
    updateUser: vi.fn(),
    updateUserStatus: vi.fn(),
    resetPassword: vi.fn(),
    deleteUser: vi.fn(),
  },
}));

vi.mock('../../services/api/locationService', () => ({
  locationService: {
    getAll: vi.fn(),
  },
}));

const sampleUsers = [
  {
    id: 1,
    nombre: 'Ana',
    apellido: 'Administradora',
    correo: 'admin@sportify.com',
    activo: true,
    roles: ['ADMIN'],
    rol: UserRole.ADMIN,
    sedeId: 1,
    sedeNombre: 'Sede Norte',
    creadoEn: '2026-09-01T10:00:00Z',
  },
  {
    id: 2,
    nombre: 'Carlos',
    apellido: 'Contador',
    correo: 'contador@sportify.com',
    activo: true,
    roles: ['CONTADOR'],
    rol: UserRole.CONTADOR,
    sedeId: 1,
    sedeNombre: 'Sede Norte',
    creadoEn: '2026-09-02T10:00:00Z',
  },
  {
    id: 3,
    nombre: 'Elena',
    apellido: 'Entrenadora',
    correo: 'coach@sportify.com',
    activo: true,
    roles: ['ENTRENADOR'],
    rol: UserRole.ENTRENADOR,
    sedeId: 2,
    sedeNombre: 'Sede Sur',
    creadoEn: '2026-09-03T10:00:00Z',
  },
  {
    id: 4,
    nombre: 'Mario',
    apellido: 'Gómez',
    correo: 'mario@sportify.com',
    activo: true,
    roles: ['MIEMBRO'],
    rol: UserRole.MIEMBRO,
    sedeId: 1,
    sedeNombre: 'Sede Norte',
    creadoEn: '2026-09-05T10:00:00Z',
  },
  {
    id: 5,
    nombre: 'Lucía',
    apellido: 'Peña',
    correo: 'lucia@sportify.com',
    activo: false,
    roles: ['MIEMBRO'],
    rol: UserRole.MIEMBRO,
    sedeId: 2,
    sedeNombre: 'Sede Sur',
    creadoEn: '2026-09-06T10:00:00Z',
  },
];

describe('UsersPage & Directory Excel Export (TAREA-P2-06B)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(userService.getAllUsers).mockResolvedValue(sampleUsers as any);
    vi.mocked(locationService.getAll).mockResolvedValue([
      { id: 1, nombre: 'Sede Norte', direccion: 'Calle 100', ciudad: 'Bogotá', activo: true },
      { id: 2, nombre: 'Sede Sur', direccion: 'Cra 30', ciudad: 'Bogotá', activo: true },
    ]);
  });

  it('renderiza contadores exactos por rol y separa deportistas activos vs inactivos', async () => {
    render(<UsersPage />);

    await waitFor(() => {
      expect(screen.getByText('Mario Gómez')).toBeInTheDocument();
    });

    expect(screen.getByTestId('counter-total')).toHaveTextContent('5');
    expect(screen.getByTestId('counter-total')).toHaveTextContent('4 activas · 1 inactivas');
    expect(screen.getByTestId('counter-miembros')).toHaveTextContent('2');
    expect(screen.getByTestId('counter-miembros')).toHaveTextContent('1 activos · 1 inactivos');
    expect(screen.getByTestId('counter-entrenadores')).toHaveTextContent('1');
    expect(screen.getByTestId('counter-contadores')).toHaveTextContent('1');
    expect(screen.getByTestId('counter-admins')).toHaveTextContent('1');
  });

  it('permite combinar filtros de rol, estado, sede y búsqueda textual', async () => {
    render(<UsersPage />);

    await waitFor(() => {
      expect(screen.getByText('Mario Gómez')).toBeInTheDocument();
    });

    fireEvent.change(screen.getByLabelText('Filtrar por rol'), {
      target: { value: UserRole.MIEMBRO },
    });
    expect(screen.getByText('Mario Gómez')).toBeInTheDocument();
    expect(screen.getByText('Lucía Peña')).toBeInTheDocument();
    expect(screen.queryByText('Ana Administradora')).not.toBeInTheDocument();

    fireEvent.change(screen.getByLabelText('Filtrar por estado'), {
      target: { value: 'INACTIVE' },
    });
    expect(screen.queryByText('Mario Gómez')).not.toBeInTheDocument();
    expect(screen.getByText('Lucía Peña')).toBeInTheDocument();

    fireEvent.click(screen.getByText('Restablecer filtros'));
    expect(screen.getByText('Ana Administradora')).toBeInTheDocument();
    expect(screen.getByText('Mario Gómez')).toBeInTheDocument();
  });

  it('genera y descarga CSV con BOM UTF-8 compatible con Microsoft Excel en español', async () => {
    const csv = buildUsersExcelCsv(sampleUsers as any);
    expect(csv.startsWith('\uFEFF')).toBe(true);
    expect(csv).toContain('ID;Nombre;Apellido;Correo Electrónico;Rol;Estado;Sede;Fecha Registro');
    expect(csv).toContain('4;Mario;Gómez;mario@sportify.com;MIEMBRO;Activo;Sede Norte;2026-09-05');
    expect(csv).toContain('5;Lucía;Peña;lucia@sportify.com;MIEMBRO;Inactivo;Sede Sur;2026-09-06');

    const createObjectUrlSpy = vi.fn(() => 'blob:mock-excel-url');
    const revokeObjectUrlSpy = vi.fn();
    Object.defineProperty(window.URL, 'createObjectURL', {
      value: createObjectUrlSpy,
      writable: true,
    });
    Object.defineProperty(window.URL, 'revokeObjectURL', {
      value: revokeObjectUrlSpy,
      writable: true,
    });
    const clickSpy = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {});

    render(<UsersPage />);
    await waitFor(() => {
      expect(screen.getByText('Mario Gómez')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Exportar Excel (.csv)'));

    expect(createObjectUrlSpy).toHaveBeenCalledTimes(1);
    expect(clickSpy).toHaveBeenCalledTimes(1);
    expect(revokeObjectUrlSpy).toHaveBeenCalledWith('blob:mock-excel-url');
    clickSpy.mockRestore();
  });
});
