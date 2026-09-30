namespace Sportify.Domain.Entities;

public class Entrenamiento
{
    public int Id { get; set; }
    public int SedeId { get; set; }
    public int EntrenadorId { get; set; } // FK a Usuario
    public string Titulo { get; set; } = string.Empty;
    public string Descripcion { get; set; } = string.Empty;
    public DateTime FechaHora { get; set; }
    public DateTime FechaFin { get; set; }
    public int CapacidadMaxima { get; set; }
    public string Estado { get; set; } = "PENDIENTE";
    public DateTime? EliminadoEn { get; set; } // Borrado logico
    public DateTime CreadoEn { get; set; } = DateTime.UtcNow;

    // Navigation properties
    public virtual Sede? Sede { get; set; }
    public virtual Usuario? Entrenador { get; set; }
    public virtual ICollection<Asistencia> Asistencias { get; set; } = new List<Asistencia>();
}
