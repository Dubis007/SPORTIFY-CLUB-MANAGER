using System.ComponentModel.DataAnnotations;

namespace Sportify.Application.DTOs.Auth;

/// <summary>DTO para restablecer la contraseña mediante un PIN de verificación.</summary>
public class ResetPasswordDto
{
    [Required(ErrorMessage = "El correo es requerido")]
    [EmailAddress(ErrorMessage = "El correo no es válido")]
    public string Correo { get; set; } = string.Empty;

    [Required(ErrorMessage = "El PIN es requerido")]
    [StringLength(6, MinimumLength = 6, ErrorMessage = "El PIN debe tener exactamente 6 caracteres")]
    public string Pin { get; set; } = string.Empty;

    [Required(ErrorMessage = "La nueva contraseña es requerida")]
    [MinLength(8, ErrorMessage = "La contraseña debe tener al menos 8 caracteres")]
    public string NuevaContrasena { get; set; } = string.Empty;

    [Required(ErrorMessage = "La confirmación de contraseña es requerida")]
    public string ConfirmarContrasena { get; set; } = string.Empty;
}
