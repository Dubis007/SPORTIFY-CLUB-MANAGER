using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Sportify.Application.Interfaces;

namespace Sportify.Api.Controllers;

/// <summary>Controlador para generación de reportes PDF con QuestPDF.</summary>
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
