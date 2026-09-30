using System.ComponentModel.DataAnnotations;

namespace Sportify.Application.DTOs.Auth;

/// <summary>DTO para solicitud de inicio de sesión.</summary>
public class LoginDto
{
    [Required(ErrorMessage = "El correo es requerido")]
    [EmailAddress(ErrorMessage = "El correo no es válido")]
    public string Correo { get; set; } = string.Empty;

    [Required(ErrorMessage = "La contraseña es requerida")]
    [MinLength(8, ErrorMessage = "La contraseña debe tener al menos 8 caracteres")]
    public string Contrasena { get; set; } = string.Empty;
}
