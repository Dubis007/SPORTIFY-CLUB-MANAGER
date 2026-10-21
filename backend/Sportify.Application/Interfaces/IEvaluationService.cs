using Sportify.Application.DTOs.Common;
using Sportify.Domain.Entities;

namespace Sportify.Application.Interfaces;

public interface IEvaluationService
{
    Task<PagedResult<object>> GetPagedAsync(PaginationParams pagination, int? evaluadoPorId);
    Task<IEnumerable<object>> GetAllAsync();
    Task<IEnumerable<object>> GetOptionsAsync();
    Task<(bool IsSuccess, string ErrorMessage)> CreateAsync(EvaluacionCompetencia dto, int currentUserId);
    Task<EvaluacionCompetencia?> UpdateAsync(int id, EvaluacionCompetencia dto);
    Task<bool> DeleteAsync(int id);
}
