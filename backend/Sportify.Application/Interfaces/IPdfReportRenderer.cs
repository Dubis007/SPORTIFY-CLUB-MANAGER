using Sportify.Application.DTOs.Reports;

namespace Sportify.Application.Interfaces;

public interface IPdfReportRenderer
{
    byte[] RenderPaymentsReport(IReadOnlyList<PaymentReportRowDto> pagos);
    byte[] RenderMembersReport(IReadOnlyList<MemberReportRowDto> usuarios);
    byte[] RenderLocationsReport(IReadOnlyList<LocationReportRowDto> sedes);
    byte[] RenderPerformanceReport(IReadOnlyList<PerformanceReportItemDto> items);
    byte[] RenderPaymentVoucher(PaymentVoucherDataDto voucher);
}
