using Sportify.Application.DTOs.Reports;

namespace Sportify.Application.Interfaces;

public interface IReportRepository
{
    Task<IReadOnlyList<PaymentReportRowDto>> GetPaymentsReportDataAsync();
    Task<IReadOnlyList<MemberReportRowDto>> GetActiveMembersReportDataAsync();
    Task<IReadOnlyList<LocationReportRowDto>> GetLocationsReportDataAsync();
    Task<IReadOnlyList<PerformanceReportItemDto>> GetPerformanceReportDataAsync();
}
