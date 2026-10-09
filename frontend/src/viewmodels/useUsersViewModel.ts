import { useState, useEffect, useCallback } from 'react';
import { userService, CreateUserDto, UpdateUserDto } from '../services/users/userService';
import { User, UserRole } from '../models';

export const useUsersViewModel = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await userService.getAllUsers();
      // El backend de /api/users retorna "roles" como array, pero nuestro modelo usa "rol" como string
      const mappedData = data.map((u: any) => ({
        ...u,
        rol: u.roles && u.roles.length > 0 ? u.roles[0] : (u.rol || UserRole.MIEMBRO)
      }));
      setUsers(mappedData);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al obtener usuarios');
    } finally {
      setLoading(false);
    }
  }, []);

  const createUser = async (data: CreateUserDto) => {
    try {
      const res = await userService.createUser(data);
      const newUser = { ...res, rol: (res as any).roles?.[0] || UserRole.MIEMBRO };
      setUsers(prev => [...prev, newUser]);
      return true;
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al crear usuario');
      return false;
    }
  };

  const updateUser = async (id: number, data: UpdateUserDto) => {
    try {
      const res = await userService.updateUser(id, data);
      const updatedUser = { ...res, rol: (res as any).roles?.[0] || UserRole.MIEMBRO };
      setUsers(prev => prev.map(u => u.id === id ? updatedUser : u));
      return true;
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al actualizar usuario');
      return false;
    }
  };

  const toggleUserStatus = async (id: number, currentStatus: boolean) => {
    try {
      await userService.updateUserStatus(id, !currentStatus);
      setUsers(prev => prev.map(u => u.id === id ? { ...u, activo: !currentStatus } : u));
      return true;
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al actualizar estado del usuario');
      return false;
    }
  };

  const resetPassword = async (id: number) => {
    try {
      await userService.resetPassword(id);
      setUsers(prev => prev.map(u => u.id === id ? { ...u, solicitaCambioClave: false } : u));
      return true;
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al restablecer la contraseña');
      return false;
    }
  };

  const deleteUser = async (id: number) => {
    try {
      await userService.deleteUser(id);
      setUsers(prev => prev.filter(u => u.id !== id));
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
    loading,
    error,
    fetchUsers,
    createUser,
    updateUser,
    toggleUserStatus,
    resetPassword,
    deleteUser
  };
};
