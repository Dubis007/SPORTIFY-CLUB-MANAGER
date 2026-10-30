using Sportify.Domain.Enums;

namespace Sportify.Application.Interfaces;

public interface IDashboardRepository
{
    Task<int> CountActiveUsersAsync();
    Task<int> CountMembershipsByStatusAsync(EstadoMembresia estado);
    Task<int> CountPaymentsByStatusAsync(EstadoPago estado);
    Task<decimal> SumApprovedPaymentsSinceAsync(DateTime fromUtc);
    Task<IReadOnlyList<(int Year, int Month, decimal TotalCOP)>> GetMonthlyApprovedPaymentsSinceAsync(DateTime fromUtc);
    Task<IReadOnlyList<(int Year, int Month, int Count)>> GetMonthlyNewUsersSinceAsync(DateTime fromUtc);
    Task<IReadOnlyList<(EstadoMembresia Estado, int Count)>> GetMembershipsGroupedByStatusAsync();
}
