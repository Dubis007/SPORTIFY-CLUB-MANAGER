namespace Sportify.Application.DTOs.Users;

/// <summary>DTO con el cálculo del próximo cumpleaños de un integrante activo del club.</summary>
public class UpcomingBirthdayDto
{
    public int UsuarioId { get; set; }
    public string NombreCompleto { get; set; } = string.Empty;
    public string Rol { get; set; } = string.Empty;
    public int Mes { get; set; }
    public int Dia { get; set; }
    public DateTime ProximaFecha { get; set; }
    public int DiasFaltantes { get; set; }
}
