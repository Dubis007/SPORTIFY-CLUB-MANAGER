using Microsoft.AspNetCore.Diagnostics;
using Microsoft.AspNetCore.Mvc;

namespace Sportify.Api.Middlewares;

public class GlobalExceptionHandler : IExceptionHandler
{
    private readonly ILogger<GlobalExceptionHandler> _logger;

    public GlobalExceptionHandler(ILogger<GlobalExceptionHandler> logger)
    {
        _logger = logger;
    }

    public async ValueTask<bool> TryHandleAsync(HttpContext httpContext, Exception exception, CancellationToken cancellationToken)
    {
        var (statusCode, title, detail) = exception switch
        {
            UnauthorizedAccessException ex => (
                StatusCodes.Status401Unauthorized,
                "Acceso no autorizado",
                ex.Message),
            KeyNotFoundException ex => (
                StatusCodes.Status404NotFound,
                "Recurso no encontrado",
                ex.Message),
            ArgumentException ex => (
                StatusCodes.Status400BadRequest,
                "Solicitud inválida",
                ex.Message),
            InvalidOperationException ex => (
                StatusCodes.Status400BadRequest,
                "Violación de regla de negocio",
                ex.Message),
            _ => (
                StatusCodes.Status500InternalServerError,
                "Error interno del servidor",
                "Ocurrio un error inesperado al procesar la solicitud. Por favor contacte al soporte si el problema persiste.")
        };

        if (statusCode == StatusCodes.Status500InternalServerError)
        {
            _logger.LogError(exception, "Ocurrio un error no controlado: {Message}", exception.Message);
        }
        else
        {
            _logger.LogWarning("Excepción controlada ({StatusCode}): {Message}", statusCode, exception.Message);
        }

        var problemDetails = new ProblemDetails
        {
            Status = statusCode,
            Title = title,
            Detail = detail,
            Instance = httpContext.Request.Path
        };

        httpContext.Response.StatusCode = statusCode;
        await httpContext.Response.WriteAsJsonAsync(problemDetails, cancellationToken);

        return true;
    }
}
