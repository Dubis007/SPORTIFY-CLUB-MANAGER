using Moq;
using Sportify.Application.Interfaces;
using Sportify.Application.Services;
using Sportify.Domain.Enums;

namespace Sportify.Tests.Services;

public class DashboardServiceTests
{
    [Fact]
    public async Task GetStatsAsync_ZeroMembers_GuardsDivisionByZeroAndFills12Months()
    {
        var mockRepo = new Mock<IDashboardRepository>();
        mockRepo.Setup(r => r.CountActiveUsersAsync()).ReturnsAsync(1);
        mockRepo.Setup(r => r.CountActiveSportMembersAsync()).ReturnsAsync(0);
        mockRepo.Setup(r => r.CountMembershipsByStatusAsync(EstadoMembresia.ACTIVA)).ReturnsAsync(0);
        mockRepo.Setup(r => r.CountPaymentsByStatusAsync(EstadoPago.PENDIENTE)).ReturnsAsync(0);
        mockRepo.Setup(r => r.SumApprovedPaymentsSinceAsync(It.IsAny<DateTime>())).ReturnsAsync(0m);
        mockRepo.Setup(r => r.GetMonthlyApprovedPaymentsSinceAsync(It.IsAny<DateTime>()))
            .ReturnsAsync(Array.Empty<(int Year, int Month, decimal TotalCOP)>());
        mockRepo.Setup(r => r.GetMonthlyNewUsersSinceAsync(It.IsAny<DateTime>()))
            .ReturnsAsync(Array.Empty<(int Year, int Month, int Count)>());
        mockRepo.Setup(r => r.GetMembershipsGroupedByStatusAsync())
            .ReturnsAsync(Array.Empty<(EstadoMembresia Estado, int Count)>());
        mockRepo.Setup(r => r.CountActiveMembersWithoutAttendanceSinceAsync(It.IsAny<DateTime>())).ReturnsAsync(0);
        mockRepo.Setup(r => r.CountMembershipsExpiringBetweenAsync(It.IsAny<DateTime>(), It.IsAny<DateTime>())).ReturnsAsync(0);

        var service = new DashboardService(mockRepo.Object);
        var stats = await service.GetStatsAsync();

        Assert.Equal(0, stats.TotalMiembrosDeportivos);
        Assert.Equal(0m, stats.TasaMembresiasAlDiaPct);
        Assert.Equal(12, stats.IngresosUltimos12Meses.Count);
        Assert.Equal(6, stats.IngresosPorMes.Count);
        Assert.Equal(0m, stats.IngresosAnualesCOP);
        Assert.Equal(0, stats.AlertasAccionables.TotalAlertas);
    }

    [Fact]
    public async Task GetStatsAsync_WithMembersAndAlerts_ComputesPercentageAnnualSumAndActionableAlerts()
    {
        var now = DateTime.UtcNow;
        var prevMonth = now.AddMonths(-1);

        var mockRepo = new Mock<IDashboardRepository>();
        mockRepo.Setup(r => r.CountActiveUsersAsync()).ReturnsAsync(12);
        mockRepo.Setup(r => r.CountActiveSportMembersAsync()).ReturnsAsync(8);
        mockRepo.Setup(r => r.CountMembershipsByStatusAsync(EstadoMembresia.ACTIVA)).ReturnsAsync(6);
        mockRepo.Setup(r => r.CountPaymentsByStatusAsync(EstadoPago.PENDIENTE)).ReturnsAsync(2);
        mockRepo.Setup(r => r.SumApprovedPaymentsSinceAsync(It.IsAny<DateTime>())).ReturnsAsync(360000m);
        mockRepo.Setup(r => r.GetMonthlyApprovedPaymentsSinceAsync(It.IsAny<DateTime>()))
            .ReturnsAsync(new List<(int Year, int Month, decimal TotalCOP)>
            {
                (prevMonth.Year, prevMonth.Month, 240000m),
                (now.Year, now.Month, 360000m)
            });
        mockRepo.Setup(r => r.GetMonthlyNewUsersSinceAsync(It.IsAny<DateTime>()))
            .ReturnsAsync(new List<(int Year, int Month, int Count)> { (now.Year, now.Month, 3) });
        mockRepo.Setup(r => r.GetMembershipsGroupedByStatusAsync())
            .ReturnsAsync(new List<(EstadoMembresia Estado, int Count)>
            {
                (EstadoMembresia.ACTIVA, 6),
                (EstadoMembresia.VENCIDA, 2)
            });
        mockRepo.Setup(r => r.CountActiveMembersWithoutAttendanceSinceAsync(It.IsAny<DateTime>())).ReturnsAsync(3);
        mockRepo.Setup(r => r.CountMembershipsExpiringBetweenAsync(It.IsAny<DateTime>(), It.IsAny<DateTime>())).ReturnsAsync(1);

        var service = new DashboardService(mockRepo.Object);
        var stats = await service.GetStatsAsync();

        Assert.Equal(75.0m, stats.TasaMembresiasAlDiaPct);
        Assert.Equal(600000m, stats.IngresosAnualesCOP);
        Assert.Equal(12, stats.IngresosUltimos12Meses.Count);
        Assert.Equal(3, stats.AlertasAccionables.MiembrosSinAsistencia21Dias);
        Assert.Equal(1, stats.AlertasAccionables.MembresiasPorVencer7Dias);
        Assert.Equal(2, stats.AlertasAccionables.MembresiasVencidas);
        Assert.Equal(2, stats.AlertasAccionables.PagosPendientesRevision);
        Assert.Equal(8, stats.AlertasAccionables.TotalAlertas);
    }

    [Fact]
    public async Task GetLiveMetricsAsync_ZeroAttendances_GuardsDivisionByZeroForMicroservice2()
    {
        var mockRepo = new Mock<IDashboardRepository>();
        mockRepo.Setup(r => r.GetMembershipsGroupedByStatusAsync())
            .ReturnsAsync(new List<(EstadoMembresia Estado, int Count)>
            {
                (EstadoMembresia.ACTIVA, 4),
                (EstadoMembresia.PENDIENTE, 1)
            });
        mockRepo.Setup(r => r.SumAllApprovedPaymentsAsync()).ReturnsAsync(480000m);
        mockRepo.Setup(r => r.CountPaymentsByStatusAsync(EstadoPago.PENDIENTE)).ReturnsAsync(1);
        mockRepo.Setup(r => r.CountScheduledTrainingsAsync(It.IsAny<DateTime>())).ReturnsAsync(5);
        mockRepo.Setup(r => r.CountActiveCompetitionsAsync(It.IsAny<DateTime>())).ReturnsAsync(2);
        mockRepo.Setup(r => r.GetAttendanceTotalsAsync()).ReturnsAsync((0, 0));

        var service = new DashboardService(mockRepo.Object);
        var metrics = await service.GetLiveMetricsAsync();

        Assert.Equal(4, metrics.MiembrosActivos);
        Assert.Equal(0, metrics.MembresiasVencidas);
        Assert.Equal(1, metrics.MembresiasPendientes);
        Assert.Equal(480000m, metrics.IngresosTotalesAprobados);
        Assert.Equal(0m, metrics.TasaAsistenciaPromedio);
    }
}
