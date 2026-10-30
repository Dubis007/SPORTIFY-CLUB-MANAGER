using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Sportify.Application.DTOs.Dashboard;
using Sportify.Application.Interfaces;

namespace Sportify.Api.Controllers;

/// <summary>Métricas para el dashboard de administración (el frontend las consulta periódicamente).</summary>
[ApiController]
[Route("api/dashboard")]
[Authorize(Roles = "ADMIN")]
public class DashboardController : ControllerBase
{
    private readonly IDashboardService _dashboardService;

    public DashboardController(IDashboardService dashboardService)
    {
        _dashboardService = dashboardService;
    }

    [HttpGet("stats")]
    [ProducesResponseType(typeof(DashboardStatsDto), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetStats()
    {
        var stats = await _dashboardService.GetStatsAsync();
        return Ok(stats);
    }
}
