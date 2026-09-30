using Sportify.Application.DTOs.Users;

namespace Sportify.Application.Interfaces;

/// <summary>Interfaz del servicio CRUD de usuarios.</summary>
public interface IUserService
{
    Task<IEnumerable<UserDto>> GetAllAsync();
    Task<UserDto?> GetByIdAsync(int id);
    Task<UserDto> CreateAsync(CreateUserDto dto);
    Task<UserDto> UpdateAsync(int id, UpdateUserDto dto);
    Task DeleteAsync(int id);
    Task SetStatusAsync(int id, bool activo);
    Task ResetPasswordAsync(int id, string defaultPassword);
}
