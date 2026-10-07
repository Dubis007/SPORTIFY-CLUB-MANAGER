using Sportify.Application.Interfaces;
using Sportify.Domain.Entities;

namespace Sportify.Application.Services;

public class EvaluationService : IEvaluationService
{
    private readonly IEvaluationRepository _repository;

    public EvaluationService(IEvaluationRepository repository)
    {
        _repository = repository;
    }

    public async Task<IEnumerable<object>> GetAllAsync()
    {
        var evals = await _repository.GetAllWithIncludesAsync();
        return evals.Select(e => new {
            e.Id,
            e.InscripcionId,
            e.Puntaje,
            e.Desempeno,
            e.Comentarios,
            e.EvaluadoEn,
            e.EvaluadoPorId,
            UsuarioNombre = e.Inscripcion.Usuario.Nombre + " " + e.Inscripcion.Usuario.Apellido,
            CompetenciaNombre = e.Inscripcion.Competencia.Nombre
        }).OrderByDescending(e => e.EvaluadoEn).ToList();
    }

    public async Task<IEnumerable<object>> GetOptionsAsync()
    {
        var inscripciones = await _repository.GetInscripcionesOptionsAsync();
        return inscripciones.Select(i => new {
            i.Id,
            UsuarioNombre = i.Usuario.Nombre + " " + i.Usuario.Apellido,
            CompetenciaNombre = i.Competencia.Nombre,
            i.Competencia.FechaInicio
        }).OrderByDescending(i => i.FechaInicio).ToList();
    }

    public async Task<(bool IsSuccess, string ErrorMessage)> CreateAsync(EvaluacionCompetencia dto, int currentUserId)
    {
        dto.EvaluadoPorId = currentUserId > 0 ? currentUserId : 1;

        var exists = await _repository.ExistsByInscripcionIdAsync(dto.InscripcionId);
        if (exists) return (false, "Esta inscripción ya tiene una evaluación.");

        dto.EvaluadoEn = DateTime.UtcNow;
        await _repository.AddAsync(dto);
        return (true, string.Empty);
    }

    public async Task<EvaluacionCompetencia?> UpdateAsync(int id, EvaluacionCompetencia dto)
    {
        var existing = await _repository.GetByIdAsync(id);
        if (existing == null) return null;

        existing.Puntaje = dto.Puntaje;
        existing.Desempeno = dto.Desempeno;
        existing.Comentarios = dto.Comentarios;
        
        await _repository.UpdateAsync(existing);
        return existing;
    }

    public async Task<bool> DeleteAsync(int id)
    {
        var existing = await _repository.GetByIdAsync(id);
        if (existing == null) return false;

        await _repository.DeleteAsync(existing);
        return true;
    }
}
