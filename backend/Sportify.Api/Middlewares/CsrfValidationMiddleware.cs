using System.Security.Claims;
using Microsoft.AspNetCore.Http;
using Sportify.Application.Interfaces;

namespace Sportify.Api.Middlewares;

/// <summary>
/// Middleware de validación anti-CSRF que verifica la firma e integridad del encabezado X-CSRF-TOKEN
/// en peticiones mutadoras (POST, PUT, PATCH, DELETE) y adjunta tokens de renovación cuando corresponde.
/// </summary>
public class CsrfValidationMiddleware
{
    private static readonly HashSet<string> StateChangingMethods = new(StringComparer.OrdinalIgnoreCase)
    {
        HttpMethods.Post,
        HttpMethods.Put,
        HttpMethods.Patch,
        HttpMethods.Delete
    };

    private readonly RequestDelegate _next;

    public CsrfValidationMiddleware(RequestDelegate next)
    {
        _next = next;
    }

    public async Task InvokeAsync(HttpContext context, IJwtTokenService jwtTokenService)
    {
        var path = context.Request.Path.Value ?? string.Empty;

        if (StateChangingMethods.Contains(context.Request.Method) &&
            !path.StartsWith("/api/auth/", StringComparison.OrdinalIgnoreCase))
        {
            var csrfHeader = context.Request.Headers["X-CSRF-TOKEN"].FirstOrDefault()
                          ?? context.Request.Headers["X-XSRF-TOKEN"].FirstOrDefault();

            if (!string.IsNullOrWhiteSpace(csrfHeader))
            {
                var userIdClaim = context.User?.FindFirst(ClaimTypes.NameIdentifier)?.Value
                               ?? context.User?.FindFirst("sub")?.Value;
                int? expectedUserId = int.TryParse(userIdClaim, out var uid) ? uid : null;

                if (!jwtTokenService.ValidateCsrfToken(csrfHeader, expectedUserId))
                {
                    context.Response.StatusCode = StatusCodes.Status403Forbidden;
                    await context.Response.WriteAsJsonAsync(new
                    {
                        message = "Token CSRF inválido, expirado o no coincidente con la sesión activa."
                    });
                    return;
                }
            }
        }

        await _next(context);
    }
}
