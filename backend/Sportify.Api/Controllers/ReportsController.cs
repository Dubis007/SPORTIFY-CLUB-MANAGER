using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Sportify.Application.Interfaces;
using Sportify.Infrastructure.Persistence;

namespace Sportify.Api.Controllers;

/// <summary>Controlador para generacion de reportes PDF con QuestPDF.</summary>
[ApiController]
[Route("api/reports")]
[Authorize]
public class ReportsController : ControllerBase
{
    private readonly IReportService _reportService;
    private readonly SportifyDbContext _context;

    public ReportsController(IReportService reportService, SportifyDbContext context)
    {
        _reportService = reportService;
        _context = context;
    }

    /// <summary>Genera reporte PDF de todos los pagos.</summary>
    [HttpGet("payments/pdf")]
    [Authorize(Roles = "ADMIN,CONTADOR")]
    [ProducesResponseType(typeof(FileResult), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetPaymentsReport()
    {
        var pagos = await _context.Pagos
            .Include(p => p.Usuario)
            .Include(p => p.AprobadoPor)
            .OrderByDescending(p => p.FechaPago)
            .ToListAsync();

        var pdfBytes = _reportService.GeneratePaymentsReport(pagos);
        var fileName = $"reporte_pagos_{DateTime.Now:yyyyMMdd_HHmmss}.pdf";
        return File(pdfBytes, "application/pdf", fileName);
    }

    /// <summary>Genera reporte PDF de todos los miembros.</summary>
    [HttpGet("members/pdf")]
    [Authorize(Roles = "ADMIN,CONTADOR")]
    [ProducesResponseType(typeof(FileResult), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetMembersReport()
    {
        var usuarios = await _context.Usuarios
            .Include(u => u.UsuarioRoles)
                .ThenInclude(ur => ur.Rol)
            .Where(u => u.Activo)
            .OrderBy(u => u.Apellido)
            .ToListAsync();

        var pdfBytes = _reportService.GenerateMembersReport(usuarios);
        var fileName = $"reporte_miembros_{DateTime.Now:yyyyMMdd_HHmmss}.pdf";
        return File(pdfBytes, "application/pdf", fileName);
    }

    /// <summary>Genera reporte PDF de todas las sedes.</summary>
    [HttpGet("locations/pdf")]
    [Authorize(Roles = "ADMIN,CONTADOR")]
    [ProducesResponseType(typeof(FileResult), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetLocationsReport()
    {
        var sedes = await _context.Sedes
            .OrderBy(s => s.Nombre)
            .ToListAsync();

        var pdfBytes = _reportService.GenerateLocationsReport(sedes);
        var fileName = $"reporte_sedes_{DateTime.Now:yyyyMMdd_HHmmss}.pdf";
        return File(pdfBytes, "application/pdf", fileName);
    }

    /// <summary>Genera reporte PDF de asistencia y desempeño en competencias (Entrenador).</summary>
    [HttpGet("performance/pdf")]
    [Authorize(Roles = "ADMIN,ENTRENADOR")]
    [ProducesResponseType(typeof(FileResult), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetPerformanceReport()
    {
        // Traemos todas las evaluaciones de competencias
        var evaluaciones = await _context.EvaluacionesCompetencia
            .Include(e => e.Inscripcion)
                .ThenInclude(i => i.Competencia)
            .Include(e => e.Inscripcion)
                .ThenInclude(i => i.Usuario)
            .OrderByDescending(e => e.EvaluadoEn)
            .ToListAsync();

        var items = new List<Sportify.Application.DTOs.Reports.PerformanceReportItemDto>();

        foreach (var eval in evaluaciones)
        {
            // Buscamos la ultima asistencia del usuario
            var ultimaAsistencia = await _context.Asistencias
                .Where(a => a.UsuarioId == eval.Inscripcion.UsuarioId && a.Presente)
                .OrderByDescending(a => a.FechaRegistro)
                .Select(a => (DateTime?)a.FechaRegistro)
                .FirstOrDefaultAsync();

            items.Add(new Sportify.Application.DTOs.Reports.PerformanceReportItemDto
            {
                Atleta = $"{eval.Inscripcion.Usuario.Nombre} {eval.Inscripcion.Usuario.Apellido}",
                FechaUltimaAsistencia = ultimaAsistencia,
                Competencia = eval.Inscripcion.Competencia.Nombre,
                FechaCompetencia = eval.Inscripcion.Competencia.FechaInicio,
                Observaciones = eval.Comentarios ?? "Sin observaciones"
            });
        }

        var pdfBytes = _reportService.GeneratePerformanceReport(items);
        var fileName = $"reporte_desempeno_{DateTime.Now:yyyyMMdd_HHmmss}.pdf";
        return File(pdfBytes, "application/pdf", fileName);
    }
}
