using System.Reflection;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;
using Sportify.Application.Security;

namespace Sportify.Api.Filters;

/// <summary>
/// Filtro global de acción que inspecciona los DTOs de entrada para rechazar vectores XSS con 400 Bad Request
/// y sanitizar cadenas de texto antes de ejecutar los controladores.
/// </summary>
public class XssInputValidationFilter : IActionFilter
{
    private static readonly HashSet<string> PasswordPropertyNames = new(StringComparer.OrdinalIgnoreCase)
    {
        "Contrasena",
        "Password",
        "CurrentPassword",
        "NewPassword",
        "NuevaContrasena",
        "ConfirmarContrasena"
    };

    public void OnActionExecuting(ActionExecutingContext context)
    {
        foreach (var (argName, argValue) in context.ActionArguments.ToList())
        {
            if (argValue is null || argValue is IFormFile || argValue is CancellationToken)
                continue;

            if (argValue is string strVal)
            {
                if (!PasswordPropertyNames.Contains(argName))
                {
                    if (XssSanitizer.ContainsDangerousXssPayload(strVal))
                    {
                        context.Result = new BadRequestObjectResult(new
                        {
                            message = $"Entrada rechazada por seguridad: el parámetro '{argName}' contiene caracteres o etiquetas potencialmente peligrosas (XSS)."
                        });
                        return;
                    }

                    context.ActionArguments[argName] = XssSanitizer.Sanitize(strVal);
                }
                continue;
            }

            var argType = argValue.GetType();
            if (argType.IsPrimitive || argType.IsEnum || argType == typeof(decimal) || argType == typeof(DateTime))
                continue;

            var properties = argType.GetProperties(BindingFlags.Public | BindingFlags.Instance)
                .Where(p => p.PropertyType == typeof(string) && p.CanRead && p.GetIndexParameters().Length == 0);

            foreach (var prop in properties)
            {
                var currentValue = prop.GetValue(argValue) as string;
                if (string.IsNullOrEmpty(currentValue))
                    continue;

                if (XssSanitizer.ContainsDangerousXssPayload(currentValue))
                {
                    context.Result = new BadRequestObjectResult(new
                    {
                        message = $"Entrada rechazada por seguridad: el campo '{prop.Name}' contiene caracteres o etiquetas potencialmente peligrosas (XSS)."
                    });
                    return;
                }

                if (prop.CanWrite && !PasswordPropertyNames.Contains(prop.Name))
                {
                    prop.SetValue(argValue, XssSanitizer.Sanitize(currentValue));
                }
            }
        }
    }

    public void OnActionExecuted(ActionExecutedContext context)
    {
    }
}
