using Sportify.Domain.Enums;

namespace Sportify.Application.DTOs.Registrations;

public class RegistrationDto
{
    public int Id { get; set; }
    public int CompetenciaId { get; set; }
    public int UsuarioId { get; set; }
    public EstadoInscripcion Estado { get; set; } = EstadoInscripcion.PENDIENTE;
    public DateTime FechaInscripcion { get; set; }
    public string? UsuarioNombre { get; set; }
    public string? CompetenciaNombre { get; set; }
}

public class SaveRegistrationDto
{
    public int CompetenciaId { get; set; }
    public int UsuarioId { get; set; }
    public EstadoInscripcion Estado { get; set; } = EstadoInscripcion.PENDIENTE;
}
