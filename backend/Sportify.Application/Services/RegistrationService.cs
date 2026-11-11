using Sportify.Application.DTOs.Registrations;
using Sportify.Application.Interfaces;
using Sportify.Domain.Entities;
using Sportify.Domain.Enums;

namespace Sportify.Application.Services;

public class RegistrationService : IRegistrationService
{
    private readonly IRegistrationRepository _repository;

    public RegistrationService(IRegistrationRepository repository)
    {
        _repository = repository;
    }

    public async Task<IEnumerable<RegistrationDto>> GetAllAsync()
    {
        return await _repository.GetAllAsync();
    }

    public async Task<RegistrationOptionsDto> GetOptionsAsync()
    {
        return await _repository.GetOptionsAsync();
    }

    public async Task<RegistrationDto?> CreateAsync(SaveRegistrationDto dto)
    {
        var exists = await _repository.ExistsAsync(dto.UsuarioId, dto.CompetenciaId);
        if (exists) return null;

        // El personal convoca; la inscripción nace PENDIENTE y solo el deportista la confirma al aceptar (RF-10).
        var entity = new InscripcionCompetencia
        {
            CompetenciaId = dto.CompetenciaId,
            UsuarioId = dto.UsuarioId,
            Estado = EstadoInscripcion.PENDIENTE,
            FechaInscripcion = DateTime.UtcNow
        };

        await _repository.AddAsync(entity);
        return MapToDto(entity);
    }

    /// <inheritdoc/>
    public async Task<RegistrationDto> RespondToInvitationAsync(int registrationId, int userId, bool accept)
    {
        var inscripcion = await _repository.GetByIdAsync(registrationId);

        // Misma respuesta si no existe o si es de otro deportista: no se revelan convocatorias ajenas.
        if (inscripcion == null || inscripcion.UsuarioId != userId)
            throw new KeyNotFoundException("Convocatoria no encontrada.");

        if (inscripcion.Estado != EstadoInscripcion.PENDIENTE)
            throw new InvalidOperationException("La convocatoria ya fue respondida y no admite cambios.");

        if (accept)
        {
            var tieneMembresiaActiva = await _repository.HasActiveMembershipAsync(userId);
            if (!tieneMembresiaActiva)
                throw new InvalidOperationException(
                    "Para aceptar la convocatoria necesitas una membresía activa (RN-03).");

            inscripcion.Estado = EstadoInscripcion.CONFIRMADA;
        }
        else
        {
            inscripcion.Estado = EstadoInscripcion.CANCELADA;
        }

        await _repository.UpdateAsync(inscripcion);
        return MapToDto(inscripcion);
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
