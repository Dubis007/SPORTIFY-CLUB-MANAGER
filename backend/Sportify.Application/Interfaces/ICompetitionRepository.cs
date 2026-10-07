using Sportify.Domain.Entities;

namespace Sportify.Application.Interfaces;

public interface ICompetitionRepository
{
    Task<IEnumerable<Competencia>> GetAllAsync();
    Task<Competencia?> GetByIdAsync(int id);
    Task AddAsync(Competencia competencia);
    Task UpdateAsync(Competencia competencia);
}
