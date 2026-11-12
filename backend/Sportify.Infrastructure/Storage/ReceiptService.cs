using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using Sportify.Application.Interfaces;
using Sportify.Application.Security;
using Sportify.Domain.Entities;
using Sportify.Infrastructure.Persistence;

namespace Sportify.Infrastructure.Storage;

public class ReceiptService : IReceiptService
{
    private readonly SportifyDbContext _context;
    private readonly IFileStorageService _fileStorageService;
    private readonly IPaymentRepository _paymentRepository;

    public ReceiptService(
        SportifyDbContext context,
        IFileStorageService fileStorageService,
        IPaymentRepository paymentRepository)
    {
        _context = context;
        _fileStorageService = fileStorageService;
        _paymentRepository = paymentRepository;
    }

    public async Task<string> SaveReceiptAsync(int pagoId, IFormFile archivo, int? restrictToUserId = null)
    {
        var pago = await _context.Pagos
            .Include(p => p.Comprobante)
            .FirstOrDefaultAsync(p => p.Id == pagoId)
            ?? throw new KeyNotFoundException($"Pago con ID {pagoId} no encontrado.");

        if (restrictToUserId.HasValue && pago.UsuarioId != restrictToUserId.Value)
        {
            throw new UnauthorizedAccessException("No tiene autorización para adjuntar comprobantes a pagos de otros usuarios.");
        }

        var fileName = await _fileStorageService.SaveFileAsync(archivo, "receipts");
        var relativePath = Path.Combine("receipts", fileName).Replace("\\", "/");
        // El tipo se deriva de la extensión ya validada, no del MIME que declaró el cliente
        var tipoMime = FileUploadValidator.ResolveContentType(fileName);

        if (pago.Comprobante is not null)
        {
            pago.Comprobante.NombreArchivo = archivo.FileName;
            pago.Comprobante.RutaArchivo = relativePath;
            pago.Comprobante.TipoMime = tipoMime;
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
                TipoMime = tipoMime,
                TamanoBytes = archivo.Length,
                SubidoEn = DateTime.UtcNow
            };
            _context.ComprobantesPago.Add(comprobante);
        }

        await _context.SaveChangesAsync();
        return relativePath;
    }

    public async Task<(byte[] contenido, string tipoMime, string nombreArchivo)> GetReceiptAsync(int pagoId, int? restrictToUserId = null)
    {
        var pago = await _paymentRepository.GetByIdAsync(pagoId);

        // Un pago ajeno responde igual que uno sin comprobante: no se revela si existe
        var esAjeno = pago is not null && restrictToUserId.HasValue && pago.UsuarioId != restrictToUserId.Value;
        if (pago?.Comprobante is null || esAjeno)
            throw new KeyNotFoundException($"No existe comprobante registrado para el pago {pagoId}.");

        var rutaArchivo = pago.Comprobante.RutaArchivo;
        var fullPath = _fileStorageService.GetFilePath(rutaArchivo);
        if (!File.Exists(fullPath))
        {
            // Registros antiguos guardaban solo el nombre del archivo, sin la carpeta
            fullPath = _fileStorageService.GetFilePath(Path.Combine("receipts", rutaArchivo));
            if (!File.Exists(fullPath))
                throw new KeyNotFoundException($"El archivo del comprobante del pago {pagoId} no se encontró en el servidor.");
        }

        var bytes = await File.ReadAllBytesAsync(fullPath);
        var extension = Path.GetExtension(rutaArchivo).ToLowerInvariant();

        return (bytes, FileUploadValidator.ResolveContentType(rutaArchivo), $"Comprobante_Pago_{pagoId}{extension}");
    }
}
