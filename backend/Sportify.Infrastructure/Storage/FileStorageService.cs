using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Configuration;
using Sportify.Application.Interfaces;

namespace Sportify.Infrastructure.Storage;

public class FileStorageService : IFileStorageService
{
    /// <summary>
    /// Carpeta por defecto de los comprobantes. Queda fuera de wwwroot para que ningún archivo subido
    /// pueda servirse como contenido estático: solo se entregan por el endpoint autenticado.
    /// </summary>
    public const string DefaultComprobantesPath = "App_Data/comprobantes";

    private readonly IConfiguration _configuration;

    public FileStorageService(IConfiguration configuration)
    {
        _configuration = configuration;
    }

    public static string ResolveBasePath(IConfiguration configuration)
    {
        var configured = configuration["StorageSettings:ComprobantesPath"];
        return string.IsNullOrWhiteSpace(configured) ? DefaultComprobantesPath : configured.Trim();
    }

    public async Task<string> SaveFileAsync(IFormFile file, string folder)
    {
        var basePath = ResolveBasePath(_configuration);
        var maxFileSizeMBStr = _configuration["StorageSettings:MaxFileSizeMB"] ?? "5";
        var allowedExtensionsStr = _configuration["StorageSettings:AllowedExtensions"] ?? ".jpg,.jpeg,.png,.pdf";

        if (!double.TryParse(maxFileSizeMBStr, out var maxFileSizeMB))
            maxFileSizeMB = Sportify.Application.Security.FileUploadValidator.DefaultMaxFileSizeMb;

        var allowedExtensions = allowedExtensionsStr
            .Split(',', StringSplitOptions.RemoveEmptyEntries)
            .Select(e => e.Trim().ToLowerInvariant())
            .ToHashSet();

        Sportify.Application.Security.FileUploadValidator.EnsureValid(file, maxFileSizeMB, allowedExtensions);
        var originalExtension = Path.GetExtension(Path.GetFileName(file.FileName))?.ToLowerInvariant() ?? string.Empty;

        // Generar nombre unico
        var uniqueFileName = $"{Guid.NewGuid()}{originalExtension}";

        // Directorio destino
        var targetDirectory = Path.Combine(basePath, folder);
        if (!Directory.Exists(targetDirectory))
            Directory.CreateDirectory(targetDirectory);

        // Guardar archivo
        var fullPath = Path.Combine(targetDirectory, uniqueFileName);
        using var stream = new FileStream(fullPath, FileMode.Create);
        await file.CopyToAsync(stream);

        return uniqueFileName;
    }

    public string GetFilePath(string filename)
    {
        var basePath = Path.GetFullPath(ResolveBasePath(_configuration));
        var fullPath = Path.GetFullPath(Path.Combine(basePath, filename));

        // La ruta relativa sale de la base de datos: se confirma que no escape de la carpeta de comprobantes
        var relative = Path.GetRelativePath(basePath, fullPath);
        var escapesBasePath = relative == ".."
            || relative.StartsWith(".." + Path.DirectorySeparatorChar, StringComparison.Ordinal)
            || relative.StartsWith(".." + Path.AltDirectorySeparatorChar, StringComparison.Ordinal)
            || Path.IsPathRooted(relative);

        if (escapesBasePath)
            throw new InvalidOperationException("La ruta del archivo solicitado no es válida.");

        return fullPath;
    }

    public void DeleteFile(string filename)
    {
        var filePath = GetFilePath(filename);
        if (File.Exists(filePath))
            File.Delete(filePath);
    }
}
