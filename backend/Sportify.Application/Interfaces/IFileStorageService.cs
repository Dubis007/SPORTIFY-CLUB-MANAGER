using Microsoft.AspNetCore.Http;

namespace Sportify.Application.Interfaces;

public interface IFileStorageService
{
    Task<string> SaveFileAsync(IFormFile file, string folder);
    string GetFilePath(string filename);
    void DeleteFile(string filename);
}
