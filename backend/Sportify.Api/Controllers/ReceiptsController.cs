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

    private int? GetUserIdFromToken()
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value
                       ?? User.FindFirst("sub")?.Value;
        return int.TryParse(userIdClaim, out var uid) ? uid : null;
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

        var nombreArchivo = await _receiptService.SaveReceiptAsync(pagoId, archivo, GetUserIdFromToken());
        return Ok(new { message = "Comprobante subido exitosamente.", nombreArchivo });
    }

    /// <summary>
    /// Entrega el comprobante de un pago. ADMIN y CONTADOR ven cualquiera; el MIEMBRO solo el de sus propios pagos
    /// (el titular se toma del JWT, nunca de la petición).
    /// </summary>
    [HttpGet("{id:int}/preview")]
    [Authorize(Roles = "CONTADOR,ADMIN,MIEMBRO")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Preview(int id)
    {
        // Solo el personal contable consulta sin restricción; cualquier otro rol queda limitado a sus pagos
        int? restrictToUserId = null;
        var esPersonalContable = User.IsInRole("ADMIN") || User.IsInRole("CONTADOR");
        if (!esPersonalContable)
        {
            restrictToUserId = GetUserIdFromToken();
            if (restrictToUserId is null)
                return Unauthorized();
        }

        var (contenido, tipoMime, nombreArchivo) = await _receiptService.GetReceiptAsync(id, restrictToUserId);

        // Documento financiero privado: no debe quedar en cachés del navegador ni de intermediarios
        Response.Headers.CacheControl = "no-store";
        return File(contenido, tipoMime, nombreArchivo);
    }
}
