using Sportify.Application.DTOs.Competitions;

namespace Sportify.Application.Interfaces;

public interface ICompetitionService
{
    Task<IEnumerable<CompetitionDto>> GetAllAsync();
    Task<CompetitionDto> CreateAsync(SaveCompetitionDto dto);
    Task<CompetitionDto?> UpdateAsync(int id, SaveCompetitionDto dto);
    Task<bool> DeleteAsync(int id);
}
