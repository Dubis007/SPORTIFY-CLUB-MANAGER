namespace Sportify.Application.DTOs.Users;

/// <summary>DTO de respuesta con la información pública de un usuario (sin datos sensibles).</summary>
public class UserDto
{
    public int Id { get; set; }
    public string Nombre { get; set; } = string.Empty;
    public string Apellido { get; set; } = string.Empty;
    public string Correo { get; set; } = string.Empty;
    public List<string> Roles { get; set; } = new();
    public bool Activo { get; set; }
    public bool SolicitaCambioClave { get; set; }
    public int? SedeId { get; set; }
    public string? SedeNombre { get; set; }
    public DateTime CreadoEn { get; set; }
}
