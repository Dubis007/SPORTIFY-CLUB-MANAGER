using Sportify.Application.Interfaces;
using Sportify.Domain.Entities;

namespace Sportify.Application.Services;

public class RegistrationService : IRegistrationService
{
    private readonly IRegistrationRepository _repository;

    public RegistrationService(IRegistrationRepository repository)
    {
        _repository = repository;
    }

    public async Task<IEnumerable<object>> GetAllAsync()
    {
        return await _repository.GetAllAsync();
    }

    public async Task<object> GetOptionsAsync()
    {
        return await _repository.GetOptionsAsync();
    }

    public async Task<InscripcionCompetencia?> CreateAsync(InscripcionCompetencia dto)
    {
        var exists = await _repository.ExistsAsync(dto.UsuarioId, dto.CompetenciaId);
        if (exists) return null;

        dto.FechaInscripcion = DateTime.UtcNow;
        await _repository.AddAsync(dto);
        return dto;
    }

    public async Task<InscripcionCompetencia?> UpdateAsync(int id, InscripcionCompetencia dto)
    {
        var existing = await _repository.GetByIdAsync(id);
        if (existing == null) return null;

        existing.Estado = dto.Estado;
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
