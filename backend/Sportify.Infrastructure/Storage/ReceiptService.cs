using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using Sportify.Application.Interfaces;
using Sportify.Domain.Entities;
using Sportify.Infrastructure.Persistence;

namespace Sportify.Infrastructure.Storage;

public class ReceiptService : IReceiptService
{
    private readonly SportifyDbContext _context;
    private readonly IFileStorageService _fileStorageService;

    public ReceiptService(SportifyDbContext context, IFileStorageService fileStorageService)
    {
        _context = context;
        _fileStorageService = fileStorageService;
    }

    public async Task<string> SaveReceiptAsync(int pagoId, IFormFile archivo)
    {
        var pago = await _context.Pagos
            .Include(p => p.Comprobante)
            .FirstOrDefaultAsync(p => p.Id == pagoId)
            ?? throw new KeyNotFoundException($"Pago con ID {pagoId} no encontrado.");

        var fileName = await _fileStorageService.SaveFileAsync(archivo, "receipts");
        var relativePath = Path.Combine("receipts", fileName).Replace("\\", "/");

        if (pago.Comprobante is not null)
        {
            pago.Comprobante.NombreArchivo = archivo.FileName;
            pago.Comprobante.RutaArchivo = relativePath;
            pago.Comprobante.TipoMime = string.IsNullOrWhiteSpace(archivo.ContentType) ? "application/pdf" : archivo.ContentType;
            pago.Comprobante.TamanoBytes = archivo.Length;
            pago.Comprobante.SubidoEn = DateTime.UtcNow;
        }
        else
        {
            var comprobante = new ComprobantePago
            {
                PagoId = pagoId,
                NombreArchivo = archivo.FileName,
                RutaArchivo = relativePath,
                TipoMime = string.IsNullOrWhiteSpace(archivo.ContentType) ? "application/pdf" : archivo.ContentType,
                TamanoBytes = archivo.Length,
                SubidoEn = DateTime.UtcNow
            };
            _context.ComprobantesPago.Add(comprobante);
        }

        await _context.SaveChangesAsync();
        return relativePath;
    }

    public async Task<(byte[] contenido, string tipoMime, string nombreArchivo)> GetReceiptAsync(int pagoId)
    {
        var comprobante = await _context.ComprobantesPago
            .AsNoTracking()
            .FirstOrDefaultAsync(c => c.PagoId == pagoId)
            ?? throw new KeyNotFoundException($"No existe comprobante registrado para el pago {pagoId}.");

        var fullPath = _fileStorageService.GetFilePath(comprobante.RutaArchivo);
        if (!File.Exists(fullPath))
        {
            var altPath = _fileStorageService.GetFilePath(Path.Combine("receipts", comprobante.RutaArchivo));
            if (File.Exists(altPath))
            {
                fullPath = altPath;
            }
            else
            {
                throw new FileNotFoundException($"El archivo físico del comprobante no se encontró en el servidor.");
            }
        }

        var bytes = await File.ReadAllBytesAsync(fullPath);
        var mime = string.IsNullOrWhiteSpace(comprobante.TipoMime) ? "application/pdf" : comprobante.TipoMime;
        var name = string.IsNullOrWhiteSpace(comprobante.NombreArchivo) ? $"comprobante_{pagoId}.pdf" : comprobante.NombreArchivo;

        return (bytes, mime, name);
    }
}
