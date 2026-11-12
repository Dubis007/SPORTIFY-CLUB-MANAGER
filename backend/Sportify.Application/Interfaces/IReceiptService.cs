using Microsoft.AspNetCore.Http;

namespace Sportify.Application.Interfaces;

/// <summary>Interfaz del servicio de gestión de comprobantes de pago.</summary>
public interface IReceiptService
{
    /// <summary>Guarda el comprobante adjunto a un pago (validando titularidad cuando se indica <paramref name="restrictToUserId"/>) y retorna la ruta del archivo.</summary>
    Task<string> SaveReceiptAsync(int pagoId, IFormFile archivo, int? restrictToUserId = null);

    /// <summary>
    /// Obtiene el comprobante de un pago como bytes, tipo MIME y nombre de archivo.
    /// Con <paramref name="restrictToUserId"/> solo lo entrega si el pago pertenece a ese usuario;
    /// un pago ajeno se informa igual que uno sin comprobante (<see cref="KeyNotFoundException"/>).
    /// </summary>
    Task<(byte[] contenido, string tipoMime, string nombreArchivo)> GetReceiptAsync(int pagoId, int? restrictToUserId = null);
}
