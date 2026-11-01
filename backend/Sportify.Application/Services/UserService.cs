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
            SedeId = dto.SedeId,
            FechaNacimiento = dto.FechaNacimiento?.Date,
            Activo = true,
            CreadoEn = DateTime.UtcNow
        };

        await _userRepository.CreateAsync(usuario, dto.RolNombre);
        var reloaded = await _userRepository.GetByIdAsync(usuario.Id) ?? usuario;

        return MapToDto(reloaded);
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
        usuario.SedeId = dto.SedeId;
        usuario.FechaNacimiento = dto.FechaNacimiento?.Date;
        usuario.ActualizadoEn = DateTime.UtcNow;

        await _userRepository.UpdateAsync(usuario);

        if (!string.IsNullOrEmpty(dto.RolNombre))
        {
            await _userRepository.UpdateRoleAsync(usuario.Id, dto.RolNombre);
        }

        usuario = await _userRepository.GetByIdAsync(usuario.Id) ?? usuario;

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

    public async Task<IEnumerable<UpcomingBirthdayDto>> GetUpcomingBirthdaysAsync(
        int withinDays = 366,
        DateTime? referenceDate = null)
    {
        var maxWindow = Math.Clamp(withinDays, 0, 366);
        var today = (referenceDate ?? DateTime.UtcNow).Date;
        var usuarios = await _userRepository.GetAllAsync();

        static DateTime BuildBirthdayInYear(int year, int month, int day)
        {
            var safeDay = Math.Min(day, DateTime.DaysInMonth(year, month));
            return new DateTime(year, month, safeDay, 0, 0, 0, DateTimeKind.Utc);
        }

        return usuarios
            .Where(u => u.Activo && u.FechaNacimiento.HasValue)
            .Select(u =>
            {
                var birth = u.FechaNacimiento!.Value;
                var nextDate = BuildBirthdayInYear(today.Year, birth.Month, birth.Day);
                if (nextDate < today)
                {
                    nextDate = BuildBirthdayInYear(today.Year + 1, birth.Month, birth.Day);
                }

                var diasFaltantes = (int)(nextDate - today).TotalDays;
                var primaryRole = u.UsuarioRoles?
                    .Select(ur => ur.Rol?.Nombre)
                    .FirstOrDefault(r => !string.IsNullOrWhiteSpace(r)) ?? "MIEMBRO";

                return new UpcomingBirthdayDto
                {
                    UsuarioId = u.Id,
                    NombreCompleto = $"{u.Nombre} {u.Apellido}".Trim(),
                    Rol = primaryRole!,
                    Mes = birth.Month,
                    Dia = birth.Day,
                    ProximaFecha = nextDate,
                    DiasFaltantes = diasFaltantes
                };
            })
            .Where(b => b.DiasFaltantes <= maxWindow)
            .OrderBy(b => b.DiasFaltantes)
            .ThenBy(b => b.NombreCompleto)
            .ToList();
    }

    private static UserDto MapToDto(Usuario u) => new()
    {
        Id = u.Id,
        Nombre = u.Nombre,
        Apellido = u.Apellido,
        Correo = u.Correo,
        Activo = u.Activo,
        SolicitaCambioClave = u.SolicitaCambioClave,
        SedeId = u.SedeId,
        SedeNombre = u.Sede?.Nombre,
        FechaNacimiento = u.FechaNacimiento,
        CreadoEn = u.CreadoEn,
        Roles = u.UsuarioRoles?
            .Select(ur => ur.Rol?.Nombre ?? string.Empty)
            .Where(r => !string.IsNullOrEmpty(r))
            .ToList() ?? new List<string>()
    };
}
