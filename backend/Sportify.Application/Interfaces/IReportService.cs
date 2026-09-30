using Sportify.Domain.Entities;

namespace Sportify.Application.Interfaces;

public interface IReportService
{
    byte[] GeneratePaymentsReport(IEnumerable<Pago> pagos);
    byte[] GenerateMembersReport(IEnumerable<Usuario> usuarios);
    byte[] GenerateLocationsReport(IEnumerable<Sede> sedes);
    byte[] GeneratePerformanceReport(IEnumerable<Sportify.Application.DTOs.Reports.PerformanceReportItemDto> items);
}
