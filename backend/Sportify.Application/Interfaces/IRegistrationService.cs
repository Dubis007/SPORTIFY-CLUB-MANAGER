using Sportify.Application.DTOs.Registrations;

namespace Sportify.Application.Interfaces;

public interface IRegistrationService
{
    Task<IEnumerable<object>> GetAllAsync();
    Task<object> GetOptionsAsync();
    Task<RegistrationDto?> CreateAsync(SaveRegistrationDto dto);
    Task<RegistrationDto?> UpdateAsync(int id, SaveRegistrationDto dto);
    Task<bool> DeleteAsync(int id);
}
