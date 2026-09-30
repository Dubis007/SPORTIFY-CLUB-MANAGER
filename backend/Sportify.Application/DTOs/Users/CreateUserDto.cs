using System.ComponentModel.DataAnnotations;

namespace Sportify.Application.DTOs.Users;

/// <summary>DTO para la creación de un nuevo usuario en el sistema.</summary>
public class CreateUserDto
{
    [Required(ErrorMessage = "El nombre es requerido")]
    [MaxLength(100, ErrorMessage = "El nombre no puede superar los 100 caracteres")]
    public string Nombre { get; set; } = string.Empty;

    [Required(ErrorMessage = "El apellido es requerido")]
    [MaxLength(100, ErrorMessage = "El apellido no puede superar los 100 caracteres")]
    public string Apellido { get; set; } = string.Empty;

    [Required(ErrorMessage = "El correo es requerido")]
    [EmailAddress(ErrorMessage = "El correo no es válido")]
    public string Correo { get; set; } = string.Empty;

    [Required(ErrorMessage = "La contraseña es requerida")]
    [MinLength(8, ErrorMessage = "La contraseña debe tener al menos 8 caracteres")]
    public string Contrasena { get; set; } = string.Empty;

    /// <summary>Nombre del rol a asignar. Ej: "ADMIN", "MIEMBRO".</summary>
    [Required(ErrorMessage = "El rol es requerido")]
    public string RolNombre { get; set; } = string.Empty;
}
