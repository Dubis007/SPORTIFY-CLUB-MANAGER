namespace Sportify.Domain.Entities;

public class UsuarioRol
{
    public int Id { get; set; }
    public int UsuarioId { get; set; }
    public int RolId { get; set; }
    public DateTime AsignadoEn { get; set; } = DateTime.UtcNow;

    // Navigation properties
    public virtual Usuario Usuario { get; set; } = null!;
    public virtual Rol Rol { get; set; } = null!;
}
