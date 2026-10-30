using QuestPDF.Fluent;
using QuestPDF.Helpers;
using QuestPDF.Infrastructure;
using Sportify.Application.DTOs.Reports;
using Sportify.Application.Interfaces;

namespace Sportify.Infrastructure.Reports;

public class QuestPdfReportRenderer : IPdfReportRenderer
{
    public QuestPdfReportRenderer()
    {
        QuestPDF.Settings.License = LicenseType.Community;
    }

    public byte[] RenderPaymentsReport(IReadOnlyList<PaymentReportRowDto> pagos)
    {
        var document = Document.Create(container =>
        {
            container.Page(page =>
            {
                page.Size(PageSizes.A4.Landscape());
                page.Margin(1, Unit.Centimetre);
                page.DefaultTextStyle(x => x.FontSize(10));

                page.Header().Column(col =>
                {
                    col.Item().AlignCenter().Text("SPORTIFY CLUB MANAGER - Reporte de Pagos").SemiBold().FontSize(16).FontColor(Colors.Blue.Darken2);
                    col.Item().AlignCenter().Text($"Generado el: {DateTime.Now:dd/MM/yyyy HH:mm}").FontSize(9).FontColor(Colors.Grey.Darken1);
                    col.Item().PaddingTop(4).Height(1).Background(Colors.Blue.Darken2);
                });

                page.Content().PaddingVertical(8).Table(table =>
                {
                    table.ColumnsDefinition(columns =>
                    {
                        columns.ConstantColumn(40);
                        columns.RelativeColumn(2);
                        columns.RelativeColumn(1.5f);
                        columns.RelativeColumn(1.5f);
                        columns.RelativeColumn(2);
                        columns.RelativeColumn(2);
                    });

                    static IContainer HeaderCell(IContainer c) =>
                        c.DefaultTextStyle(x => x.SemiBold().FontColor(Colors.White)).Background(Colors.Blue.Darken2).Border(1).BorderColor(Colors.Blue.Darken3).PaddingVertical(5).PaddingHorizontal(5).AlignCenter();

                    static IContainer DataCell(IContainer c, string bg) =>
                        c.Background(bg).Border(1).BorderColor(Colors.Grey.Lighten2).PaddingVertical(5).PaddingHorizontal(5);

                    table.Header(header =>
                    {
                        header.Cell().Element(HeaderCell).Text("ID Pago");
                        header.Cell().Element(HeaderCell).Text("Usuario");
                        header.Cell().Element(HeaderCell).Text("Monto (COP)");
                        header.Cell().Element(HeaderCell).Text("Estado");
                        header.Cell().Element(HeaderCell).Text("Fecha Pago");
                        header.Cell().Element(HeaderCell).Text("Fecha Aprobación");
                    });

                    var rowIndex = 0;
                    foreach (var pago in pagos)
                    {
                        var bgColor = rowIndex++ % 2 == 0 ? Colors.White : Colors.Grey.Lighten4;
                        table.Cell().Element(c => DataCell(c, bgColor)).Text(pago.Id.ToString()).Bold();
                        table.Cell().Element(c => DataCell(c, bgColor)).Text(pago.UsuarioNombre);
                        table.Cell().Element(c => DataCell(c, bgColor)).Text(pago.MontoCOP.ToString("C0"));
                        table.Cell().Element(c => DataCell(c, bgColor)).Text(pago.Estado);
                        table.Cell().Element(c => DataCell(c, bgColor)).Text(pago.FechaPago.ToString("dd/MM/yyyy HH:mm"));
                        table.Cell().Element(c => DataCell(c, bgColor)).Text(pago.FechaAprobacion?.ToString("dd/MM/yyyy HH:mm") ?? "N/A");
                    }
                });

                page.Footer().AlignRight().Text(text =>
                {
                    text.Span("Página ").FontSize(9);
                    text.CurrentPageNumber().FontSize(9);
                    text.Span(" de ").FontSize(9);
                    text.TotalPages().FontSize(9);
                });
            });
        });

        return document.GeneratePdf();
    }

