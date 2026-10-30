using Sportify.Application.DTOs.Dashboard;
using Sportify.Application.Interfaces;
using Sportify.Domain.Enums;

namespace Sportify.Application.Services;

public class DashboardService : IDashboardService
{
    private const int MesesSerieCorta = 6;
    private const int MesesSerieAnual = 12;
    private const int DiasAlertaInasistencia = 21;
    private const int DiasAlertaPorVencer = 7;

    private readonly IDashboardRepository _dashboardRepository;

    public DashboardService(IDashboardRepository dashboardRepository)
    {
        _dashboardRepository = dashboardRepository;
    }

    public async Task<DashboardStatsDto> GetStatsAsync()
    {
        var ahora = DateTime.UtcNow;
        var inicioMes = new DateTime(ahora.Year, ahora.Month, 1, 0, 0, 0, DateTimeKind.Utc);
        var inicioSerie6 = inicioMes.AddMonths(-(MesesSerieCorta - 1));
        var inicioSerie12 = inicioMes.AddMonths(-(MesesSerieAnual - 1));

        var usuariosActivos = await _dashboardRepository.CountActiveUsersAsync();
        var totalMiembrosDeportivos = await _dashboardRepository.CountActiveSportMembersAsync();
        var membresiasActivas = await _dashboardRepository.CountMembershipsByStatusAsync(EstadoMembresia.ACTIVA);
        var pagosPendientes = await _dashboardRepository.CountPaymentsByStatusAsync(EstadoPago.PENDIENTE);
        var ingresosMes = await _dashboardRepository.SumApprovedPaymentsSinceAsync(inicioMes);
        var ingresosAgrupados12 = await _dashboardRepository.GetMonthlyApprovedPaymentsSinceAsync(inicioSerie12);
        var usuariosAgrupados6 = await _dashboardRepository.GetMonthlyNewUsersSinceAsync(inicioSerie6);
        var membresiasAgrupadas = await _dashboardRepository.GetMembershipsGroupedByStatusAsync();

        var sinAsistencia21Dias = await _dashboardRepository.CountActiveMembersWithoutAttendanceSinceAsync(
            ahora.AddDays(-DiasAlertaInasistencia));
        var porVencer7Dias = await _dashboardRepository.CountMembershipsExpiringBetweenAsync(
            ahora, ahora.AddDays(DiasAlertaPorVencer));
        var membresiasVencidas = membresiasAgrupadas.FirstOrDefault(g => g.Estado == EstadoMembresia.VENCIDA).Count;

        var meses12 = Enumerable.Range(0, MesesSerieAnual).Select(i => inicioSerie12.AddMonths(i)).ToList();
        var meses6 = Enumerable.Range(0, MesesSerieCorta).Select(i => inicioSerie6.AddMonths(i)).ToList();

        var serieIngresos12 = meses12.Select(m => new IngresoMensualDto
        {
            Anio = m.Year,
            Mes = m.Month,
            TotalCOP = ingresosAgrupados12.FirstOrDefault(g => g.Year == m.Year && g.Month == m.Month).TotalCOP
        }).ToList();

        var serieIngresos6 = serieIngresos12.TakeLast(MesesSerieCorta).ToList();

        // Protección explícita contra división 0/0 (VID2-RNF-005): retorna 0% cuando no hay miembros deportivos.
        var tasaMembresiasAlDiaPct = totalMiembrosDeportivos > 0
            ? Math.Round((decimal)Math.Min(membresiasActivas, totalMiembrosDeportivos) / totalMiembrosDeportivos * 100m, 1)
            : 0m;

        return new DashboardStatsDto
        {
            UsuariosActivos = usuariosActivos,
            MembresiasActivas = membresiasActivas,
            TotalMiembrosDeportivos = totalMiembrosDeportivos,
            TasaMembresiasAlDiaPct = tasaMembresiasAlDiaPct,
            IngresosMesCOP = ingresosMes,
            IngresosAnualesCOP = serieIngresos12.Sum(m => m.TotalCOP),
            PagosPendientes = pagosPendientes,
            IngresosPorMes = serieIngresos6,
            IngresosUltimos12Meses = serieIngresos12,
            NuevosUsuariosPorMes = meses6.Select(m => new UsuariosMensualDto
            {
                Anio = m.Year,
                Mes = m.Month,
                Cantidad = usuariosAgrupados6.FirstOrDefault(g => g.Year == m.Year && g.Month == m.Month).Count
            }).ToList(),
            MembresiasPorEstado = Enum.GetValues<EstadoMembresia>().Select(e => new MembresiasPorEstadoDto
            {
                Estado = e.ToString(),
                Cantidad = membresiasAgrupadas.FirstOrDefault(g => g.Estado == e).Count
            }).ToList(),
            AlertasAccionables = new DashboardAlertsDto
            {
                MiembrosSinAsistencia21Dias = sinAsistencia21Dias,
                MembresiasPorVencer7Dias = porVencer7Dias,
                MembresiasVencidas = membresiasVencidas,
                PagosPendientesRevision = pagosPendientes
            },
            GeneradoEn = ahora
        };
    }

    public async Task<DashboardLiveMetricsDto> GetLiveMetricsAsync()
    {
        var ahora = DateTime.UtcNow;
        var membresiasAgrupadas = await _dashboardRepository.GetMembershipsGroupedByStatusAsync();
        var ingresosTotales = await _dashboardRepository.SumAllApprovedPaymentsAsync();
        var pagosPendientes = await _dashboardRepository.CountPaymentsByStatusAsync(EstadoPago.PENDIENTE);
        var entrenamientosProgramados = await _dashboardRepository.CountScheduledTrainingsAsync(ahora);
        var competenciasActivas = await _dashboardRepository.CountActiveCompetitionsAsync(ahora);
        var (presentCount, totalCount) = await _dashboardRepository.GetAttendanceTotalsAsync();

        var tasaAsistencia = totalCount > 0
            ? Math.Round((decimal)presentCount / totalCount * 100m, 1)
            : 0m;

        return new DashboardLiveMetricsDto
        {
            MiembrosActivos = membresiasAgrupadas.FirstOrDefault(g => g.Estado == EstadoMembresia.ACTIVA).Count,
            MembresiasVencidas = membresiasAgrupadas.FirstOrDefault(g => g.Estado == EstadoMembresia.VENCIDA).Count,
            MembresiasPendientes = membresiasAgrupadas.FirstOrDefault(g => g.Estado == EstadoMembresia.PENDIENTE).Count,
            IngresosTotalesAprobados = ingresosTotales,
            PagosPendientesRevision = pagosPendientes,
            EntrenamientosProgramados = entrenamientosProgramados,
            CompetenciasActivas = competenciasActivas,
            TasaAsistenciaPromedio = tasaAsistencia
        };
    }
}
