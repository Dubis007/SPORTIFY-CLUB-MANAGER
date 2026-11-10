namespace Sportify.Application.Interfaces;

/// <summary>
/// Contexto de Row Level Security (RLS) para aislamiento multi-tenant (Sede/Club) y por titularidad de usuario.
/// </summary>
public interface ITenantRlsContext
{
    int? CurrentTenantId { get; }
    int? CurrentUserId { get; }
    string? CurrentUserRole { get; }
    bool IsRlsEnabled { get; }
    bool IsMemberScoped { get; }

    void EnableRls(int? tenantId, int? userId = null, string? role = null);
    void DisableRls();
}
