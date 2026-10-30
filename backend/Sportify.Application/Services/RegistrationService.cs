using Sportify.Application.DTOs.Registrations;
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

    public async Task<RegistrationDto?> CreateAsync(SaveRegistrationDto dto)
    {
        var exists = await _repository.ExistsAsync(dto.UsuarioId, dto.CompetenciaId);
        if (exists) return null;

        var entity = new InscripcionCompetencia
        {
            CompetenciaId = dto.CompetenciaId,
            UsuarioId = dto.UsuarioId,
            Estado = dto.Estado,
            FechaInscripcion = DateTime.UtcNow
        };

        await _repository.AddAsync(entity);
        return MapToDto(entity);
    }

    public async Task<RegistrationDto?> UpdateAsync(int id, SaveRegistrationDto dto)
    {
        var existing = await _repository.GetByIdAsync(id);
        if (existing == null) return null;

        existing.Estado = dto.Estado;
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

    private static RegistrationDto MapToDto(InscripcionCompetencia i) => new()
    {
        Id = i.Id,
        CompetenciaId = i.CompetenciaId,
        UsuarioId = i.UsuarioId,
        Estado = i.Estado,
        FechaInscripcion = i.FechaInscripcion
    };
}
