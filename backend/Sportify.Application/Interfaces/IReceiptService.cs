using Microsoft.AspNetCore.Http;

namespace Sportify.Application.Interfaces;

/// <summary>Interfaz del servicio de gestión de comprobantes de pago.</summary>
public interface IReceiptService
{
    /// <summary>Guarda el comprobante adjunto a un pago y retorna la ruta del archivo.</summary>
    Task<string> SaveReceiptAsync(int pagoId, IFormFile archivo);

    /// <summary>Obtiene el comprobante de un pago como bytes, tipo MIME y nombre de archivo.</summary>
    Task<(byte[] contenido, string tipoMime, string nombreArchivo)> GetReceiptAsync(int pagoId);
}
