using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Sportify.Application.DTOs.Dashboard;
using Sportify.Domain.Enums;
using Sportify.Infrastructure.Persistence;

namespace Sportify.Api.Controllers;

/// <summary>Métricas para el dashboard de administración (el frontend las consulta periódicamente).</summary>
[ApiController]
[Route("api/dashboard")]
[Authorize(Roles = "ADMIN")]
public class DashboardController : ControllerBase
{
    private const int MesesSerie = 6;

    private readonly SportifyDbContext _context;

    public DashboardController(SportifyDbContext context)
    {
        _context = context;
    }

    [HttpGet("stats")]
    [ProducesResponseType(typeof(DashboardStatsDto), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetStats()
    {
        var ahora = DateTime.UtcNow;
        var inicioMes = new DateTime(ahora.Year, ahora.Month, 1, 0, 0, 0, DateTimeKind.Utc);
        var inicioSerie = inicioMes.AddMonths(-(MesesSerie - 1));

        // El HasQueryFilter del DbContext ya excluye pagos con EliminadoEn != null
        var usuariosActivos = await _context.Usuarios.CountAsync(u => u.Activo);
        var membresiasActivas = await _context.Membresias.CountAsync(m => m.Estado == EstadoMembresia.ACTIVA);
        var pagosPendientes = await _context.Pagos.CountAsync(p => p.Estado == EstadoPago.PENDIENTE);
        var ingresosMes = await _context.Pagos
            .Where(p => p.Estado == EstadoPago.APROBADO && p.FechaPago >= inicioMes)
            .SumAsync(p => p.MontoCOP);

        var ingresosAgrupados = await _context.Pagos
            .Where(p => p.Estado == EstadoPago.APROBADO && p.FechaPago >= inicioSerie)
            .GroupBy(p => new { p.FechaPago.Year, p.FechaPago.Month })
            .Select(g => new { g.Key.Year, g.Key.Month, Total = g.Sum(p => p.MontoCOP) })
            .ToListAsync();

        var usuariosAgrupados = await _context.Usuarios
            .Where(u => u.CreadoEn >= inicioSerie)
            .GroupBy(u => new { u.CreadoEn.Year, u.CreadoEn.Month })
            .Select(g => new { g.Key.Year, g.Key.Month, Cantidad = g.Count() })
            .ToListAsync();

        var membresiasAgrupadas = await _context.Membresias
            .GroupBy(m => m.Estado)
            .Select(g => new { Estado = g.Key, Cantidad = g.Count() })
            .ToListAsync();

        // Rellena los meses sin datos para que la serie siempre tenga MesesSerie puntos
        var meses = Enumerable.Range(0, MesesSerie).Select(i => inicioSerie.AddMonths(i)).ToList();

        var stats = new DashboardStatsDto
        {
            UsuariosActivos = usuariosActivos,
            MembresiasActivas = membresiasActivas,
            IngresosMesCOP = ingresosMes,
            PagosPendientes = pagosPendientes,
            IngresosPorMes = meses.Select(m => new IngresoMensualDto
            {
                Anio = m.Year,
                Mes = m.Month,
                TotalCOP = ingresosAgrupados.FirstOrDefault(g => g.Year == m.Year && g.Month == m.Month)?.Total ?? 0
            }).ToList(),
            NuevosUsuariosPorMes = meses.Select(m => new UsuariosMensualDto
            {
                Anio = m.Year,
                Mes = m.Month,
                Cantidad = usuariosAgrupados.FirstOrDefault(g => g.Year == m.Year && g.Month == m.Month)?.Cantidad ?? 0
            }).ToList(),
            MembresiasPorEstado = Enum.GetValues<EstadoMembresia>().Select(e => new MembresiasPorEstadoDto
            {
                Estado = e.ToString(),
                Cantidad = membresiasAgrupadas.FirstOrDefault(g => g.Estado == e)?.Cantidad ?? 0
            }).ToList(),
            GeneradoEn = ahora
        };

        return Ok(stats);
    }
}
