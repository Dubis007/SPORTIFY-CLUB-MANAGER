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
        var maxFileSizeMBStr = _configuration["StorageSettings:MaxFileSizeMB"] ?? "2";
        var allowedExtensionsStr = _configuration["StorageSettings:AllowedExtensions"] ?? ".jpg,.jpeg,.png,.pdf";

        if (!double.TryParse(maxFileSizeMBStr, out var maxFileSizeMB))
            maxFileSizeMB = 2;

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
