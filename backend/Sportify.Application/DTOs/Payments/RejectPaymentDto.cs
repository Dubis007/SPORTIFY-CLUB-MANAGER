using System.ComponentModel.DataAnnotations;

namespace Sportify.Application.DTOs.Payments;

/// <summary>DTO para rechazar un pago con comentario de justificación (RN-05).</summary>
public class RejectPaymentDto
{
    [Required(ErrorMessage = "El comentario de rechazo es requerido")]
    [MinLength(10, ErrorMessage = "El comentario debe tener al menos 10 caracteres")]
    public string ComentarioRechazo { get; set; } = string.Empty;
}
