using System.ComponentModel.DataAnnotations;
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
    [Required(ErrorMessage = "La competencia es requerida")]
    [Range(1, int.MaxValue, ErrorMessage = "El identificador de competencia no es válido")]
    public int CompetenciaId { get; set; }

    [Required(ErrorMessage = "El usuario es requerido")]
    [Range(1, int.MaxValue, ErrorMessage = "El identificador de usuario no es válido")]
    public int UsuarioId { get; set; }

    public EstadoInscripcion Estado { get; set; } = EstadoInscripcion.PENDIENTE;
}

/// <summary>DTO mínimo de opción de competencia para formularios de inscripción.</summary>
public class RegistrationCompetitionOptionDto
{
    public int Id { get; set; }
    public string Nombre { get; set; } = string.Empty;
    public DateTime FechaInicio { get; set; }
}

/// <summary>DTO mínimo de opción de miembro para formularios de inscripción (sin datos sensibles).</summary>
public class RegistrationMemberOptionDto
{
    public int Id { get; set; }
    public string Nombre { get; set; } = string.Empty;
    public string Apellido { get; set; } = string.Empty;
}

/// <summary>DTO con catálogos estrictamente necesarios para inscribir deportistas.</summary>
public class RegistrationOptionsDto
{
    public IEnumerable<RegistrationCompetitionOptionDto> Competitions { get; set; } = [];
    public IEnumerable<RegistrationMemberOptionDto> Members { get; set; } = [];
}
