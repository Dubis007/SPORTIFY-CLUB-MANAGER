using Sportify.Domain.Entities;

namespace Sportify.Application.Interfaces;

public interface IRegistrationService
{
    Task<IEnumerable<object>> GetAllAsync();
    Task<object> GetOptionsAsync();
    Task<InscripcionCompetencia?> CreateAsync(InscripcionCompetencia dto);
    Task<InscripcionCompetencia?> UpdateAsync(int id, InscripcionCompetencia dto);
    Task<bool> DeleteAsync(int id);
}
