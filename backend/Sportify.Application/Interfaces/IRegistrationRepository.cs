using Sportify.Application.DTOs.Registrations;
using Sportify.Domain.Entities;

namespace Sportify.Application.Interfaces;

public interface IRegistrationRepository
{
    Task<IEnumerable<RegistrationDto>> GetAllAsync();
    Task<RegistrationOptionsDto> GetOptionsAsync();
    Task<bool> ExistsAsync(int usuarioId, int competenciaId);

    /// <summary>RN-03: indica si la membresía más reciente del deportista está ACTIVA.</summary>
    Task<bool> HasActiveMembershipAsync(int usuarioId);
    Task<InscripcionCompetencia?> GetByIdAsync(int id);
    Task AddAsync(InscripcionCompetencia inscripcion);
    Task UpdateAsync(InscripcionCompetencia inscripcion);
    Task DeleteAsync(InscripcionCompetencia inscripcion);
}
