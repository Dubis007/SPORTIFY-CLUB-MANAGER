using Sportify.Domain.Enums;

namespace Sportify.Domain.Entities;

public class Pago
{
    public int Id { get; set; }
    public int UsuarioId { get; set; }
    public int? MembresiaId { get; set; }
    public decimal MontoCOP { get; set; }
    public EstadoPago Estado { get; set; } = EstadoPago.PENDIENTE;
    public DateTime FechaPago { get; set; } = DateTime.UtcNow;
    public DateTime? FechaAprobacion { get; set; }
    public int? AprobadoPorId { get; set; }
    public string? ComentarioRechazo { get; set; }
    public DateTime? EliminadoEn { get; set; } // Borrado logico
    public DateTime CreadoEn { get; set; } = DateTime.UtcNow;
    public DateTime ActualizadoEn { get; set; } = DateTime.UtcNow;

    // Navigation properties
    public virtual Usuario Usuario { get; set; } = null!;
    public virtual Membresia? Membresia { get; set; }
    public virtual Usuario? AprobadoPor { get; set; }
    public virtual ComprobantePago? Comprobante { get; set; }
}
