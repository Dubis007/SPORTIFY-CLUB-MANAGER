using Sportify.Application.DTOs.Registrations;
using Sportify.Domain.Entities;

namespace Sportify.Application.Interfaces;

public interface IRegistrationRepository
{
    Task<IEnumerable<RegistrationDto>> GetAllAsync();
    Task<RegistrationOptionsDto> GetOptionsAsync();
    Task<bool> ExistsAsync(int usuarioId, int competenciaId);
    Task<InscripcionCompetencia?> GetByIdAsync(int id);
    Task AddAsync(InscripcionCompetencia inscripcion);
    Task UpdateAsync(InscripcionCompetencia inscripcion);
    Task DeleteAsync(InscripcionCompetencia inscripcion);
}
