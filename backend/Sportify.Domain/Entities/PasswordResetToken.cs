namespace Sportify.Domain.Entities;

public class PasswordResetToken
{
    public int Id { get; set; }
    public int UsuarioId { get; set; }
    public string CodigoHash { get; set; } = string.Empty;
    public DateTime Expiracion { get; set; }
    public bool Usado { get; set; } = false;
    public DateTime CreadoEn { get; set; } = DateTime.UtcNow;

    public virtual Usuario Usuario { get; set; } = null!;
}
