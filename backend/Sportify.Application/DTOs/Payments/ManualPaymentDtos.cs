using Microsoft.AspNetCore.Http;

namespace Sportify.Application.DTOs.Payments;

public class ManualPaymentDto
{
    public int UsuarioId { get; set; }
    public int? MembresiaId { get; set; }
    public decimal MontoCOP { get; set; }
}

public class ManualPaymentWithReceiptDto
{
    public int UsuarioId { get; set; }
    public int? MembresiaId { get; set; }
    public decimal MontoCOP { get; set; }
    public IFormFile Archivo { get; set; } = null!;
}
