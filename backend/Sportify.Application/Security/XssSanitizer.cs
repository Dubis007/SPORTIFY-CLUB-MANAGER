using System.Text.RegularExpressions;

namespace Sportify.Application.Security;

/// <summary>
/// Validador y sanitizador centralizado contra ataques Cross-Site Scripting (XSS) e inyección de marcado HTML.
/// </summary>
public static partial class XssSanitizer
{
    [GeneratedRegex(@"<\s*/?\s*(script|iframe|object|embed|svg|link|style|meta|base|form)\b[^>]*>|javascript\s*:|vbscript\s*:|data\s*:\s*text/html|\bon[a-z]{2,}\s*=|eval\s*\(|document\s*\.\s*(cookie|write)", RegexOptions.IgnoreCase | RegexOptions.Compiled)]
    private static partial Regex DangerousXssPattern();

    [GeneratedRegex(@"<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>", RegexOptions.IgnoreCase | RegexOptions.Singleline | RegexOptions.Compiled)]
    private static partial Regex ScriptBlockPattern();

    [GeneratedRegex(@"<[^>]+>", RegexOptions.IgnoreCase | RegexOptions.Compiled)]
    private static partial Regex HtmlTagPattern();

    [GeneratedRegex(@"\bon[a-z]{2,}\s*=\s*(?:""[^""]*""|'[^']*'|[^\s>]+)", RegexOptions.IgnoreCase | RegexOptions.Compiled)]
    private static partial Regex InlineEventPattern();

    [GeneratedRegex(@"(?:javascript|vbscript)\s*:", RegexOptions.IgnoreCase | RegexOptions.Compiled)]
    private static partial Regex DangerousProtocolPattern();

    /// <summary>
    /// Determina si una cadena contiene vectores explícitos de ataque XSS.
    /// </summary>
    public static bool ContainsDangerousXssPayload(string? input)
    {
        if (string.IsNullOrWhiteSpace(input))
            return false;

        return DangerousXssPattern().IsMatch(input);
    }

    /// <summary>
    /// Limpia etiquetas HTML, bloques de script, manejadores de eventos inline y caracteres de control nulos.
    /// </summary>
    public static string? Sanitize(string? input)
    {
        if (input is null)
            return null;

        var cleaned = input.Replace("\0", string.Empty);
        cleaned = ScriptBlockPattern().Replace(cleaned, string.Empty);
        cleaned = InlineEventPattern().Replace(cleaned, string.Empty);
        cleaned = DangerousProtocolPattern().Replace(cleaned, string.Empty);
        cleaned = HtmlTagPattern().Replace(cleaned, string.Empty);
        cleaned = cleaned.Replace("<", string.Empty).Replace(">", string.Empty);

        return cleaned.Trim();
    }

    /// <summary>
    /// Rechaza con <see cref="ArgumentException"/> si detecta payloads XSS y retorna el texto sanitizado.
    /// </summary>
    public static string ValidateAndSanitize(string? input, string fieldName = "campo")
    {
        if (ContainsDangerousXssPayload(input))
        {
            throw new ArgumentException($"El campo '{fieldName}' contiene etiquetas o vectores XSS no permitidos.");
        }

        return Sanitize(input) ?? string.Empty;
    }

    /// <summary>
    /// Versión anulable de <see cref="ValidateAndSanitize"/> para campos opcionales.
    /// </summary>
    public static string? ValidateAndSanitizeOptional(string? input, string fieldName = "campo")
    {
        if (string.IsNullOrWhiteSpace(input))
            return null;

        if (ContainsDangerousXssPayload(input))
        {
            throw new ArgumentException($"El campo '{fieldName}' contiene etiquetas o vectores XSS no permitidos.");
        }

        var sanitized = Sanitize(input);
        return string.IsNullOrWhiteSpace(sanitized) ? null : sanitized;
    }
}
