using System.ComponentModel.DataAnnotations;
using Microsoft.AspNetCore.Http;

namespace Sportify.Application.DTOs.Payments;

public class ManualPaymentDto
{
    [Required(ErrorMessage = "El usuario es requerido")]
    [Range(1, int.MaxValue, ErrorMessage = "El identificador de usuario no es válido")]
    public int UsuarioId { get; set; }

    public int? MembresiaId { get; set; }

    [Required(ErrorMessage = "El monto es requerido")]
    [Range(1000, double.MaxValue, ErrorMessage = "El monto mínimo es de $1.000 COP")]
    public decimal MontoCOP { get; set; }
}

public class ManualPaymentWithReceiptDto
{
    [Range(1, int.MaxValue, ErrorMessage = "El identificador de usuario no es válido")]
    public int UsuarioId { get; set; }

    public int? MembresiaId { get; set; }

    [Required(ErrorMessage = "El monto es requerido")]
    [Range(1000, double.MaxValue, ErrorMessage = "El monto mínimo es de $1.000 COP")]
    public decimal MontoCOP { get; set; }

    [Required(ErrorMessage = "El archivo de comprobante es obligatorio")]
    public IFormFile Archivo { get; set; } = null!;
}