    public byte[] RenderMembersReport(IReadOnlyList<MemberReportRowDto> usuarios)
    {
        var document = Document.Create(container =>
        {
            container.Page(page =>
            {
                page.Size(PageSizes.A4);
                page.Margin(1, Unit.Centimetre);
                page.DefaultTextStyle(x => x.FontSize(10));

                page.Header().Column(col =>
                {
                    col.Item().AlignCenter().Text("SPORTIFY CLUB MANAGER - Reporte de Miembros Activos").SemiBold().FontSize(16).FontColor(Colors.Green.Darken2);
                    col.Item().AlignCenter().Text($"Generado el: {DateTime.Now:dd/MM/yyyy HH:mm}").FontSize(9).FontColor(Colors.Grey.Darken1);
                    col.Item().PaddingTop(4).Height(1).Background(Colors.Green.Darken2);
                });

                page.Content().PaddingVertical(8).Table(table =>
                {
                    table.ColumnsDefinition(columns =>
                    {
                        columns.RelativeColumn(2);
                        columns.RelativeColumn(2);
                        columns.RelativeColumn(1.5f);
                        columns.RelativeColumn(2);
                    });

                    static IContainer HeaderCell(IContainer c) =>
                        c.DefaultTextStyle(x => x.SemiBold().FontColor(Colors.White)).Background(Colors.Green.Darken2).Border(1).BorderColor(Colors.Green.Darken3).PaddingVertical(5).PaddingHorizontal(5).AlignCenter();

                    static IContainer DataCell(IContainer c, string bg) =>
                        c.Background(bg).Border(1).BorderColor(Colors.Grey.Lighten2).PaddingVertical(5).PaddingHorizontal(5);

                    table.Header(header =>
                    {
                        header.Cell().Element(HeaderCell).Text("Nombre y Apellido");
                        header.Cell().Element(HeaderCell).Text("Correo");
                        header.Cell().Element(HeaderCell).Text("Roles");
                        header.Cell().Element(HeaderCell).Text("Fecha Registro");
                    });

                    var rowIndex = 0;
                    foreach (var user in usuarios)
                    {
                        var bgColor = rowIndex++ % 2 == 0 ? Colors.White : Colors.Grey.Lighten4;
                        table.Cell().Element(c => DataCell(c, bgColor)).Text(user.NombreCompleto).Bold();
                        table.Cell().Element(c => DataCell(c, bgColor)).Text(user.Correo);
                        table.Cell().Element(c => DataCell(c, bgColor)).Text(user.Roles);
                        table.Cell().Element(c => DataCell(c, bgColor)).Text(user.FechaRegistro.ToString("dd/MM/yyyy"));
                    }
                });

                page.Footer().AlignRight().Text(text =>
                {
                    text.Span("Página ").FontSize(9);
                    text.CurrentPageNumber().FontSize(9);
                    text.Span(" de ").FontSize(9);
                    text.TotalPages().FontSize(9);
                });
            });
        });

        return document.GeneratePdf();
    }

    public byte[] RenderLocationsReport(IReadOnlyList<LocationReportRowDto> sedes)
    {
        var document = Document.Create(container =>
        {
            container.Page(page =>
            {
                page.Size(PageSizes.A4);
                page.Margin(2, Unit.Centimetre);
                page.PageColor(Colors.White);
                page.DefaultTextStyle(x => x.FontSize(10));

                page.Header().Column(col =>
                {
                    col.Item().Text("SPORTIFY CLUB MANAGER").Bold().FontSize(20).FontColor(Colors.Blue.Darken2);
                    col.Item().Text("Reporte Consolidado de Sedes").FontSize(14).FontColor(Colors.Grey.Darken2);
                    col.Item().Text($"Fecha de generación: {DateTime.Now:dd/MM/yyyy HH:mm}").FontSize(9).FontColor(Colors.Grey.Medium);
                    col.Spacing(5);
                });

                page.Content().PaddingVertical(1, Unit.Centimetre).Table(table =>
                {
                    table.ColumnsDefinition(columns =>
                    {
                        columns.RelativeColumn(3);
                        columns.RelativeColumn(3);
                        columns.RelativeColumn(2);
                        columns.RelativeColumn(1);
                        columns.RelativeColumn(2);
                    });

                    static IContainer HeaderCell(IContainer c) =>
                        c.DefaultTextStyle(x => x.SemiBold().FontColor(Colors.White)).Background(Colors.Blue.Darken2).Border(1).BorderColor(Colors.Blue.Darken3).PaddingVertical(5).PaddingHorizontal(5).AlignCenter();

                    static IContainer DataCell(IContainer c, string bg) =>
                        c.Background(bg).Border(1).BorderColor(Colors.Grey.Lighten2).PaddingVertical(5).PaddingHorizontal(5);

                    table.Header(header =>
                    {
                        header.Cell().Element(HeaderCell).Text("Nombre de Sede");
                        header.Cell().Element(HeaderCell).Text("Ubicación");
                        header.Cell().Element(HeaderCell).Text("Teléfono");
                        header.Cell().Element(HeaderCell).Text("Activa");
                        header.Cell().Element(HeaderCell).Text("Registrada");
                    });

                    var rowIndex = 0;
                    foreach (var sede in sedes)
                    {
                        var bgColor = rowIndex++ % 2 == 0 ? Colors.White : Colors.Grey.Lighten4;
                        table.Cell().Element(c => DataCell(c, bgColor)).Text(sede.Nombre).Bold();
                        table.Cell().Element(c => DataCell(c, bgColor)).Text($"{sede.Ciudad} - {sede.Direccion}");
                        table.Cell().Element(c => DataCell(c, bgColor)).Text(sede.Telefono ?? "N/A");
                        table.Cell().Element(c => DataCell(c, bgColor)).Text(sede.Activo ? "Sí" : "No");
                        table.Cell().Element(c => DataCell(c, bgColor)).Text(sede.CreadoEn.ToString("dd/MM/yyyy"));
                    }
                });

                page.Footer().AlignRight().Text(text =>
                {
                    text.Span("Página ").FontSize(9);
                    text.CurrentPageNumber().FontSize(9);
                    text.Span(" de ").FontSize(9);
                    text.TotalPages().FontSize(9);
                });
            });
        });

        return document.GeneratePdf();
    }

