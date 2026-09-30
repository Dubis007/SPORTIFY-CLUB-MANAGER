using Sportify.Application.DTOs.Users;
using Sportify.Application.Interfaces;
using Sportify.Domain.Entities;

namespace Sportify.Application.Services;

/// <summary>Implementación del servicio CRUD de usuarios.</summary>
public class UserService : IUserService
{
    private readonly IUserRepository _userRepository;

    public UserService(IUserRepository userRepository)
    {
        _userRepository = userRepository;
    }

    /// <inheritdoc/>
    public async Task<IEnumerable<UserDto>> GetAllAsync()
    {
        var usuarios = await _userRepository.GetAllAsync();
        return usuarios.Select(MapToDto);
    }

    /// <inheritdoc/>
    public async Task<UserDto?> GetByIdAsync(int id)
    {
        var usuario = await _userRepository.GetByIdAsync(id);
        return usuario is null ? null : MapToDto(usuario);
    }

    /// <inheritdoc/>
    public async Task<UserDto> CreateAsync(CreateUserDto dto)
    {
        // Verifica unicidad de correo
        var existe = await _userRepository.GetByEmailAsync(dto.Correo);
        if (existe is not null)
            throw new InvalidOperationException($"El correo '{dto.Correo}' ya está registrado");

        var usuario = new Usuario
        {
            Nombre = dto.Nombre,
            Apellido = dto.Apellido,
            Correo = dto.Correo,
            ContrasenaHash = BCrypt.Net.BCrypt.HashPassword(dto.Contrasena),
            Activo = true,
            CreadoEn = DateTime.UtcNow
        };

        await _userRepository.CreateAsync(usuario, dto.RolNombre);

        return MapToDto(usuario);
    }

    /// <inheritdoc/>
    public async Task<UserDto> UpdateAsync(int id, UpdateUserDto dto)
    {
        var usuario = await _userRepository.GetByIdAsync(id)
            ?? throw new KeyNotFoundException($"Usuario con Id={id} no encontrado");

        // Verifica unicidad del correo si cambió
        if (!string.Equals(usuario.Correo, dto.Correo, StringComparison.OrdinalIgnoreCase))
        {
            var duplicado = await _userRepository.GetByEmailAsync(dto.Correo);
            if (duplicado is not null)
                throw new InvalidOperationException($"El correo '{dto.Correo}' ya está registrado por otro usuario");
        }

        usuario.Nombre = dto.Nombre;
        usuario.Apellido = dto.Apellido;
        usuario.Correo = dto.Correo;

        await _userRepository.UpdateAsync(usuario);

        if (!string.IsNullOrEmpty(dto.RolNombre))
        {
            await _userRepository.UpdateRoleAsync(usuario.Id, dto.RolNombre);
            
            // Reload the user to get the new roles for the DTO
            usuario = await _userRepository.GetByIdAsync(usuario.Id) ?? usuario;
        }

        return MapToDto(usuario);
    }

    /// <inheritdoc/>
    public async Task DeleteAsync(int id)
    {
        var usuario = await _userRepository.GetByIdAsync(id)
            ?? throw new KeyNotFoundException($"Usuario con Id={id} no encontrado");
            
        await _userRepository.DeleteAsync(id);
    }

    /// <inheritdoc/>
    public async Task SetStatusAsync(int id, bool activo)
    {
        var usuario = await _userRepository.GetByIdAsync(id)
            ?? throw new KeyNotFoundException($"Usuario con Id={id} no encontrado");

        usuario.Activo = activo;
        await _userRepository.UpdateAsync(usuario);
    }

    // ──────────────────────────────────────────────
    // Métodos auxiliares
    // ──────────────────────────────────────────────

    public async Task ResetPasswordAsync(int id, string defaultPassword)
    {
        var user = await _userRepository.GetByIdAsync(id);
        if (user == null) throw new KeyNotFoundException("Usuario no encontrado");

        user.ContrasenaHash = BCrypt.Net.BCrypt.HashPassword(defaultPassword);
        user.SolicitaCambioClave = false;
        user.ActualizadoEn = DateTime.UtcNow;

        await _userRepository.UpdateAsync(user);
    }

    private static UserDto MapToDto(Usuario u) => new()
    {
        Id = u.Id,
        Nombre = u.Nombre,
        Apellido = u.Apellido,
        Correo = u.Correo,
        Activo = u.Activo,
        SolicitaCambioClave = u.SolicitaCambioClave,
        CreadoEn = u.CreadoEn,
        Roles = u.UsuarioRoles?
            .Select(ur => ur.Rol?.Nombre ?? string.Empty)
            .Where(r => !string.IsNullOrEmpty(r))
            .ToList() ?? new List<string>()
    };
}
