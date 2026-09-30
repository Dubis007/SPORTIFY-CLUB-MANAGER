namespace Sportify.Domain.Entities;

public class PlanMembresia
{
    public int Id { get; set; }
    public string Nombre { get; set; } = string.Empty;
    public string Descripcion { get; set; } = string.Empty;
    public decimal PrecioCOP { get; set; }
    public int DuracionDias { get; set; }
    public bool Activo { get; set; } = true;
    public DateTime CreadoEn { get; set; } = DateTime.UtcNow;

    // Navigation properties
    public virtual ICollection<Membresia> Membresias { get; set; } = new List<Membresia>();
}
