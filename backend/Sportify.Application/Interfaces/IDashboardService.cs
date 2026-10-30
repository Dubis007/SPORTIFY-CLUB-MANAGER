using Sportify.Application.DTOs.Dashboard;

namespace Sportify.Application.Interfaces;

public interface IDashboardService
{
    Task<DashboardStatsDto> GetStatsAsync();
}
