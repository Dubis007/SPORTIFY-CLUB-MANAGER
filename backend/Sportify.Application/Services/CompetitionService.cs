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

    public async Task<IEnumerable<Competencia>> GetAllAsync()
    {
        return await _repository.GetAllAsync();
    }

    public async Task<Competencia> CreateAsync(Competencia dto)
    {
        dto.CreadoEn = DateTime.UtcNow;
        await _repository.AddAsync(dto);
        return dto;
    }

    public async Task<Competencia?> UpdateAsync(int id, Competencia dto)
    {
        var existing = await _repository.GetByIdAsync(id);
        if (existing == null || existing.EliminadoEn != null) return null;

        existing.Nombre = dto.Nombre;
        existing.Descripcion = dto.Descripcion;
        existing.FechaInicio = dto.FechaInicio;
        existing.FechaFin = dto.FechaFin;
        existing.Ubicacion = dto.Ubicacion;

        await _repository.UpdateAsync(existing);
        return existing;
    }

    public async Task<bool> DeleteAsync(int id)
    {
        var existing = await _repository.GetByIdAsync(id);
        if (existing == null || existing.EliminadoEn != null) return false;

        existing.EliminadoEn = DateTime.UtcNow; // Soft delete
        await _repository.UpdateAsync(existing);
        return true;
    }
}
