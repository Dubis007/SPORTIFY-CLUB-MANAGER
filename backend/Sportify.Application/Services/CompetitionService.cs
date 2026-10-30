using Sportify.Application.DTOs.Competitions;
using Sportify.Application.Interfaces;
using Sportify.Domain.Entities;

namespace Sportify.Application.Services;

public class CompetitionService : ICompetitionService
{
    private readonly ICompetitionRepository _repository;

    public CompetitionService(ICompetitionRepository repository)
    {
        _repository = repository;
    }

    public async Task<IEnumerable<CompetitionDto>> GetAllAsync()
    {
        var competitions = await _repository.GetAllAsync();
        return competitions.Select(MapToDto);
    }

    public async Task<CompetitionDto> CreateAsync(SaveCompetitionDto dto)
    {
        var entity = new Competencia
        {
            Nombre = dto.Nombre,
            Descripcion = dto.Descripcion,
            FechaInicio = dto.FechaInicio,
            FechaFin = dto.FechaFin,
            Ubicacion = dto.Ubicacion,
            CreadoEn = DateTime.UtcNow
        };

        await _repository.AddAsync(entity);
        return MapToDto(entity);
    }

    public async Task<CompetitionDto?> UpdateAsync(int id, SaveCompetitionDto dto)
    {
        var existing = await _repository.GetByIdAsync(id);
        if (existing == null || existing.EliminadoEn != null) return null;

        existing.Nombre = dto.Nombre;
        existing.Descripcion = dto.Descripcion;
        existing.FechaInicio = dto.FechaInicio;
        existing.FechaFin = dto.FechaFin;
        existing.Ubicacion = dto.Ubicacion;

        await _repository.UpdateAsync(existing);
        return MapToDto(existing);
    }

    public async Task<bool> DeleteAsync(int id)
    {
        var existing = await _repository.GetByIdAsync(id);
        if (existing == null || existing.EliminadoEn != null) return false;

        existing.EliminadoEn = DateTime.UtcNow;
        await _repository.UpdateAsync(existing);
        return true;
    }

    private static CompetitionDto MapToDto(Competencia c) => new()
    {
        Id = c.Id,
        Nombre = c.Nombre,
        Descripcion = c.Descripcion,
        FechaInicio = c.FechaInicio,
        FechaFin = c.FechaFin,
        Ubicacion = c.Ubicacion,
        CreadoEn = c.CreadoEn
    };
}
