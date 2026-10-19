using Sportify.Domain.Entities;

namespace Sportify.Application.Interfaces;

public interface ICompetitionService
{
    Task<IEnumerable<Competencia>> GetAllAsync();
    Task<Competencia> CreateAsync(Competencia competencia);
    Task<Competencia?> UpdateAsync(int id, Competencia competencia);
    Task<bool> DeleteAsync(int id);
}
