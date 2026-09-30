namespace Sportify.Domain.Entities;

public class Asistencia
{
    public int Id { get; set; }
    public int EntrenamientoId { get; set; }
    public int UsuarioId { get; set; }
    public DateTime FechaRegistro { get; set; } = DateTime.UtcNow;
    public bool Presente { get; set; }
    public string? Observaciones { get; set; }

    // Navigation properties
    public virtual Entrenamiento Entrenamiento { get; set; } = null!;
    public virtual Usuario Usuario { get; set; } = null!;
}
