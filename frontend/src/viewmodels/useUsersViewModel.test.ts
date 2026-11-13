import { renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useUsersViewModel } from './useUsersViewModel';
import { userService } from '../services/users/userService';
import { locationService } from '../services/api/locationService';

let mockRol = 'ADMIN';

vi.mock('../context/AuthContext', () => ({
  useAuth: () => ({
    user: { id: 1, nombre: 'Sesión', apellido: 'Activa', correo: 'sesion@sportify.com', activo: true, rol: mockRol },
  }),
}));

vi.mock('../services/users/userService', () => ({
  userService: { getAllUsers: vi.fn() },
}));

vi.mock('../services/api/locationService', () => ({
  locationService: { getAll: vi.fn() },
}));

const usuarios = [
  { id: 4, nombre: 'Mario', apellido: 'Miembro', correo: 'miembro@sportify.com', activo: true, roles: ['MIEMBRO'] },
  { id: 3, nombre: 'Elena', apellido: 'Entrenadora', correo: 'entrenador@sportify.com', activo: true, roles: ['ENTRENADOR'] },
];

describe('useUsersViewModel — consulta de sedes según el rol de la sesión', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(userService.getAllUsers).mockResolvedValue(usuarios as never);
    vi.mocked(locationService.getAll).mockResolvedValue([
      { id: 1, nombre: 'Sede Principal Norte', direccion: 'Calle 1', ciudad: 'Bogotá', activo: true },
    ]);
  });

  it('el CONTADOR carga los usuarios sin pedir las sedes, que la API le niega con 403', async () => {
    mockRol = 'CONTADOR';

    const { result } = renderHook(() => useUsersViewModel());

    await waitFor(() => expect(result.current.users).toHaveLength(2));
    expect(locationService.getAll).not.toHaveBeenCalled();
    expect(result.current.locations).toEqual([]);
    expect(result.current.error).toBeNull();
  });

  it('el ADMIN carga los usuarios junto con las sedes para el filtro y la exportación', async () => {
    mockRol = 'ADMIN';

    const { result } = renderHook(() => useUsersViewModel());

    await waitFor(() => expect(result.current.locations).toHaveLength(1));
    expect(locationService.getAll).toHaveBeenCalledTimes(1);
    expect(result.current.users).toHaveLength(2);
    expect(result.current.locationsMap.get(1)).toBe('Sede Principal Norte');
  });
});
