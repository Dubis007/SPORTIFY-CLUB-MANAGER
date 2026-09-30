using Sportify.Domain.Entities;

namespace Sportify.Application.Interfaces;

public interface IUserRepository
{
    Task<IEnumerable<Usuario>> GetAllAsync();
    Task<Usuario?> GetByIdAsync(int id);
    Task<Usuario?> GetByEmailAsync(string email);
    Task<Usuario> CreateAsync(Usuario usuario, string rolNombre = "MIEMBRO");
    Task UpdateAsync(Usuario usuario);
    Task DeleteAsync(int id);
    Task UpdateRoleAsync(int userId, string rolNombre);
    Task<bool> EmailExistsAsync(string email, int? excludeId = null);
    Task<List<PasswordResetToken>> GetActiveTokensAsync(int userId);
    Task AddResetTokenAsync(PasswordResetToken token);
    Task UpdateResetTokenAsync(PasswordResetToken token);
}
