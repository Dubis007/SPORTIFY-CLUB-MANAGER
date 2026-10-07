using Sportify.Domain.Entities;

namespace Sportify.Application.Interfaces;

public interface IEvaluationRepository
{
    Task<List<EvaluacionCompetencia>> GetAllWithIncludesAsync();
    Task<List<InscripcionCompetencia>> GetInscripcionesOptionsAsync();
    Task<bool> ExistsByInscripcionIdAsync(int inscripcionId);
    Task<EvaluacionCompetencia?> GetByIdAsync(int id);
    Task AddAsync(EvaluacionCompetencia evaluacion);
    Task UpdateAsync(EvaluacionCompetencia evaluacion);
    Task DeleteAsync(EvaluacionCompetencia evaluacion);
}
