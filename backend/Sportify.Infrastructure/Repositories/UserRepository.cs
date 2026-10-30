using Microsoft.EntityFrameworkCore;
using Sportify.Application.Interfaces;
using Sportify.Domain.Entities;
using Sportify.Infrastructure.Persistence;

namespace Sportify.Infrastructure.Repositories;

public class UserRepository : IUserRepository
{
    private readonly SportifyDbContext _context;

    public UserRepository(SportifyDbContext context)
    {
        _context = context;
    }

    public async Task<IEnumerable<Usuario>> GetAllAsync()
    {
        return await _context.Usuarios
            .Include(u => u.Sede)
            .Include(u => u.UsuarioRoles)
                .ThenInclude(ur => ur.Rol)
            .AsNoTracking()
            .ToListAsync();
    }

    public async Task<Usuario?> GetByIdAsync(int id)
    {
        return await _context.Usuarios
            .Include(u => u.Sede)
            .Include(u => u.UsuarioRoles)
                .ThenInclude(ur => ur.Rol)
            .Include(u => u.Membresias)
            .Include(u => u.Pagos)
            .FirstOrDefaultAsync(u => u.Id == id);
    }

    public async Task<Usuario?> GetByEmailAsync(string email)
    {
        return await _context.Usuarios
            .Include(u => u.Sede)
            .Include(u => u.UsuarioRoles)
                .ThenInclude(ur => ur.Rol)
            .FirstOrDefaultAsync(u => u.Correo == email);
    }

    public async Task<Usuario> CreateAsync(Usuario usuario, string rolNombre = "MIEMBRO")
    {
        var role = await _context.Roles.FirstOrDefaultAsync(r => r.Nombre == rolNombre);
        if (role != null)
        {
            usuario.UsuarioRoles = new List<UsuarioRol>
            {
                new UsuarioRol { RolId = role.Id, AsignadoEn = DateTime.UtcNow }
            };
        }
        _context.Usuarios.Add(usuario);
        await _context.SaveChangesAsync();
        return usuario;
    }

    public async Task UpdateAsync(Usuario usuario)
    {
        _context.Usuarios.Update(usuario);
        await _context.SaveChangesAsync();
    }

    public async Task DeleteAsync(int id)
    {
        var usuario = await _context.Usuarios.FindAsync(id);
        if (usuario != null)
        {
            _context.Usuarios.Remove(usuario);
            await _context.SaveChangesAsync();
        }
    }

    public async Task UpdateRoleAsync(int userId, string rolNombre)
    {
        var rol = await _context.Roles.FirstOrDefaultAsync(r => r.Nombre == rolNombre);
        if (rol != null)
        {
            var userRoles = _context.UsuarioRoles.Where(ur => ur.UsuarioId == userId);
            _context.UsuarioRoles.RemoveRange(userRoles);
            
            _context.UsuarioRoles.Add(new UsuarioRol 
            { 
                UsuarioId = userId, 
                RolId = rol.Id, 
                AsignadoEn = DateTime.UtcNow 
            });
            await _context.SaveChangesAsync();
        }
    }

    public async Task<bool> EmailExistsAsync(string email, int? excludeId = null)
    {
        var query = _context.Usuarios.Where(u => u.Correo == email);
        if (excludeId.HasValue)
            query = query.Where(u => u.Id != excludeId.Value);
        return await query.AnyAsync();
    }

    public async Task<List<PasswordResetToken>> GetActiveTokensAsync(int userId)
    {
        return await _context.PasswordResetTokens
            .Where(t => t.UsuarioId == userId
                     && !t.Usado
                     && t.Expiracion > DateTime.UtcNow)
            .ToListAsync();
    }

    public async Task AddResetTokenAsync(PasswordResetToken token)
    {
        _context.PasswordResetTokens.Add(token);
        await _context.SaveChangesAsync();
    }

    public async Task UpdateResetTokenAsync(PasswordResetToken token)
    {
        _context.PasswordResetTokens.Update(token);
        await _context.SaveChangesAsync();
    }
}
