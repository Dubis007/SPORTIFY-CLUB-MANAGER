using Sportify.Application.Interfaces;

namespace Sportify.Infrastructure.Security;

/// <summary>
/// Implementación del contexto de Row Level Security (RLS) basada en AsyncLocal para compatibilidad con DbContextPooling.
/// </summary>
public sealed class TenantRlsContext : ITenantRlsContext
{
    public sealed record RlsSnapshot(
        int? TenantId,
        int? UserId,
        string? Role,
        bool IsEnabled)
    {
        public bool IsMemberScoped =>
            IsEnabled && string.Equals(Role, "MIEMBRO", StringComparison.OrdinalIgnoreCase);
    }

    private static readonly AsyncLocal<RlsSnapshot?> CurrentSnapshot = new();

    public static RlsSnapshot? Current => CurrentSnapshot.Value;

    public int? CurrentTenantId => CurrentSnapshot.Value?.TenantId;
    public int? CurrentUserId => CurrentSnapshot.Value?.UserId;
    public string? CurrentUserRole => CurrentSnapshot.Value?.Role;
    public bool IsRlsEnabled => CurrentSnapshot.Value?.IsEnabled ?? false;
    public bool IsMemberScoped => CurrentSnapshot.Value?.IsMemberScoped ?? false;

    public void EnableRls(int? tenantId, int? userId = null, string? role = null)
    {
        CurrentSnapshot.Value = new RlsSnapshot(tenantId, userId, role, IsEnabled: true);
    }

    public void DisableRls()
    {
        CurrentSnapshot.Value = null;
    }
}
