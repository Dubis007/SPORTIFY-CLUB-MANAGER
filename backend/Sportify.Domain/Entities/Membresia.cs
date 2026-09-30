using Sportify.Domain.Enums;

namespace Sportify.Domain.Entities;

public class Membresia
{
    public int Id { get; set; }
    public int UsuarioId { get; set; }
    public int PlanMembresiaId { get; set; }
    public DateTime FechaInicio { get; set; }
    public DateTime FechaFin { get; set; }
    public EstadoMembresia Estado { get; set; } = EstadoMembresia.PENDIENTE;
    public DateTime CreadoEn { get; set; } = DateTime.UtcNow;
    public DateTime ActualizadoEn { get; set; } = DateTime.UtcNow;

    // Navigation properties
    public virtual Usuario Usuario { get; set; } = null!;
    public virtual PlanMembresia PlanMembresia { get; set; } = null!;
    public virtual ICollection<Pago> Pagos { get; set; } = new List<Pago>();
}
