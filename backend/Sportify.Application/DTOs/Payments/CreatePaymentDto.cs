using System.ComponentModel.DataAnnotations;

namespace Sportify.Application.DTOs.Payments;

/// <summary>DTO para registrar un nuevo pago en el sistema.</summary>
public class CreatePaymentDto
{
    /// <summary>ID de la membresía asociada al pago (opcional).</summary>
    public int? MembresiaId { get; set; }

    [Required(ErrorMessage = "El monto es requerido")]
    [Range(1000, double.MaxValue, ErrorMessage = "El monto mínimo es de $1.000 COP")]
    public decimal MontoCOP { get; set; }
}
