using Microsoft.AspNetCore.Http;

namespace Sportify.Application.Security;

/// <summary>
/// Validador estricto de archivos cargados (extensión, MIME, tamaño máximo de 5 MB y prevención de doble extensión / Path Traversal).
/// </summary>
public static class FileUploadValidator
{
    public const double DefaultMaxFileSizeMb = 5.0;
    public const long DefaultMaxFileSizeBytes = 5 * 1024 * 1024; // 5 MB (RF-06)

    /// <summary>
    /// Tope del cuerpo de la petición multipart. Deja 1 MB de margen sobre el archivo para los
    /// encabezados del formulario, de modo que un archivo algo mayor a 5 MB llegue al validador
    /// y reciba un 400 legible en lugar de que el servidor corte la conexión.
    /// </summary>
    public const long MaxRequestBodyBytes = DefaultMaxFileSizeBytes + (1024 * 1024);

    private static readonly HashSet<string> DefaultAllowedExtensions = new(StringComparer.OrdinalIgnoreCase)
    {
        ".jpg",
        ".jpeg",
        ".png",
        ".pdf"
    };

    private static readonly HashSet<string> AllowedMimeTypes = new(StringComparer.OrdinalIgnoreCase)
    {
        "image/jpeg",
        "image/jpg",
        "image/png",
        "application/pdf",
        "application/octet-stream"
    };

    private static readonly HashSet<string> DangerousInnerExtensions = new(StringComparer.OrdinalIgnoreCase)
    {
        ".exe", ".dll", ".bat", ".cmd", ".sh", ".ps1", ".php", ".asp", ".aspx", ".jsp", ".js", ".html", ".htm", ".svg"
    };

    public static (bool IsValid, string ErrorMessage) Validate(
        IFormFile? file,
        double maxFileSizeMb = DefaultMaxFileSizeMb,
        IEnumerable<string>? allowedExtensions = null)
    {
        if (file is null || file.Length == 0)
            return (false, "No se proporcionó ningún archivo o el archivo está vacío.");

        var maxBytes = (long)(maxFileSizeMb * 1024 * 1024);
        if (file.Length > maxBytes)
            return (false, $"El archivo excede el tamaño máximo permitido de {maxFileSizeMb:0.##} MB.");

        var rawFileName = file.FileName ?? string.Empty;
        if (rawFileName.Contains("..") || rawFileName.Contains('/') || rawFileName.Contains('\\') || rawFileName.Contains('\0'))
            return (false, "Nombre de archivo inválido por contener secuencias de ruta no permitidas.");

        var safeFileName = Path.GetFileName(rawFileName);
        var ext = Path.GetExtension(safeFileName)?.ToLowerInvariant() ?? string.Empty;

        var validExts = allowedExtensions != null
            ? new HashSet<string>(allowedExtensions.Select(e => e.Trim().ToLowerInvariant()), StringComparer.OrdinalIgnoreCase)
            : DefaultAllowedExtensions;

        if (string.IsNullOrEmpty(ext) || !validExts.Contains(ext))
            return (false, $"Extensión '{ext}' no permitida. Formatos válidos: {string.Join(", ", validExts)}.");

        // Prevenir ataques de doble extensión (ej. malware.php.jpg)
        var nameWithoutLastExt = Path.GetFileNameWithoutExtension(safeFileName);
        var innerExt = Path.GetExtension(nameWithoutLastExt);
        if (!string.IsNullOrEmpty(innerExt) && DangerousInnerExtensions.Contains(innerExt))
            return (false, $"El archivo '{safeFileName}' contiene una doble extensión ejecutable bloqueada por seguridad.");

        if (!string.IsNullOrWhiteSpace(file.ContentType) && !AllowedMimeTypes.Contains(file.ContentType))
            return (false, $"El tipo MIME '{file.ContentType}' no corresponde a un formato permitido (.jpg, .png, .pdf).");

        return (true, string.Empty);
    }

    public static void EnsureValid(
        IFormFile? file,
        double maxFileSizeMb = DefaultMaxFileSizeMb,
        IEnumerable<string>? allowedExtensions = null)
    {
        var (isValid, errorMessage) = Validate(file, maxFileSizeMb, allowedExtensions);
        if (!isValid)
            throw new InvalidOperationException(errorMessage);
    }
}
