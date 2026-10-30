import { useState, useEffect, useCallback, useMemo } from 'react';
import { userService, CreateUserDto, UpdateUserDto } from '../services/users/userService';
import { locationService, LocationDto } from '../services/api/locationService';
import { User, UserRole } from '../models';

export type UserRoleFilter = 'ALL' | UserRole;
export type UserStatusFilter = 'ALL' | 'ACTIVE' | 'INACTIVE';

export interface UserDirectoryCounters {
  totalUsuarios: number;
  usuariosActivos: number;
  usuariosInactivos: number;
  miembrosTotal: number;
  miembrosActivos: number;
  miembrosInactivos: number;
  entrenadores: number;
  contadores: number;
  administradores: number;
}

function escapeCsvCell(value: string | number | boolean | null | undefined): string {
  const raw = value === null || value === undefined ? '' : String(value);
  if (raw.includes(';') || raw.includes('"') || raw.includes('\n') || raw.includes('\r')) {
    return `"${raw.replace(/"/g, '""')}"`;
  }
  return raw;
}

/**
 * Construye contenido CSV codificado con BOM UTF-8 (\uFEFF) y delimitador ';'
 * para apertura directa en Microsoft Excel en español conservando tildes y eñes (VID1-RF-013).
 */
export function buildUsersExcelCsv(rows: User[], locationsMap?: Map<number, string>): string {
  const header = [
    'ID',
    'Nombre',
    'Apellido',
    'Correo Electrónico',
    'Rol',
    'Estado',
    'Sede',
    'Fecha Registro',
  ].join(';');

  const lines = rows.map((u) => {
    const sedeLabel =
      u.sedeNombre ||
      (u.sedeId && locationsMap?.get(u.sedeId)) ||
      'Sin sede asignada';
    const fechaLabel = u.creadoEn ? u.creadoEn.slice(0, 10) : '';

    return [
      escapeCsvCell(u.id),
      escapeCsvCell(u.nombre),
      escapeCsvCell(u.apellido),
      escapeCsvCell(u.correo),
      escapeCsvCell(u.rol),
      escapeCsvCell(u.activo ? 'Activo' : 'Inactivo'),
      escapeCsvCell(sedeLabel),
      escapeCsvCell(fechaLabel),
    ].join(';');
  });

  return `\uFEFF${[header, ...lines].join('\r\n')}`;
}

