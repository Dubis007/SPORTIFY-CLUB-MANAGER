using Sportify.Domain.Enums;

namespace Sportify.Application.Interfaces;

public interface IDashboardRepository
{
    Task<int> CountActiveUsersAsync();
    Task<int> CountActiveSportMembersAsync();
    Task<int> CountActiveMembersWithoutAttendanceSinceAsync(DateTime sinceUtc);
    Task<int> CountMembershipsByStatusAsync(EstadoMembresia estado);
    Task<int> CountMembershipsExpiringBetweenAsync(DateTime fromUtc, DateTime toUtc);
    Task<int> CountPaymentsByStatusAsync(EstadoPago estado);
    Task<decimal> SumApprovedPaymentsSinceAsync(DateTime fromUtc);
    Task<decimal> SumAllApprovedPaymentsAsync();
    Task<int> CountScheduledTrainingsAsync(DateTime fromUtc);
    Task<int> CountActiveCompetitionsAsync(DateTime fromUtc);
    Task<(int PresentCount, int TotalCount)> GetAttendanceTotalsAsync();
    Task<IReadOnlyList<(int Year, int Month, decimal TotalCOP)>> GetMonthlyApprovedPaymentsSinceAsync(DateTime fromUtc);
    Task<IReadOnlyList<(int Year, int Month, int Count)>> GetMonthlyNewUsersSinceAsync(DateTime fromUtc);
    Task<IReadOnlyList<(EstadoMembresia Estado, int Count)>> GetMembershipsGroupedByStatusAsync();
}
