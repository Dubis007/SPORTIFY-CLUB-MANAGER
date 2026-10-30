namespace Sportify.Application.DTOs.Evaluations;

public class EvaluationDto
{
    public int Id { get; set; }
    public int InscripcionId { get; set; }
    public decimal Puntaje { get; set; }
    public int? Posicion { get; set; }
    public string? Desempeno { get; set; }
    public string? Comentarios { get; set; }
    public DateTime EvaluadoEn { get; set; }
    public int EvaluadoPorId { get; set; }
    public string UsuarioNombre { get; set; } = string.Empty;
    public string CompetenciaNombre { get; set; } = string.Empty;
}

public class EvaluationOptionDto
{
    public int Id { get; set; }
    public string UsuarioNombre { get; set; } = string.Empty;
    public string CompetenciaNombre { get; set; } = string.Empty;
    public DateTime FechaInicio { get; set; }
}

public class SaveEvaluationDto
{
    public int InscripcionId { get; set; }
    public decimal Puntaje { get; set; }
    public int? Posicion { get; set; }
    public string? Desempeno { get; set; }
    public string? Comentarios { get; set; }
}
