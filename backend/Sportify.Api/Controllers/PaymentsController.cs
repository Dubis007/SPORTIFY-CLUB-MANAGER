using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using Sportify.Application.DTOs.Common;
using Sportify.Application.DTOs.Payments;
using Sportify.Application.Interfaces;

namespace Sportify.Api.Controllers;

[ApiController]
[Route("api/payments")]
[Authorize]
public class PaymentsController : ControllerBase
{
    private readonly IPaymentService _paymentService;

    public PaymentsController(IPaymentService paymentService)
    {
        _paymentService = paymentService;
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
        var options = await _paymentService.GetOptionsAsync();
        return Ok(options);
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

        var pago = await _paymentService.ManualRegisterAsync(aprobadorId, dto);
        return Ok(pago);
    }

    [HttpPost("manual-with-receipt")]
    [Authorize(Roles = "MIEMBRO,CONTADOR,ADMIN")]
    public async Task<IActionResult> ManualWithReceipt([FromForm] ManualPaymentWithReceiptDto dto)
    {
        try
        {
            var result = await _paymentService.ManualWithReceiptAsync(dto);
            return Ok(result);
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
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
