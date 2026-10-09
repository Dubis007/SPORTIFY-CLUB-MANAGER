import React, { useState } from 'react';
import { Plus, Edit, Shield, Check, X, UserX, UserCheck, Key, Trash2 } from 'lucide-react';
import { useUsersViewModel } from '../../viewmodels/useUsersViewModel';
import { User, UserRole } from '../../models';
import { CreateUserDto, UpdateUserDto } from '../../services/users/userService';

export default function UsersPage() {
  const { users, loading, error, createUser, updateUser, toggleUserStatus, resetPassword, deleteUser } = useUsersViewModel();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  
  const [formData, setFormData] = useState({
    nombre: '',
    apellido: '',
    correo: '',
    contrasena: '',
    rolNombre: UserRole.MIEMBRO as UserRole,
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
      });
    } else {
      setEditingUser(null);
      setFormData({ nombre: '', apellido: '', correo: '', contrasena: '', rolNombre: UserRole.MIEMBRO });
    }
    setIsModalOpen(true);
  };

  const handleStatusToggle = async (id: number, currentStatus: boolean) => {
    if (window.confirm(`¿Estás seguro de ${currentStatus ? 'desactivar' : 'activar'} a este usuario?`)) {
      await toggleUserStatus(id, currentStatus);
    }
  };

  const handleResetPassword = async (user: User) => {
    if (window.confirm(`¿Restablecer la contraseña de ${user.nombre} a "Sportify2026!"?`)) {
      const success = await resetPassword(user.id);
      if (success) {
        alert('Contraseña restablecida exitosamente.');
      }
    }
  };

  const handleDeleteUser = async (user: User) => {
    if (window.confirm(`⚠️ ¡ATENCIÓN! ¿Estás seguro de ELIMINAR PERMANENTEMENTE a ${user.nombre} ${user.apellido}? Esta acción no se puede deshacer y borrará toda su información asociada.`)) {
      await deleteUser(user.id);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    let success = false;
    
    if (editingUser) {
      const updateDto: UpdateUserDto = {
        nombre: formData.nombre,
        apellido: formData.apellido,
        correo: formData.correo,
        rolNombre: formData.rolNombre
      };
      success = await updateUser(editingUser.id, updateDto);
    } else {
      const createDto: CreateUserDto = {
        nombre: formData.nombre,
        apellido: formData.apellido,
        correo: formData.correo,
        contrasena: formData.contrasena,
        rolNombre: formData.rolNombre
      };
      success = await createUser(createDto);
    }

    if (success) {
      setIsModalOpen(false);
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Gestión de Usuarios</h1>
          <p className="text-gray-600">Administra los usuarios y sus roles en el sistema</p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="flex items-center gap-2 px-4 py-2 bg-sportify-primary text-white rounded-lg hover:bg-red-700 transition-colors"
        >
          <Plus size={20} />
          Nuevo Usuario
        </button>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-100 text-red-700 rounded-lg">
          {error}
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="p-4 font-semibold text-gray-600">Nombre</th>
                <th className="p-4 font-semibold text-gray-600">Correo</th>
                <th className="p-4 font-semibold text-gray-600">Rol</th>
                <th className="p-4 font-semibold text-gray-600 text-center">Estado</th>
                <th className="p-4 font-semibold text-gray-600 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-gray-500">
                    Cargando usuarios...
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-gray-500">
                    No hay usuarios registrados
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr key={user.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                    <td className="p-4">
                      <div className="font-medium text-gray-800">{user.nombre} {user.apellido}</div>
                    </td>
                    <td className="p-4 text-gray-600">{user.correo}</td>
                    <td className="p-4">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium
                        ${user.rol === UserRole.ADMIN ? 'bg-purple-100 text-purple-700' : 
                          user.rol === UserRole.ENTRENADOR ? 'bg-blue-100 text-blue-700' :
                          user.rol === UserRole.CONTADOR ? 'bg-orange-100 text-orange-700' :
                          'bg-gray-100 text-gray-700'}`}>
                        <Shield size={12} />
                        {user.rol}
                      </span>
                    </td>
                    <td className="p-4 text-center">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium
                        ${user.activo ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        {user.activo ? <Check size={12} /> : <X size={12} />}
                        {user.activo ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>
                    <td className="p-4 text-center">
                        <div className="flex justify-center gap-2">
                          {user.solicitaCambioClave && (
                            <button
                              onClick={() => handleResetPassword(user)}
                              className="p-2 text-yellow-600 hover:text-yellow-800 hover:bg-yellow-100 rounded-lg transition-colors border border-yellow-200 bg-yellow-50 shadow-sm"
                              title="El usuario solicitó restablecer su contraseña"
                            >
                              <Key size={18} />
                            </button>
                          )}
                          <button
                            onClick={() => handleOpenModal(user)}
                            className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Editar usuario"
                          >
                            <Edit size={18} />
                          </button>
                          <button
                            onClick={() => handleStatusToggle(user.id, user.activo)}
                            className={`p-2 rounded-lg transition-colors ${
                              user.activo 
                                ? 'text-red-600 hover:text-red-800 hover:bg-red-50' 
                                : 'text-green-600 hover:text-green-800 hover:bg-green-50'
                            }`}
                            title={user.activo ? "Desactivar usuario" : "Activar usuario"}
                          >
                            {user.activo ? <UserX size={18} /> : <UserCheck size={18} />}
                          </button>
                          <button
                            onClick={() => handleDeleteUser(user)}
                            className="p-2 text-red-600 hover:text-red-900 hover:bg-red-100 rounded-lg transition-colors ml-1"
                            title="Eliminar usuario permanentemente"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">
              {editingUser ? 'Editar Usuario' : 'Nuevo Usuario'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
                  <input
                    type="text"
                    required
                    value={formData.nombre}
                    onChange={e => setFormData({...formData, nombre: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sportify-primary outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Apellido</label>
                  <input
                    type="text"
                    required
                    value={formData.apellido}
                    onChange={e => setFormData({...formData, apellido: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sportify-primary outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Correo Electrónico</label>
                <input
                  type="email"
                  required
                  value={formData.correo}
                  onChange={e => setFormData({...formData, correo: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sportify-primary outline-none"
                />
              </div>

              {!editingUser && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Contraseña</label>
                  <input
                    type="password"
                    required={!editingUser}
                    value={formData.contrasena}
                    onChange={e => setFormData({...formData, contrasena: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sportify-primary outline-none"
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Rol</label>
                <select
                  value={formData.rolNombre}
                  onChange={e => setFormData({...formData, rolNombre: e.target.value as UserRole})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sportify-primary outline-none"
                >
                  <option value={UserRole.ADMIN}>Administrador</option>
                  <option value={UserRole.CONTADOR}>Contador</option>
                  <option value={UserRole.ENTRENADOR}>Entrenador</option>
                  <option value={UserRole.MIEMBRO}>Miembro</option>
                </select>
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-sportify-primary text-white rounded-lg hover:bg-red-700 transition-colors"
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
