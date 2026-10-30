using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Sportify.Application.DTOs.Dashboard;
using Sportify.Application.Interfaces;

namespace Sportify.Api.Controllers;

/// <summary>Métricas para el dashboard ejecutivo y sincronización analítica con Microservicio 2 (:5102).</summary>
[ApiController]
[Route("api/dashboard")]
[Authorize]
public class DashboardController : ControllerBase
{
    private readonly IDashboardService _dashboardService;

    public DashboardController(IDashboardService dashboardService)
    {
        _dashboardService = dashboardService;
    }

    [HttpGet("stats")]
    [Authorize(Roles = "ADMIN")]
    [ProducesResponseType(typeof(DashboardStatsDto), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetStats()
    {
        var stats = await _dashboardService.GetStatsAsync();
        return Ok(stats);
    }

    [HttpGet("metrics")]
    [Authorize(Roles = "ADMIN,CONTADOR,ENTRENADOR,MIEMBRO")]
    [ProducesResponseType(typeof(DashboardLiveMetricsDto), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetLiveMetrics()
    {
        var metrics = await _dashboardService.GetLiveMetricsAsync();
        return Ok(metrics);
    }
}
