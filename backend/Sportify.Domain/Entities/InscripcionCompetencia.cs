using Sportify.Domain.Enums;

namespace Sportify.Domain.Entities;

public class InscripcionCompetencia
{
    public int Id { get; set; }
    public int CompetenciaId { get; set; }
    public int UsuarioId { get; set; }
    public EstadoInscripcion Estado { get; set; } = EstadoInscripcion.PENDIENTE;
    public DateTime FechaInscripcion { get; set; } = DateTime.UtcNow;

    // Navigation properties
    public virtual Competencia? Competencia { get; set; }
    public virtual Usuario? Usuario { get; set; }
    public virtual EvaluacionCompetencia? Evaluacion { get; set; }
}
