namespace Sportify.Domain.Entities;

public class ComprobantePago
{
    public int Id { get; set; }
    public int PagoId { get; set; }
    public string NombreArchivo { get; set; } = string.Empty;
    public string RutaArchivo { get; set; } = string.Empty;
    public string TipoMime { get; set; } = string.Empty;
    public long TamanoBytes { get; set; }
    public DateTime SubidoEn { get; set; } = DateTime.UtcNow;

    // Navigation properties
    public virtual Pago Pago { get; set; } = null!;
}
