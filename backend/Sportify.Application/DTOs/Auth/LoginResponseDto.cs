namespace Sportify.Application.DTOs.Auth;

/// <summary>DTO de respuesta tras un inicio de sesión exitoso.</summary>
public class LoginResponseDto
{
    /// <summary>JWT generado para la sesión.</summary>
    public string Token { get; set; } = string.Empty;

    /// <summary>Fecha y hora de expiración del token.</summary>
    public DateTime TokenExpira { get; set; }

    /// <summary>Información básica del usuario autenticado.</summary>
    public UsuarioInfoDto Usuario { get; set; } = new();
}

/// <summary>Datos básicos del usuario incluidos en la respuesta de login.</summary>
public class UsuarioInfoDto
{
    public int Id { get; set; }
    public string Nombre { get; set; } = string.Empty;
    public string Apellido { get; set; } = string.Empty;
    public string Correo { get; set; } = string.Empty;
    public string Rol { get; set; } = string.Empty;
}
