using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Sportify.Application.Interfaces;

namespace Sportify.Api.Controllers;

[ApiController]
[Route("api/receipts")]
[Authorize]
public class ReceiptsController : ControllerBase
{
    private readonly IReceiptService _receiptService;

    public ReceiptsController(IReceiptService receiptService)
    {
        _receiptService = receiptService;
    }

    /// <summary>Sube un comprobante de pago (multipart/form-data). [MIEMBRO]</summary>
    [HttpPost]
    [Authorize(Roles = "MIEMBRO")]
    [RequestSizeLimit(10 * 1024 * 1024)] // 10 MB limite HTTP
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> Upload([FromForm] int pagoId, IFormFile archivo)
    {
        if (archivo is null || archivo.Length == 0)
            return BadRequest(new { message = "No se proporciono ningun archivo." });

        var nombreArchivo = await _receiptService.SaveReceiptAsync(pagoId, archivo);
        return Ok(new { message = "Comprobante subido exitosamente.", nombreArchivo });
    }

    /// <summary>Previsualiza/descarga un comprobante. [CONTADOR, ADMIN]</summary>
    [HttpGet("{id:int}/preview")]
    [Authorize(Roles = "CONTADOR,ADMIN")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Preview(int id)
    {
        var (contenido, tipoMime, nombreArchivo) = await _receiptService.GetReceiptAsync(id);
        return File(contenido, tipoMime, nombreArchivo);
    }
}
