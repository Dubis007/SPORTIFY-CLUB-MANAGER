using Sportify.Application.DTOs.Dashboard;
using Sportify.Application.Interfaces;
using Sportify.Domain.Enums;

namespace Sportify.Application.Services;

public class DashboardService : IDashboardService
{
    private const int MesesSerie = 6;
    private readonly IDashboardRepository _dashboardRepository;

    public DashboardService(IDashboardRepository dashboardRepository)
    {
        _dashboardRepository = dashboardRepository;
    }

    public async Task<DashboardStatsDto> GetStatsAsync()
    {
        var ahora = DateTime.UtcNow;
        var inicioMes = new DateTime(ahora.Year, ahora.Month, 1, 0, 0, 0, DateTimeKind.Utc);
        var inicioSerie = inicioMes.AddMonths(-(MesesSerie - 1));

        var usuariosActivos = await _dashboardRepository.CountActiveUsersAsync();
        var membresiasActivas = await _dashboardRepository.CountMembershipsByStatusAsync(EstadoMembresia.ACTIVA);
        var pagosPendientes = await _dashboardRepository.CountPaymentsByStatusAsync(EstadoPago.PENDIENTE);
        var ingresosMes = await _dashboardRepository.SumApprovedPaymentsSinceAsync(inicioMes);
        var ingresosAgrupados = await _dashboardRepository.GetMonthlyApprovedPaymentsSinceAsync(inicioSerie);
        var usuariosAgrupados = await _dashboardRepository.GetMonthlyNewUsersSinceAsync(inicioSerie);
        var membresiasAgrupadas = await _dashboardRepository.GetMembershipsGroupedByStatusAsync();

        var meses = Enumerable.Range(0, MesesSerie).Select(i => inicioSerie.AddMonths(i)).ToList();

        return new DashboardStatsDto
        {
            UsuariosActivos = usuariosActivos,
            MembresiasActivas = membresiasActivas,
            IngresosMesCOP = ingresosMes,
            PagosPendientes = pagosPendientes,
            IngresosPorMes = meses.Select(m => new IngresoMensualDto
            {
                Anio = m.Year,
                Mes = m.Month,
                TotalCOP = ingresosAgrupados.FirstOrDefault(g => g.Year == m.Year && g.Month == m.Month).TotalCOP
            }).ToList(),
            NuevosUsuariosPorMes = meses.Select(m => new UsuariosMensualDto
            {
                Anio = m.Year,
                Mes = m.Month,
                Cantidad = usuariosAgrupados.FirstOrDefault(g => g.Year == m.Year && g.Month == m.Month).Count
            }).ToList(),
            MembresiasPorEstado = Enum.GetValues<EstadoMembresia>().Select(e => new MembresiasPorEstadoDto
            {
                Estado = e.ToString(),
                Cantidad = membresiasAgrupadas.FirstOrDefault(g => g.Estado == e).Count
            }).ToList(),
            GeneradoEn = ahora
        };
    }
}
