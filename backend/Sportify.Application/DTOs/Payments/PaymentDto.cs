namespace Sportify.Application.DTOs.Payments;

/// <summary>DTO de respuesta con la información de un pago.</summary>
public class PaymentDto
{
    public int Id { get; set; }
    public int UsuarioId { get; set; }
    public string NombreUsuario { get; set; } = string.Empty;
    public decimal MontoCOP { get; set; }

    /// <summary>Estado del pago: PENDIENTE, APROBADO, RECHAZADO.</summary>
    public string Estado { get; set; } = string.Empty;

    public DateTime FechaPago { get; set; }
    public DateTime? FechaAprobacion { get; set; }
    public string? NombreAprobador { get; set; }
    public string? ComentarioRechazo { get; set; }

    /// <summary>Indica si el pago tiene un comprobante adjunto.</summary>
    public bool TieneComprobante { get; set; }
}
