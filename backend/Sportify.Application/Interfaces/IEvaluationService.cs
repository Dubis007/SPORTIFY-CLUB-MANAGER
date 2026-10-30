using Sportify.Application.DTOs.Common;
using Sportify.Application.DTOs.Evaluations;

namespace Sportify.Application.Interfaces;

public interface IEvaluationService
{
    Task<PagedResult<EvaluationDto>> GetPagedAsync(PaginationParams pagination, int? evaluadoPorId);
    Task<IEnumerable<EvaluationDto>> GetAllAsync();
    Task<IEnumerable<EvaluationOptionDto>> GetOptionsAsync();
    Task<(bool IsSuccess, string ErrorMessage, EvaluationDto? Evaluation)> CreateAsync(SaveEvaluationDto dto, int currentUserId);
    Task<EvaluationDto?> UpdateAsync(int id, SaveEvaluationDto dto);
    Task<bool> DeleteAsync(int id);
}
