using System.Text;
using Moq;
using Sportify.Application.DTOs.Reports;
using Sportify.Application.Interfaces;
using Sportify.Application.Services;
using Sportify.Infrastructure.Reports;

namespace Sportify.Tests.Services;

public class ReportServiceTests
{
    [Fact]
    public async Task GeneratePaymentsReportAsync_RendersValidPdfBytes()
    {
        var mockRepo = new Mock<IReportRepository>();
        mockRepo.Setup(r => r.GetPaymentsReportDataAsync()).ReturnsAsync(new List<PaymentReportRowDto>
        {
            new()
            {
                Id = 1,
                UsuarioNombre = "Mario Gómez",
                MontoCOP = 120000m,
                Estado = "APROBADO",
                FechaPago = DateTime.UtcNow
            }
        });

        var service = new ReportService(mockRepo.Object, new QuestPdfReportRenderer());
        var bytes = await service.GeneratePaymentsReportAsync();

        Assert.True(bytes.Length > 400);
        Assert.Equal("%PDF", Encoding.ASCII.GetString(bytes, 0, 4));
    }

    [Fact]
    public async Task GenerateMembersReportAsync_RendersValidPdfBytes()
    {
        var mockRepo = new Mock<IReportRepository>();
        mockRepo.Setup(r => r.GetActiveMembersReportDataAsync()).ReturnsAsync(new List<MemberReportRowDto>
        {
            new()
            {
                NombreCompleto = "Mario Gómez",
                Correo = "mario@sportify.com",
                Roles = "MIEMBRO",
                FechaRegistro = DateTime.UtcNow
            }
        });

        var service = new ReportService(mockRepo.Object, new QuestPdfReportRenderer());
        var bytes = await service.GenerateMembersReportAsync();

        Assert.True(bytes.Length > 400);
        Assert.Equal("%PDF", Encoding.ASCII.GetString(bytes, 0, 4));
    }

    [Fact]
    public async Task GenerateLocationsReportAsync_RendersValidPdfBytes()
    {
        var mockRepo = new Mock<IReportRepository>();
        mockRepo.Setup(r => r.GetLocationsReportDataAsync()).ReturnsAsync(new List<LocationReportRowDto>
        {
            new()
            {
                Nombre = "Sede Norte",
                Ciudad = "Bogotá",
                Direccion = "Calle 100 #15-20",
                Telefono = "3001112233",
                Activo = true,
                CreadoEn = DateTime.UtcNow
            }
        });

        var service = new ReportService(mockRepo.Object, new QuestPdfReportRenderer());
        var bytes = await service.GenerateLocationsReportAsync();

        Assert.True(bytes.Length > 400);
        Assert.Equal("%PDF", Encoding.ASCII.GetString(bytes, 0, 4));
    }

    [Fact]
    public async Task GeneratePerformanceReportAsync_RendersValidPdfBytes()
    {
        var mockRepo = new Mock<IReportRepository>();
        mockRepo.Setup(r => r.GetPerformanceReportDataAsync()).ReturnsAsync(new List<PerformanceReportItemDto>
        {
            new()
            {
                Atleta = "Mario Gómez",
                Competencia = "Copa Metropolitana",
                FechaCompetencia = DateTime.UtcNow,
                FechaUltimaAsistencia = DateTime.UtcNow.AddDays(-2),
                Observaciones = "Puntaje: 9.1 | Desempeño: Alto"
            }
        });

        var service = new ReportService(mockRepo.Object, new QuestPdfReportRenderer());
        var bytes = await service.GeneratePerformanceReportAsync();

        Assert.True(bytes.Length > 400);
        Assert.Equal("%PDF", Encoding.ASCII.GetString(bytes, 0, 4));
    }
}
