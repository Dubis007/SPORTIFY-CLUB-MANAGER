using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using Sportify.Application.DTOs.Common;
using Sportify.Application.DTOs.Payments;
using Sportify.Application.Interfaces;
using Sportify.Domain.Entities;
using Sportify.Domain.Enums;
using Sportify.Infrastructure.Persistence;

namespace Sportify.Api.Controllers;

[ApiController]
[Route("api/payments")]
[Authorize]
public class PaymentsController : ControllerBase
{
    private readonly IPaymentService _paymentService;
    private readonly SportifyDbContext _context;

    public PaymentsController(IPaymentService paymentService, SportifyDbContext context)
    {
        _paymentService = paymentService;
        _context = context;
    }

    [HttpGet]
    [Authorize(Roles = "ADMIN,CONTADOR")]
    [ProducesResponseType(typeof(PagedResult<PaymentDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetAll([FromQuery] PaginationParams pagination)
    {
        var payments = await _paymentService.GetPagedAsync(pagination);
        return Ok(payments);
    }

    [HttpGet("summary")]
    [Authorize(Roles = "ADMIN,CONTADOR")]
    [ProducesResponseType(typeof(PaymentSummaryDto), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetSummary()
    {
        var summary = await _paymentService.GetSummaryAsync();
        return Ok(summary);
    }

    [HttpGet("options")]
    [Authorize(Roles = "CONTADOR,ADMIN")]
    public async Task<IActionResult> GetOptions()
    {
        // Usuarios que sean MIEMBROS
        var members = await _context.Usuarios
            .Include(u => u.UsuarioRoles)
            .ThenInclude(ur => ur.Rol)
            .Where(u => u.Activo && u.UsuarioRoles.Any(ur => ur.Rol.Nombre == "MIEMBRO"))
            .Select(u => new { u.Id, u.Nombre, u.Apellido })
            .OrderBy(u => u.Nombre)
            .ToListAsync();

        // Membresias activas, suspendidas o vencidas, o planes
        var memberships = await _context.Membresias
            .Include(m => m.PlanMembresia)
            .Select(m => new { 
                m.Id, 
                m.UsuarioId, 
                m.Estado, 
                Plan = m.PlanMembresia.Nombre,
                m.FechaInicio,
                m.FechaFin
            })
            .ToListAsync();
            
        return Ok(new { Members = members, Memberships = memberships });
    }

    [HttpPost]
    [Authorize(Roles = "MIEMBRO")]
    [ProducesResponseType(typeof(PaymentDto), StatusCodes.Status201Created)]
    public async Task<IActionResult> Create([FromBody] CreatePaymentDto dto)
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value
                       ?? User.FindFirst("sub")?.Value;
        if (!int.TryParse(userIdClaim, out var userId))
            return Unauthorized();

        var payment = await _paymentService.CreateAsync(userId, dto);
        return CreatedAtAction(nameof(GetAll), payment);
    }
    
    [HttpPost("manual")]
    [Authorize(Roles = "CONTADOR")]
    public async Task<IActionResult> ManualRegister([FromBody] ManualPaymentDto dto)
    {
        var aprobadorIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value
                            ?? User.FindFirst("sub")?.Value;
        if (!int.TryParse(aprobadorIdClaim, out var aprobadorId))
            return Unauthorized();

        var pago = new Pago
        {
            UsuarioId = dto.UsuarioId,
            MembresiaId = dto.MembresiaId,
            MontoCOP = dto.MontoCOP,
            Estado = EstadoPago.APROBADO,
            FechaPago = DateTime.UtcNow,
            FechaAprobacion = DateTime.UtcNow,
            AprobadoPorId = aprobadorId
        };

        _context.Pagos.Add(pago);
        
        if (dto.MembresiaId.HasValue) 
        {
            var membresia = await _context.Membresias.FindAsync(dto.MembresiaId);
            if (membresia != null && membresia.Estado != EstadoMembresia.ACTIVA)
            {
                membresia.Estado = EstadoMembresia.ACTIVA;
            }
        }
        
        await _context.SaveChangesAsync();
        
        return Ok(pago);
    }

    [HttpPost("manual-with-receipt")]
    [Authorize(Roles = "MIEMBRO,CONTADOR,ADMIN")]
    public async Task<IActionResult> ManualWithReceipt([FromForm] ManualPaymentWithReceiptDto dto)
    {
        // 1. Guardar el archivo en el sistema de archivos
        if (dto.Archivo == null || dto.Archivo.Length == 0)
            return BadRequest(new { message = "Se requiere un archivo PDF/Imagen válido." });

        var uploadsFolder = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "uploads", "receipts");
        if (!Directory.Exists(uploadsFolder))
            Directory.CreateDirectory(uploadsFolder);

        var uniqueFileName = Guid.NewGuid().ToString() + "_" + dto.Archivo.FileName;
        var filePath = Path.Combine(uploadsFolder, uniqueFileName);

        using (var stream = new FileStream(filePath, FileMode.Create))
        {
            await dto.Archivo.CopyToAsync(stream);
        }

        // 2. Crear el pago primero
        var pago = new Pago
        {
            UsuarioId = dto.UsuarioId,
            MembresiaId = dto.MembresiaId,
            MontoCOP = dto.MontoCOP,
            Estado = EstadoPago.PENDIENTE,
            FechaPago = DateTime.UtcNow
        };
        _context.Pagos.Add(pago);
        await _context.SaveChangesAsync();

        // 3. Crear el registro en ComprobantesPago
        var comprobante = new ComprobantePago
        {
            PagoId = pago.Id,
            RutaArchivo = "/uploads/receipts/" + uniqueFileName,
            NombreArchivo = dto.Archivo.FileName,
            TipoMime = dto.Archivo.ContentType,
            TamanoBytes = dto.Archivo.Length,
            SubidoEn = DateTime.UtcNow
        };
        _context.ComprobantesPago.Add(comprobante);
        await _context.SaveChangesAsync();
        
        return Ok(new { message = "Comprobante subido exitosamente y pago en estado PENDIENTE." });
    }

    [HttpPatch("{id:int}/approve")]
    [Authorize(Roles = "CONTADOR")]
    [ProducesResponseType(typeof(PaymentDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Approve(int id)
    {
        var aprobadorIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value
                            ?? User.FindFirst("sub")?.Value;
        if (!int.TryParse(aprobadorIdClaim, out var aprobadorId))
            return Unauthorized();

        var payment = await _paymentService.ApproveAsync(id, aprobadorId);
        return Ok(payment);
    }

    [HttpPatch("{id:int}/reject")]
    [Authorize(Roles = "CONTADOR")]
    [ProducesResponseType(typeof(PaymentDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> Reject(int id, [FromBody] RejectPaymentDto dto)
    {
        var aprobadorIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value
                            ?? User.FindFirst("sub")?.Value;
        if (!int.TryParse(aprobadorIdClaim, out var aprobadorId))
            return Unauthorized();

        var payment = await _paymentService.RejectAsync(id, aprobadorId, dto);
        return Ok(payment);
    }
}

public class ManualPaymentDto
{
    public int UsuarioId { get; set; }
    public int? MembresiaId { get; set; }
    public decimal MontoCOP { get; set; }
}

public class ManualPaymentWithReceiptDto
{
    public int UsuarioId { get; set; }
    public int? MembresiaId { get; set; }
    public decimal MontoCOP { get; set; }
    public IFormFile Archivo { get; set; }
}
