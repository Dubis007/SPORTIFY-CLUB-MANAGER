using System.ComponentModel.DataAnnotations;

namespace Sportify.Application.DTOs.Auth;

/// <summary>DTO para solicitar la recuperación de contraseña.</summary>
public class ForgotPasswordDto
{
    [Required(ErrorMessage = "El correo es requerido")]
    [EmailAddress(ErrorMessage = "El correo no es válido")]
    public string Correo { get; set; } = string.Empty;
}
