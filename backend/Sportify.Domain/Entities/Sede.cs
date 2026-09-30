namespace Sportify.Domain.Entities;

public class Sede
{
    public int Id { get; set; }
    public string Nombre { get; set; } = string.Empty;
    public string Direccion { get; set; } = string.Empty;
    public string Ciudad { get; set; } = string.Empty;
    public string? Telefono { get; set; }
    public bool Activo { get; set; } = true;
    public DateTime CreadoEn { get; set; } = DateTime.UtcNow;

    // Navigation properties
    public virtual ICollection<Entrenamiento> Entrenamientos { get; set; } = new List<Entrenamiento>();
    public virtual ICollection<Usuario> Usuarios { get; set; } = new List<Usuario>();
}
