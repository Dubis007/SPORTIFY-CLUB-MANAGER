using System.Security.Claims;
using Sportify.Application.Interfaces;

namespace Sportify.Api.Middlewares;

/// <summary>
/// Middleware que inicializa el contexto de Row Level Security (RLS) cuando la solicitud
/// incluye el encabezado multi-tenant <c>X-Tenant-Id</c> o el claim <c>tenant_id</c>.
/// </summary>
public sealed class TenantRlsMiddleware
{
    private readonly RequestDelegate _next;

    public TenantRlsMiddleware(RequestDelegate next)
    {
        _next = next;
    }

    public async Task InvokeAsync(HttpContext context, ITenantRlsContext rlsContext)
    {
        int? tenantId = null;

        if (context.Request.Headers.TryGetValue("X-Tenant-Id", out var tenantHeader) &&
            int.TryParse(tenantHeader.FirstOrDefault(), out var parsedHeaderTenant) &&
            parsedHeaderTenant > 0)
        {
            tenantId = parsedHeaderTenant;
        }
        else if (int.TryParse(context.User.FindFirst("tenant_id")?.Value ?? context.User.FindFirst("sede_id")?.Value, out var parsedClaimTenant) &&
                 parsedClaimTenant > 0)
        {
            tenantId = parsedClaimTenant;
        }

        var userIdStr = context.User.FindFirst(ClaimTypes.NameIdentifier)?.Value
                     ?? context.User.FindFirst("sub")?.Value;
        int? userId = int.TryParse(userIdStr, out var parsedUserId) ? parsedUserId : null;
        var role = context.User.FindFirst(ClaimTypes.Role)?.Value
                ?? context.User.FindFirst("role")?.Value;

        if (tenantId.HasValue)
        {
            rlsContext.EnableRls(tenantId, userId, role);
        }

        try
        {
            await _next(context);
        }
        finally
        {
            rlsContext.DisableRls();
        }
    }
}
