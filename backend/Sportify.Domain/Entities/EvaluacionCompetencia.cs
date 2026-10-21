namespace Sportify.Domain.Entities;

public class EvaluacionCompetencia
{
    public int Id { get; set; }
    public int InscripcionId { get; set; }
    public decimal Puntaje { get; set; }
    public int? Posicion { get; set; }
    public string? Desempeno { get; set; } // Mejorar, Bueno, Excelente, SOBRESALIENTE
    public string? Comentarios { get; set; }
    public DateTime EvaluadoEn { get; set; } = DateTime.UtcNow;
    public int EvaluadoPorId { get; set; } // FK a Usuario

    // Navigation properties
    public virtual InscripcionCompetencia Inscripcion { get; set; } = null!;
    public virtual Usuario? EvaluadoPor { get; set; }
}
