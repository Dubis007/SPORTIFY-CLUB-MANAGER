using Sportify.Application.DTOs.Registrations;

namespace Sportify.Application.Interfaces;

public interface IRegistrationService
{
    Task<IEnumerable<RegistrationDto>> GetAllAsync();
    Task<RegistrationOptionsDto> GetOptionsAsync();
    Task<RegistrationDto?> CreateAsync(SaveRegistrationDto dto);
    Task<RegistrationDto?> UpdateAsync(int id, SaveRegistrationDto dto);
    Task<bool> DeleteAsync(int id);

    /// <summary>
    /// Respuesta del deportista a su convocatoria: al aceptar queda CONFIRMADA (exige membresía activa, RN-03)
    /// y al rechazar queda CANCELADA. Solo aplica a convocatorias propias en estado PENDIENTE.
    /// </summary>
    Task<RegistrationDto> RespondToInvitationAsync(int registrationId, int userId, bool accept);
}