export const useUsersViewModel = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [locations, setLocations] = useState<LocationDto[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Filtros combinables (VID1-RF-013 / VID2-RF-002)
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [roleFilter, setRoleFilter] = useState<UserRoleFilter>('ALL');
  const [statusFilter, setStatusFilter] = useState<UserStatusFilter>('ALL');
  const [sedeFilter, setSedeFilter] = useState<string>('ALL');

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [usersData, locationsData] = await Promise.all([
        userService.getAllUsers(),
        locationService.getAll().catch(() => [] as LocationDto[]),
      ]);

      const mappedData: User[] = usersData.map((u: any) => ({
        ...u,
        rol: u.roles && u.roles.length > 0 ? u.roles[0] : (u.rol || UserRole.MIEMBRO),
      }));
      setUsers(mappedData);
      setLocations(locationsData);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al obtener usuarios');
    } finally {
      setLoading(false);
    }
  }, []);

  const locationsMap = useMemo(() => {
    const map = new Map<number, string>();
    for (const loc of locations) {
      map.set(loc.id, loc.nombre);
    }
    return map;
  }, [locations]);

  const counters = useMemo<UserDirectoryCounters>(() => {
    let usuariosActivos = 0;
    let miembrosTotal = 0;
    let miembrosActivos = 0;
    let entrenadores = 0;
    let contadores = 0;
    let administradores = 0;

    for (const u of users) {
      if (u.activo) usuariosActivos += 1;

      if (u.rol === UserRole.MIEMBRO) {
        miembrosTotal += 1;
        if (u.activo) miembrosActivos += 1;
      } else if (u.rol === UserRole.ENTRENADOR) {
        entrenadores += 1;
      } else if (u.rol === UserRole.CONTADOR) {
        contadores += 1;
      } else if (u.rol === UserRole.ADMIN) {
        administradores += 1;
      }
    }

    return {
      totalUsuarios: users.length,
      usuariosActivos,
      usuariosInactivos: users.length - usuariosActivos,
      miembrosTotal,
      miembrosActivos,
      miembrosInactivos: miembrosTotal - miembrosActivos,
      entrenadores,
      contadores,
      administradores,
    };
  }, [users]);

  const filteredUsers = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase();

    return users.filter((u) => {
      if (roleFilter !== 'ALL' && u.rol !== roleFilter) {
        return false;
      }
      if (statusFilter === 'ACTIVE' && !u.activo) {
        return false;
      }
      if (statusFilter === 'INACTIVE' && u.activo) {
        return false;
      }
      if (sedeFilter === 'UNASSIGNED') {
        if (u.sedeId) return false;
      } else if (sedeFilter !== 'ALL') {
        if (String(u.sedeId ?? '') !== sedeFilter) return false;
      }

      if (normalizedQuery) {
        const fullName = `${u.nombre} ${u.apellido}`.toLowerCase();
        const email = (u.correo || '').toLowerCase();
        const sedeName = (u.sedeNombre || (u.sedeId ? locationsMap.get(u.sedeId) : '') || '').toLowerCase();
        if (
          !fullName.includes(normalizedQuery) &&
          !email.includes(normalizedQuery) &&
          !sedeName.includes(normalizedQuery)
        ) {
          return false;
        }
      }

      return true;
    });
  }, [users, searchQuery, roleFilter, statusFilter, sedeFilter, locationsMap]);

  const hasActiveFilters =
    searchQuery.trim() !== '' ||
    roleFilter !== 'ALL' ||
    statusFilter !== 'ALL' ||
    sedeFilter !== 'ALL';

  const clearFilters = useCallback(() => {
    setSearchQuery('');
    setRoleFilter('ALL');
    setStatusFilter('ALL');
    setSedeFilter('ALL');
  }, []);

  const exportFilteredToExcelCsv = useCallback(() => {
    const csvContent = buildUsersExcelCsv(filteredUsers, locationsMap);
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    const dateStamp = new Date().toISOString().slice(0, 10);
    link.href = url;
    link.setAttribute('download', `Directorio_Usuarios_Sportify_${dateStamp}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
    return csvContent;
  }, [filteredUsers, locationsMap]);

  const createUser = async (data: CreateUserDto) => {
    try {
      const res = await userService.createUser(data);
      const newUser: User = {
        ...res,
        rol: (res as any).roles?.[0] || res.rol || UserRole.MIEMBRO,
        sedeNombre: res.sedeNombre ?? (res.sedeId ? locationsMap.get(res.sedeId) ?? null : null),
      };
      setUsers((prev) => [...prev, newUser]);
      return true;
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al crear usuario');
      return false;
    }
  };

  const updateUser = async (id: number, data: UpdateUserDto) => {
    try {
      const res = await userService.updateUser(id, data);
      const updatedUser: User = {
        ...res,
        rol: (res as any).roles?.[0] || res.rol || UserRole.MIEMBRO,
        sedeNombre: res.sedeNombre ?? (res.sedeId ? locationsMap.get(res.sedeId) ?? null : null),
      };
      setUsers((prev) => prev.map((u) => (u.id === id ? updatedUser : u)));
      return true;
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al actualizar usuario');
      return false;
    }
  };

  const toggleUserStatus = async (id: number, currentStatus: boolean) => {
    try {
      await userService.updateUserStatus(id, !currentStatus);
      setUsers((prev) => prev.map((u) => (u.id === id ? { ...u, activo: !currentStatus } : u)));
      return true;
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al actualizar estado del usuario');
      return false;
    }
  };

  const resetPassword = async (id: number) => {
    try {
      await userService.resetPassword(id);
      setUsers((prev) =>
        prev.map((u) => (u.id === id ? { ...u, solicitaCambioClave: false } : u))
      );
      return true;
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al restablecer la contraseña');
      return false;
    }
  };

  const deleteUser = async (id: number) => {
    try {
      await userService.deleteUser(id);
      setUsers((prev) => prev.filter((u) => u.id !== id));
      return true;
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al eliminar el usuario');
      return false;
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  return {
    users,
    filteredUsers,
    locations,
    locationsMap,
    counters,
    loading,
    error,
    searchQuery,
    setSearchQuery,
    roleFilter,
    setRoleFilter,
    statusFilter,
    setStatusFilter,
    sedeFilter,
    setSedeFilter,
    hasActiveFilters,
    clearFilters,
    exportFilteredToExcelCsv,
    fetchUsers,
    createUser,
    updateUser,
    toggleUserStatus,
    resetPassword,
    deleteUser,
  };
};
