using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Sportify.Application.Interfaces;

namespace Sportify.Api.Controllers;

/// <summary>Controlador para generación de reportes y colillas PDF con QuestPDF.</summary>
[ApiController]
[Route("api/reports")]
[Authorize]
public class ReportsController : ControllerBase
{
    private readonly IReportService _reportService;

    public ReportsController(IReportService reportService)
    {
        _reportService = reportService;
    }

    /// <summary>Genera reporte PDF de todos los pagos.</summary>
    [HttpGet("payments/pdf")]
    [Authorize(Roles = "ADMIN,CONTADOR")]
    [ProducesResponseType(typeof(FileResult), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetPaymentsReport()
    {
        var pdfBytes = await _reportService.GeneratePaymentsReportAsync();
        var fileName = $"reporte_pagos_{DateTime.Now:yyyyMMdd_HHmmss}.pdf";
        return File(pdfBytes, "application/pdf", fileName);
    }

    /// <summary>Genera colilla/comprobante PDF oficial de un pago individual.</summary>
    [HttpGet("payments/{id:int}/voucher-pdf")]
    [Authorize(Roles = "ADMIN,CONTADOR,MIEMBRO")]
    [ProducesResponseType(typeof(FileResult), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetPaymentVoucherPdf(int id)
    {
        int? restrictToUserId = null;
        if (!User.IsInRole("ADMIN") && !User.IsInRole("CONTADOR"))
        {
            var claimVal = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (!int.TryParse(claimVal, out var currentUserId))
                return Forbid();
            restrictToUserId = currentUserId;
        }

        var pdfBytes = await _reportService.GeneratePaymentVoucherPdfAsync(id, restrictToUserId);
        if (pdfBytes == null)
            return NotFound(new { message = "No se encontró el pago solicitado para emitir la colilla PDF." });

        var fileName = $"colilla_pago_{id}_{DateTime.Now:yyyyMMdd}.pdf";
        return File(pdfBytes, "application/pdf", fileName);
    }

    /// <summary>Genera reporte PDF de todos los miembros.</summary>
    [HttpGet("members/pdf")]
    [Authorize(Roles = "ADMIN,CONTADOR")]
    [ProducesResponseType(typeof(FileResult), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetMembersReport()
    {
        var pdfBytes = await _reportService.GenerateMembersReportAsync();
        var fileName = $"reporte_miembros_{DateTime.Now:yyyyMMdd_HHmmss}.pdf";
        return File(pdfBytes, "application/pdf", fileName);
    }

    /// <summary>Genera reporte PDF de todas las sedes.</summary>
    [HttpGet("locations/pdf")]
    [Authorize(Roles = "ADMIN,CONTADOR")]
    [ProducesResponseType(typeof(FileResult), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetLocationsReport()
    {
        var pdfBytes = await _reportService.GenerateLocationsReportAsync();
        var fileName = $"reporte_sedes_{DateTime.Now:yyyyMMdd_HHmmss}.pdf";
        return File(pdfBytes, "application/pdf", fileName);
    }

    /// <summary>Genera reporte PDF de asistencia y desempeño en competencias (Entrenador).</summary>
    [HttpGet("performance/pdf")]
    [Authorize(Roles = "ADMIN,ENTRENADOR")]
    [ProducesResponseType(typeof(FileResult), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetPerformanceReport()
    {
        var pdfBytes = await _reportService.GeneratePerformanceReportAsync();
        var fileName = $"reporte_desempeno_{DateTime.Now:yyyyMMdd_HHmmss}.pdf";
        return File(pdfBytes, "application/pdf", fileName);
    }
}
