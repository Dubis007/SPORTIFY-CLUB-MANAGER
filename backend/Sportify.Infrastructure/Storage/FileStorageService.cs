using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Configuration;
using Sportify.Application.Interfaces;

namespace Sportify.Infrastructure.Storage;

public class FileStorageService : IFileStorageService
{
    private readonly IConfiguration _configuration;

    public FileStorageService(IConfiguration configuration)
    {
        _configuration = configuration;
    }

    public async Task<string> SaveFileAsync(IFormFile file, string folder)
    {
        var basePath = _configuration["StorageSettings:ComprobantesPath"]
            ?? throw new InvalidOperationException("StorageSettings:ComprobantesPath no esta configurado.");
        var maxFileSizeMBStr = _configuration["StorageSettings:MaxFileSizeMB"] ?? "5";
        var allowedExtensionsStr = _configuration["StorageSettings:AllowedExtensions"] ?? ".jpg,.jpeg,.png,.pdf";

        if (!double.TryParse(maxFileSizeMBStr, out var maxFileSizeMB))
            maxFileSizeMB = 5;

        var allowedExtensions = allowedExtensionsStr
            .Split(',', StringSplitOptions.RemoveEmptyEntries)
            .Select(e => e.Trim().ToLowerInvariant())
            .ToHashSet();

        // Validar extension
        var originalExtension = Path.GetExtension(file.FileName)?.ToLowerInvariant() ?? string.Empty;
        if (!allowedExtensions.Contains(originalExtension))
            throw new InvalidOperationException(
                $"Extension '{originalExtension}' no permitida. Extensiones validas: {allowedExtensionsStr}");

        // Validar tamano en bytes
        var maxBytes = (long)(maxFileSizeMB * 1024 * 1024);
        if (file.Length > maxBytes)
            throw new InvalidOperationException(
                $"El archivo excede el tamano maximo permitido de {maxFileSizeMB} MB.");

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
        var basePath = _configuration["StorageSettings:ComprobantesPath"]
            ?? throw new InvalidOperationException("StorageSettings:ComprobantesPath no esta configurado.");
        return Path.Combine(basePath, filename);
    }

    public void DeleteFile(string filename)
    {
        var filePath = GetFilePath(filename);
        if (File.Exists(filePath))
            File.Delete(filePath);
    }
}
