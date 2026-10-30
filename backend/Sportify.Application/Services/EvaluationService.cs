using Sportify.Application.DTOs.Common;
using Sportify.Application.DTOs.Evaluations;
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

    public async Task<PagedResult<EvaluationDto>> GetPagedAsync(PaginationParams pagination, int? evaluadoPorId)
    {
        var (evals, total) = await _repository.GetPagedWithIncludesAsync(pagination.Skip, pagination.PageSize, evaluadoPorId);
        var items = evals.Select(MapToDto).ToList();

        return new PagedResult<EvaluationDto>
        {
            Items = items,
            Page = pagination.Page,
            PageSize = pagination.PageSize,
            TotalCount = total
        };
    }

    public async Task<IEnumerable<EvaluationDto>> GetAllAsync()
    {
        var evals = await _repository.GetAllWithIncludesAsync();
        return evals.Select(MapToDto).OrderByDescending(e => e.EvaluadoEn).ToList();
    }

    public async Task<IEnumerable<EvaluationOptionDto>> GetOptionsAsync()
    {
        var inscripciones = await _repository.GetInscripcionesOptionsAsync();
        return inscripciones.Select(i => new EvaluationOptionDto
        {
            Id = i.Id,
            UsuarioNombre = $"{i.Usuario?.Nombre} {i.Usuario?.Apellido}".Trim(),
            CompetenciaNombre = i.Competencia?.Nombre ?? string.Empty,
            FechaInicio = i.Competencia?.FechaInicio ?? DateTime.MinValue
        }).OrderByDescending(i => i.FechaInicio).ToList();
    }

    public async Task<(bool IsSuccess, string ErrorMessage, EvaluationDto? Evaluation)> CreateAsync(SaveEvaluationDto dto, int currentUserId)
    {
        var exists = await _repository.ExistsByInscripcionIdAsync(dto.InscripcionId);
        if (exists)
            return (false, "Esta inscripción ya tiene una evaluación.", null);

        var entity = new EvaluacionCompetencia
        {
            InscripcionId = dto.InscripcionId,
            Puntaje = dto.Puntaje,
            Posicion = dto.Posicion,
            Desempeno = dto.Desempeno,
            Comentarios = dto.Comentarios,
            EvaluadoPorId = currentUserId > 0 ? currentUserId : 1,
            EvaluadoEn = DateTime.UtcNow
        };

        await _repository.AddAsync(entity);
        return (true, string.Empty, MapToDto(entity));
    }

    public async Task<EvaluationDto?> UpdateAsync(int id, SaveEvaluationDto dto)
    {
        var existing = await _repository.GetByIdAsync(id);
        if (existing == null) return null;

        existing.Puntaje = dto.Puntaje;
        existing.Posicion = dto.Posicion;
        existing.Desempeno = dto.Desempeno;
        existing.Comentarios = dto.Comentarios;

        await _repository.UpdateAsync(existing);
        return MapToDto(existing);
    }

    public async Task<bool> DeleteAsync(int id)
    {
        var existing = await _repository.GetByIdAsync(id);
        if (existing == null) return false;

        await _repository.DeleteAsync(existing);
        return true;
    }

    private static EvaluationDto MapToDto(EvaluacionCompetencia e) => new()
    {
        Id = e.Id,
        InscripcionId = e.InscripcionId,
        Puntaje = e.Puntaje,
        Posicion = e.Posicion,
        Desempeno = e.Desempeno,
        Comentarios = e.Comentarios,
        EvaluadoEn = e.EvaluadoEn,
        EvaluadoPorId = e.EvaluadoPorId,
        UsuarioNombre = $"{e.Inscripcion?.Usuario?.Nombre} {e.Inscripcion?.Usuario?.Apellido}".Trim(),
        CompetenciaNombre = e.Inscripcion?.Competencia?.Nombre ?? string.Empty
    };
}