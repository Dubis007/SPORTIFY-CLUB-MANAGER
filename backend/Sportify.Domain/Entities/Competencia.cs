namespace Sportify.Domain.Entities;

public class Competencia
{
    public int Id { get; set; }
    public string Nombre { get; set; } = string.Empty;
    public string Descripcion { get; set; } = string.Empty;
    public DateTime FechaInicio { get; set; }
    public DateTime FechaFin { get; set; }
    public string Ubicacion { get; set; } = string.Empty;
    public DateTime? EliminadoEn { get; set; } // Borrado logico
    public DateTime CreadoEn { get; set; } = DateTime.UtcNow;

    // Navigation properties
    public virtual ICollection<InscripcionCompetencia> Inscripciones { get; set; } = new List<InscripcionCompetencia>();
}
