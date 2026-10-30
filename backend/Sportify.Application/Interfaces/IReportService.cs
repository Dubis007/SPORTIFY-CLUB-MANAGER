namespace Sportify.Application.Interfaces;

public interface IReportService
{
    Task<byte[]> GeneratePaymentsReportAsync();
    Task<byte[]> GenerateMembersReportAsync();
    Task<byte[]> GenerateLocationsReportAsync();
    Task<byte[]> GeneratePerformanceReportAsync();
    Task<byte[]?> GeneratePaymentVoucherPdfAsync(int pagoId, int? restrictToUserId = null);
}
