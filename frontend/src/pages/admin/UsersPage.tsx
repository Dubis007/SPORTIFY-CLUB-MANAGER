import React, { useState } from 'react';
import {
  Plus,
  Edit,
  Shield,
  Check,
  X,
  UserX,
  UserCheck,
  Key,
  Trash2,
  Users,
  Trophy,
  Dumbbell,
  Calculator,
  FileSpreadsheet,
  Search,
  FilterX,
  MapPin,
} from 'lucide-react';
import {
  useUsersViewModel,
  UserRoleFilter,
  UserStatusFilter,
} from '../../viewmodels/useUsersViewModel';
import { User, UserRole } from '../../models';
import { CreateUserDto, UpdateUserDto } from '../../services/users/userService';

export default function UsersPage() {
  const {
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
    createUser,
    updateUser,
    toggleUserStatus,
    resetPassword,
    deleteUser,
  } = useUsersViewModel();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  const [formData, setFormData] = useState({
    nombre: '',
    apellido: '',
    correo: '',
    contrasena: '',
    rolNombre: UserRole.MIEMBRO as UserRole,
    sedeId: '' as string,
  });

  const handleOpenModal = (user?: User) => {
    if (user) {
      setEditingUser(user);
      setFormData({
        nombre: user.nombre,
        apellido: user.apellido,
        correo: user.correo,
        contrasena: '',
        rolNombre: user.rol,
        sedeId: user.sedeId ? String(user.sedeId) : '',
      });
    } else {
      setEditingUser(null);
      setFormData({
        nombre: '',
        apellido: '',
        correo: '',
        contrasena: '',
        rolNombre: UserRole.MIEMBRO,
        sedeId: '',
      });
    }
    setIsModalOpen(true);
  };

  const handleStatusToggle = async (id: number, currentStatus: boolean) => {
    if (
      window.confirm(
        `¿Estás seguro de ${currentStatus ? 'desactivar' : 'activar'} a este usuario?`
      )
    ) {
      await toggleUserStatus(id, currentStatus);
    }
  };

  const handleResetPassword = async (user: User) => {
    if (
      window.confirm(`¿Restablecer la contraseña de ${user.nombre} a "Sportify2026!"?`)
    ) {
      const success = await resetPassword(user.id);
      if (success) {
        alert('Contraseña restablecida exitosamente.');
      }
    }
  };

  const handleDeleteUser = async (user: User) => {
    if (
      window.confirm(
        `⚠️ ¡ATENCIÓN! ¿Estás seguro de ELIMINAR PERMANENTEMENTE a ${user.nombre} ${user.apellido}? Esta acción no se puede deshacer y borrará toda su información asociada.`
      )
    ) {
      await deleteUser(user.id);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    let success = false;
    const parsedSedeId = formData.sedeId ? Number(formData.sedeId) : null;

    if (editingUser) {
      const updateDto: UpdateUserDto = {
        nombre: formData.nombre,
        apellido: formData.apellido,
        correo: formData.correo,
        rolNombre: formData.rolNombre,
        sedeId: parsedSedeId,
      };
      success = await updateUser(editingUser.id, updateDto);
    } else {
      const createDto: CreateUserDto = {
        nombre: formData.nombre,
        apellido: formData.apellido,
        correo: formData.correo,
        contrasena: formData.contrasena,
        rolNombre: formData.rolNombre,
        sedeId: parsedSedeId,
      };
      success = await createUser(createDto);
    }

    if (success) {
      setIsModalOpen(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Encabezado del Directorio */}
      <div className="border-b border-slate-800 pb-5 flex flex-wrap items-end justify-between gap-4">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-widest text-blue-400">
            Padrón Institucional ERP
          </span>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-100 mt-0.5">
            Directorio de Usuarios y Miembros
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Segmentación por rol, distinción entre cuentas y deportistas activos, filtros combinables y exportación para Excel
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={exportFilteredToExcelCsv}
            disabled={loading || filteredUsers.length === 0}
            className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-slate-100 border border-slate-700 rounded-xl text-xs font-semibold transition-colors"
          >
            <FileSpreadsheet size={16} className="text-emerald-400" />
            Exportar Excel (.csv)
          </button>
          <button
            type="button"
            onClick={() => handleOpenModal()}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold transition-colors shadow-sm"
          >
            <Plus size={16} />
            Nuevo Usuario
          </button>
        </div>
      </div>

      {/* Tarjetas de Contadores por Rol y Estado (VID1-RF-013 / VID2-RF-002) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <div
          data-testid="counter-total"
          className="bg-slate-900/90 rounded-xl border border-slate-800 p-4 flex items-center justify-between"
        >
          <div>
            <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              Total Cuentas
            </p>
            <p className="text-2xl font-bold text-slate-100 mt-1">
              {counters.totalUsuarios}
            </p>
            <span className="inline-block mt-1.5 text-[11px] text-slate-400">
              {counters.usuariosActivos} activas · {counters.usuariosInactivos} inactivas
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-blue-500/15 border border-blue-500/25 flex items-center justify-center text-blue-400">
            <Users size={18} />
          </div>
        </div>

        <div
          data-testid="counter-miembros"
          className="bg-slate-900/90 rounded-xl border border-slate-800 p-4 flex items-center justify-between"
        >
          <div>
            <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              Deportistas / Miembros
            </p>
            <p className="text-2xl font-bold text-emerald-400 mt-1">
              {counters.miembrosTotal}
            </p>
            <span className="inline-block mt-1.5 text-[11px] text-emerald-300/90">
              {counters.miembrosActivos} activos · {counters.miembrosInactivos} inactivos
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-500/15 border border-emerald-500/25 flex items-center justify-center text-emerald-400">
            <Trophy size={18} />
          </div>
        </div>

        <div
          data-testid="counter-entrenadores"
          className="bg-slate-900/90 rounded-xl border border-slate-800 p-4 flex items-center justify-between"
        >
          <div>
            <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              Entrenadores
            </p>
            <p className="text-2xl font-bold text-slate-100 mt-1">
              {counters.entrenadores}
            </p>
            <span className="inline-block mt-1.5 text-[11px] text-sky-400">
              Cuerpo técnico
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-sky-500/15 border border-sky-500/25 flex items-center justify-center text-sky-400">
            <Dumbbell size={18} />
          </div>
        </div>

        <div
          data-testid="counter-contadores"
          className="bg-slate-900/90 rounded-xl border border-slate-800 p-4 flex items-center justify-between"
        >
          <div>
            <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              Contadores
            </p>
            <p className="text-2xl font-bold text-slate-100 mt-1">
              {counters.contadores}
            </p>
            <span className="inline-block mt-1.5 text-[11px] text-amber-400">
              Auditoría financiera
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-500/25 flex items-center justify-center text-amber-400">
            <Calculator size={18} />
          </div>
        </div>

        <div
          data-testid="counter-admins"
          className="bg-slate-900/90 rounded-xl border border-slate-800 p-4 flex items-center justify-between"
        >
          <div>
            <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              Administradores
            </p>
            <p className="text-2xl font-bold text-slate-100 mt-1">
              {counters.administradores}
            </p>
            <span className="inline-block mt-1.5 text-[11px] text-purple-400">
              Dirección general
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-purple-500/15 border border-purple-500/25 flex items-center justify-center text-purple-400">
            <Shield size={18} />
          </div>
        </div>
      </div>

      {/* Barra de Filtros Combinables */}
      <div className="bg-slate-900/90 rounded-xl border border-slate-800 p-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 items-center">
          <div className="relative lg:col-span-2">
            <Search
              size={15}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
            />
            <input
              type="text"
              aria-label="Buscar usuario"
              placeholder="Buscar por nombre, apellido, correo o sede..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500"
            />
          </div>

          <select
            aria-label="Filtrar por rol"
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value as UserRoleFilter)}
            className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-blue-500"
          >
            <option value="ALL">Todos los roles</option>
            <option value={UserRole.MIEMBRO}>Deportista / Miembro</option>
            <option value={UserRole.ENTRENADOR}>Entrenador</option>
            <option value={UserRole.CONTADOR}>Contador</option>
            <option value={UserRole.ADMIN}>Administrador</option>
          </select>

          <select
            aria-label="Filtrar por estado"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as UserStatusFilter)}
            className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-blue-500"
          >
            <option value="ALL">Todos los estados</option>
            <option value="ACTIVE">Solo activos</option>
            <option value="INACTIVE">Solo inactivos</option>
          </select>

          <div className="flex items-center gap-2">
            <select
              aria-label="Filtrar por sede"
              value={sedeFilter}
              onChange={(e) => setSedeFilter(e.target.value)}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-blue-500"
            >
              <option value="ALL">Todas las sedes</option>
              <option value="UNASSIGNED">Sin sede asignada</option>
              {locations.map((loc) => (
                <option key={loc.id} value={String(loc.id)}>
                  {loc.nombre}
                </option>
              ))}
            </select>

            {hasActiveFilters && (
              <button
                type="button"
                onClick={clearFilters}
                title="Limpiar todos los filtros"
                className="shrink-0 p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors"
              >
                <FilterX size={15} />
              </button>
            )}
          </div>
        </div>
        <div className="mt-2.5 flex items-center justify-between text-[11px] text-slate-400">
          <span>
            Mostrando <strong className="text-slate-200">{filteredUsers.length}</strong> de{' '}
            <strong className="text-slate-200">{counters.totalUsuarios}</strong> registros
          </span>
          {hasActiveFilters && (
            <button
              type="button"
              onClick={clearFilters}
              className="text-blue-400 hover:text-blue-300 font-semibold"
            >
              Restablecer filtros
            </button>
          )}
        </div>
      </div>

      {error && (
        <div className="p-4 bg-rose-500/10 border border-rose-500/30 text-rose-300 rounded-xl text-xs">
          {error}
        </div>
      )}

      {/* Tabla del Padrón con Skeleton Loading (VID1-RNF-001) */}
      <div className="bg-slate-900/90 rounded-xl border border-slate-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-950/70 border-b border-slate-800 text-xs uppercase tracking-wider text-slate-400">
                <th className="p-4 font-semibold">Nombre</th>
                <th className="p-4 font-semibold">Correo</th>
                <th className="p-4 font-semibold">Sede</th>
                <th className="p-4 font-semibold">Rol</th>
                <th className="p-4 font-semibold text-center">Estado</th>
                <th className="p-4 font-semibold text-center">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                [1, 2, 3, 4].map((rowIdx) => (
                  <tr
                    key={rowIdx}
                    data-testid="users-skeleton-row"
                    className="border-b border-slate-800/70 animate-pulse"
                  >
                    <td className="p-4">
                      <div className="h-4 w-36 bg-slate-800 rounded" />
                    </td>
                    <td className="p-4">
                      <div className="h-4 w-44 bg-slate-800 rounded" />
                    </td>
                    <td className="p-4">
                      <div className="h-4 w-28 bg-slate-800 rounded" />
                    </td>
                    <td className="p-4">
                      <div className="h-6 w-24 bg-slate-800 rounded-full" />
                    </td>
                    <td className="p-4 text-center">
                      <div className="h-6 w-20 bg-slate-800 rounded-full mx-auto" />
                    </td>
                    <td className="p-4 text-center">
                      <div className="h-8 w-24 bg-slate-800 rounded-lg mx-auto" />
                    </td>
                  </tr>
                ))
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-10 text-center">
                    <p className="text-sm font-semibold text-slate-300">
                      {hasActiveFilters
                        ? 'Ningún usuario coincide con los filtros seleccionados'
                        : 'No hay usuarios registrados en el padrón'}
                    </p>
                    <p className="text-xs text-slate-500 mt-1">
                      {hasActiveFilters
                        ? 'Prueba ajustando o restableciendo los criterios de búsqueda, rol, estado o sede.'
                        : 'Utiliza el botón "Nuevo Usuario" para dar de alta integrantes en el club.'}
                    </p>
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => {
                  const sedeName =
                    user.sedeNombre ||
                    (user.sedeId ? locationsMap.get(user.sedeId) : null) ||
                    'Sin sede';

                  return (
                    <tr
                      key={user.id}
                      className="border-b border-slate-800/70 hover:bg-slate-800/40 transition-colors text-sm"
                    >
                      <td className="p-4">
                        <div className="font-semibold text-slate-100">
                          {user.nombre} {user.apellido}
                        </div>
                      </td>
                      <td className="p-4 text-slate-300">{user.correo}</td>
                      <td className="p-4 text-xs text-slate-400">
                        <span className="inline-flex items-center gap-1">
                          <MapPin size={12} className="text-slate-500" />
                          {sedeName}
                        </span>
                      </td>
                      <td className="p-4">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold border ${
                            user.rol === UserRole.ADMIN
                              ? 'bg-purple-500/15 text-purple-300 border-purple-500/30'
                              : user.rol === UserRole.ENTRENADOR
                                ? 'bg-sky-500/15 text-sky-300 border-sky-500/30'
                                : user.rol === UserRole.CONTADOR
                                  ? 'bg-amber-500/15 text-amber-300 border-amber-500/30'
                                  : 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                          }`}
                        >
                          <Shield size={12} />
                          {user.rol}
                        </span>
                      </td>
                      <td className="p-4 text-center">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold border ${
                            user.activo
                              ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                              : 'bg-rose-500/15 text-rose-300 border-rose-500/30'
                          }`}
                        >
                          {user.activo ? <Check size={12} /> : <X size={12} />}
                          {user.activo ? 'Activo' : 'Inactivo'}
                        </span>
                      </td>
                      <td className="p-4 text-center">
                        <div className="flex justify-center gap-1.5">
                          {user.solicitaCambioClave && (
                            <button
                              type="button"
                              onClick={() => handleResetPassword(user)}
                              className="p-2 text-amber-300 hover:bg-amber-500/20 rounded-lg transition-colors border border-amber-500/30 bg-amber-500/10"
                              title="El usuario solicitó restablecer su contraseña"
                            >
                              <Key size={16} />
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => handleOpenModal(user)}
                            className="p-2 text-blue-400 hover:bg-blue-500/15 rounded-lg transition-colors"
                            title="Editar usuario"
                          >
                            <Edit size={16} />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleStatusToggle(user.id, user.activo)}
                            className={`p-2 rounded-lg transition-colors ${
                              user.activo
                                ? 'text-rose-400 hover:bg-rose-500/15'
                                : 'text-emerald-400 hover:bg-emerald-500/15'
                            }`}
                            title={user.activo ? 'Desactivar usuario' : 'Activar usuario'}
                          >
                            {user.activo ? <UserX size={16} /> : <UserCheck size={16} />}
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteUser(user)}
                            className="p-2 text-rose-400 hover:bg-rose-500/20 rounded-lg transition-colors"
                            title="Eliminar usuario permanentemente"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Crear / Editar Usuario */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl max-w-md w-full p-6">
            <h2 className="text-lg font-bold text-slate-100 mb-4">
              {editingUser ? 'Editar Usuario' : 'Nuevo Usuario'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Nombre
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.nombre}
                    onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                    className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-slate-100 focus:border-blue-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Apellido
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.apellido}
                    onChange={(e) => setFormData({ ...formData, apellido: e.target.value })}
                    className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-slate-100 focus:border-blue-500 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Correo Electrónico
                </label>
                <input
                  type="email"
                  required
                  value={formData.correo}
                  onChange={(e) => setFormData({ ...formData, correo: e.target.value })}
                  className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-slate-100 focus:border-blue-500 outline-none"
                />
              </div>

              {!editingUser && (
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Contraseña
                  </label>
                  <input
                    type="password"
                    required={!editingUser}
                    value={formData.contrasena}
                    onChange={(e) => setFormData({ ...formData, contrasena: e.target.value })}
                    className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-slate-100 focus:border-blue-500 outline-none"
                  />
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Rol
                  </label>
                  <select
                    value={formData.rolNombre}
                    onChange={(e) =>
                      setFormData({ ...formData, rolNombre: e.target.value as UserRole })
                    }
                    className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-slate-100 focus:border-blue-500 outline-none"
                  >
                    <option value={UserRole.ADMIN}>Administrador</option>
                    <option value={UserRole.CONTADOR}>Contador</option>
                    <option value={UserRole.ENTRENADOR}>Entrenador</option>
                    <option value={UserRole.MIEMBRO}>Miembro</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Sede
                  </label>
                  <select
                    value={formData.sedeId}
                    onChange={(e) => setFormData({ ...formData, sedeId: e.target.value })}
                    className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-slate-100 focus:border-blue-500 outline-none"
                  >
                    <option value="">Sin sede</option>
                    {locations.map((loc) => (
                      <option key={loc.id} value={String(loc.id)}>
                        {loc.nombre}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-300 bg-slate-800 hover:bg-slate-700 rounded-xl transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white rounded-xl transition-colors"
                >
                  {editingUser ? 'Guardar Cambios' : 'Crear Usuario'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
