using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Sportify.Application.Interfaces;
using Sportify.Application.Security;

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

    /// <summary>Sube un comprobante de pago validando formato (.jpg/.jpeg/.png/.pdf) y límite de 5 MB. [MIEMBRO]</summary>
    [HttpPost]
    [Authorize(Roles = "MIEMBRO")]
    [RequestSizeLimit(FileUploadValidator.MaxRequestBodyBytes)] // 5 MB de archivo + margen del formulario multipart
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> Upload([FromForm] int pagoId, IFormFile archivo)
    {
        var validation = FileUploadValidator.Validate(archivo);
        if (!validation.IsValid)
            return BadRequest(new { message = validation.ErrorMessage });

        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value
                       ?? User.FindFirst("sub")?.Value;
        int? restrictToUserId = int.TryParse(userIdClaim, out var uid) ? uid : null;

        var nombreArchivo = await _receiptService.SaveReceiptAsync(pagoId, archivo, restrictToUserId);
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