    public byte[] RenderPerformanceReport(IReadOnlyList<PerformanceReportItemDto> items)
    {
        var document = Document.Create(container =>
        {
            container.Page(page =>
            {
                page.Size(PageSizes.A4.Landscape());
                page.Margin(1, Unit.Centimetre);
                page.PageColor(Colors.White);
                page.DefaultTextStyle(x => x.FontSize(10));

                page.Header().Row(row =>
                {
                    row.RelativeItem().Column(col =>
                    {
                        col.Item().Text("Reporte de Asistencia y Desempeño en Competencias").FontSize(20).SemiBold().FontColor(Colors.Red.Darken2);
                        col.Item().Text($"Fecha de Generación: {DateTime.Now:dd/MM/yyyy HH:mm}");
                    });
                });

                page.Content().PaddingVertical(1, Unit.Centimetre).Table(table =>
                {
                    table.ColumnsDefinition(columns =>
                    {
                        columns.RelativeColumn(3);
                        columns.RelativeColumn(2);
                        columns.RelativeColumn(3);
                        columns.RelativeColumn(2);
                        columns.RelativeColumn(4);
                    });

                    static IContainer HeaderCell(IContainer c) =>
                        c.DefaultTextStyle(x => x.SemiBold().FontColor(Colors.White)).Background(Colors.Red.Darken2).Border(1).BorderColor(Colors.Red.Darken3).PaddingVertical(5).PaddingHorizontal(5).AlignCenter();

                    static IContainer DataCell(IContainer c, string bg) =>
                        c.Background(bg).Border(1).BorderColor(Colors.Grey.Lighten2).PaddingVertical(5).PaddingHorizontal(5);

                    table.Header(header =>
                    {
                        header.Cell().Element(HeaderCell).Text("Nombre Atleta");
                        header.Cell().Element(HeaderCell).Text("Última Asistencia");
                        header.Cell().Element(HeaderCell).Text("Competencia");
                        header.Cell().Element(HeaderCell).Text("Fecha Competencia");
                        header.Cell().Element(HeaderCell).Text("Observaciones");
                    });

                    var rowIndex = 0;
                    foreach (var item in items)
                    {
                        var bgColor = rowIndex++ % 2 == 0 ? Colors.White : Colors.Grey.Lighten4;
                        table.Cell().Element(c => DataCell(c, bgColor)).Text(item.Atleta);
                        table.Cell().Element(c => DataCell(c, bgColor)).Text(item.FechaUltimaAsistencia?.ToString("dd/MM/yyyy") ?? "Sin asistencia");
                        table.Cell().Element(c => DataCell(c, bgColor)).Text(item.Competencia);
                        table.Cell().Element(c => DataCell(c, bgColor)).Text(item.FechaCompetencia.ToString("dd/MM/yyyy"));
                        table.Cell().Element(c => DataCell(c, bgColor)).Text(item.Observaciones);
                    }
                });

                page.Footer().AlignRight().Text(text =>
                {
                    text.Span("Página ").FontSize(9);
                    text.CurrentPageNumber().FontSize(9);
                    text.Span(" de ").FontSize(9);
                    text.TotalPages().FontSize(9);
                });
            });
        });

        return document.GeneratePdf();
    }
}
