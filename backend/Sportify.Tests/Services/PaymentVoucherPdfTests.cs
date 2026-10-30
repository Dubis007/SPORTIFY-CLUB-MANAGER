using System.Text;
using Moq;
using Sportify.Application.DTOs.Reports;
using Sportify.Application.Interfaces;
using Sportify.Application.Services;
using Sportify.Infrastructure.Reports;

namespace Sportify.Tests.Services;

public class PaymentVoucherPdfTests
{
    [Fact]
    public async Task GeneratePaymentVoucherPdfAsync_ExistingPayment_ReturnsValidPdfBytes()
    {
        var mockRepo = new Mock<IReportRepository>();
        mockRepo.Setup(r => r.GetPaymentVoucherDataAsync(101)).ReturnsAsync(new PaymentVoucherDataDto
        {
            PagoId = 101,
            UsuarioId = 4,
            UsuarioNombre = "Mario Miembro",
            UsuarioCorreo = "miembro@sportify.com",
            SedeNombre = "Sede Principal Norte",
            PlanNombre = "Plan Premium",
            FechaInicioMembresia = new DateTime(2026, 10, 1, 0, 0, 0, DateTimeKind.Utc),
            FechaFinMembresia = new DateTime(2026, 10, 31, 0, 0, 0, DateTimeKind.Utc),
            MontoCOP = 120000m,
            Estado = "APROBADO",
            FechaPago = new DateTime(2026, 10, 5, 14, 30, 0, DateTimeKind.Utc),
            FechaAprobacion = new DateTime(2026, 10, 5, 16, 0, 0, DateTimeKind.Utc),
            AprobadoPorNombre = "Carlos Contador",
            CodigoVerificacion = "SPT-202610-000101"
        });

        var renderer = new QuestPdfReportRenderer();
        var service = new ReportService(mockRepo.Object, renderer);

        var pdfBytes = await service.GeneratePaymentVoucherPdfAsync(101);

        Assert.NotNull(pdfBytes);
        Assert.True(pdfBytes!.Length > 500);
        var header = Encoding.ASCII.GetString(pdfBytes, 0, 4);
        Assert.Equal("%PDF", header);
    }

    [Fact]
    public async Task GeneratePaymentVoucherPdfAsync_DifferentOwnerRestriction_ReturnsNull()
    {
        var mockRepo = new Mock<IReportRepository>();
        mockRepo.Setup(r => r.GetPaymentVoucherDataAsync(101)).ReturnsAsync(new PaymentVoucherDataDto
        {
            PagoId = 101,
            UsuarioId = 4,
            UsuarioNombre = "Mario Miembro",
            MontoCOP = 120000m,
            Estado = "PENDIENTE",
            CodigoVerificacion = "SPT-202610-000101"
        });

        var renderer = new QuestPdfReportRenderer();
        var service = new ReportService(mockRepo.Object, renderer);

        var pdfBytes = await service.GeneratePaymentVoucherPdfAsync(101, restrictToUserId: 99);

        Assert.Null(pdfBytes);
    }
}
