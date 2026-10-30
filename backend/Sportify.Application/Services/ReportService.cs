using Sportify.Application.Interfaces;

namespace Sportify.Application.Services;

public class ReportService : IReportService
{
    private readonly IReportRepository _reportRepository;
    private readonly IPdfReportRenderer _pdfRenderer;

    public ReportService(IReportRepository reportRepository, IPdfReportRenderer pdfRenderer)
    {
        _reportRepository = reportRepository;
        _pdfRenderer = pdfRenderer;
    }

    public async Task<byte[]> GeneratePaymentsReportAsync()
    {
        var pagos = await _reportRepository.GetPaymentsReportDataAsync();
        return _pdfRenderer.RenderPaymentsReport(pagos);
    }

    public async Task<byte[]> GenerateMembersReportAsync()
    {
        var usuarios = await _reportRepository.GetActiveMembersReportDataAsync();
        return _pdfRenderer.RenderMembersReport(usuarios);
    }

    public async Task<byte[]> GenerateLocationsReportAsync()
    {
        var sedes = await _reportRepository.GetLocationsReportDataAsync();
        return _pdfRenderer.RenderLocationsReport(sedes);
    }

    public async Task<byte[]> GeneratePerformanceReportAsync()
    {
        var items = await _reportRepository.GetPerformanceReportDataAsync();
        return _pdfRenderer.RenderPerformanceReport(items);
    }

    public async Task<byte[]?> GeneratePaymentVoucherPdfAsync(int pagoId, int? restrictToUserId = null)
    {
        var voucher = await _reportRepository.GetPaymentVoucherDataAsync(pagoId);
        if (voucher == null)
            return null;

        if (restrictToUserId.HasValue && voucher.UsuarioId != restrictToUserId.Value)
            return null;

        return _pdfRenderer.RenderPaymentVoucher(voucher);
    }
}
