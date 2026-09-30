using QuestPDF.Fluent;
using QuestPDF.Helpers;
using QuestPDF.Infrastructure;
using Sportify.Application.Interfaces;
using Sportify.Domain.Entities;

namespace Sportify.Infrastructure.Reports;

public class ReportService : IReportService
{
    public byte[] GeneratePaymentsReport(IEnumerable<Pago> pagos)
    {
        QuestPDF.Settings.License = LicenseType.Community;

        var pagosList = pagos.ToList();

        var document = Document.Create(container =>
        {
            container.Page(page =>
            {
                page.Size(PageSizes.A4.Landscape());
                page.Margin(1, Unit.Centimetre);
                page.DefaultTextStyle(x => x.FontSize(10));

                // Header
                page.Header().Column(col =>
                {
                    col.Item().AlignCenter().Text("SPORTIFY CLUB MANAGER - Reporte de Pagos")
                        .SemiBold().FontSize(16).FontColor(Colors.Blue.Darken2);
                    col.Item().AlignCenter().Text($"Generado el: {DateTime.Now:dd/MM/yyyy HH:mm}")
                        .FontSize(9).FontColor(Colors.Grey.Darken1);
                    col.Item().PaddingTop(4).Height(1).Background(Colors.Blue.Darken2);
                });

                // Content
                page.Content().PaddingVertical(8).Table(table =>
                {
                    // Definir columnas
                    table.ColumnsDefinition(columns =>
                    {
                        columns.ConstantColumn(40);   // ID
                        columns.RelativeColumn(2);    // Usuario
                        columns.RelativeColumn(1.5f); // Monto
                        columns.RelativeColumn(1.5f); // Estado
                        columns.RelativeColumn(2);    // Fecha Pago
                        columns.RelativeColumn(2);    // Fecha Aprobacion
                    });

                    // Encabezado de tabla
                    static IContainer HeaderCell(IContainer container) =>
                        container.DefaultTextStyle(x => x.SemiBold().FontColor(Colors.White))
                                 .Background(Colors.Blue.Darken2)
                                 .Border(1).BorderColor(Colors.Blue.Darken3)
                                 .Padding(5).AlignCenter();

                    table.Header(header =>
                    {
                        header.Cell().Element(HeaderCell).Text("ID");
                        header.Cell().Element(HeaderCell).Text("Usuario");
                        header.Cell().Element(HeaderCell).Text("Monto");
                        header.Cell().Element(HeaderCell).Text("Estado");
                        header.Cell().Element(HeaderCell).Text("Fecha Pago");
                        header.Cell().Element(HeaderCell).Text("Fecha Aprobacion");
                    });

                    // Filas
                    var rowIndex = 0;
                    foreach (var pago in pagosList)
                    {
                        var bgColor = rowIndex % 2 == 0 ? Colors.White : Colors.Grey.Lighten3;
                        rowIndex++;

                        static IContainer DataCell(IContainer c, string color) =>
                            c.Background(color).Border(1).BorderColor(Colors.Grey.Lighten2)
                             .Padding(4).AlignCenter();

                        var usuarioNombre = pago.Usuario != null
                            ? $"{pago.Usuario.Nombre} {pago.Usuario.Apellido}"
                            : $"ID: {pago.UsuarioId}";

                        table.Cell().Element(c => DataCell(c, bgColor)).Text(pago.Id.ToString());
                        table.Cell().Element(c => DataCell(c, bgColor)).Text(usuarioNombre);
                        table.Cell().Element(c => DataCell(c, bgColor)).Text($"${pago.MontoCOP:N2}");
                        table.Cell().Element(c => DataCell(c, bgColor)).Text(pago.Estado.ToString());
                        table.Cell().Element(c => DataCell(c, bgColor)).Text(pago.FechaPago.ToString("dd/MM/yyyy"));
                        table.Cell().Element(c => DataCell(c, bgColor))
                             .Text(pago.FechaAprobacion.HasValue
                                 ? pago.FechaAprobacion.Value.ToString("dd/MM/yyyy")
                                 : "-");
                    }
                });

                // Footer
                page.Footer().AlignRight().Text(text =>
                {
                    text.Span("Pagina ").FontSize(9);
                    text.CurrentPageNumber().FontSize(9);
                    text.Span(" de ").FontSize(9);
                    text.TotalPages().FontSize(9);
                });
            });
        });

        return document.GeneratePdf();
    }

    public byte[] GenerateMembersReport(IEnumerable<Usuario> usuarios)
    {
        QuestPDF.Settings.License = LicenseType.Community;

        var usuariosList = usuarios.ToList();

        var document = Document.Create(container =>
        {
            container.Page(page =>
            {
                page.Size(PageSizes.A4.Landscape());
                page.Margin(1, Unit.Centimetre);
                page.DefaultTextStyle(x => x.FontSize(10));

                // Header
                page.Header().Column(col =>
                {
                    col.Item().AlignCenter().Text("SPORTIFY CLUB MANAGER - Reporte de Miembros")
                        .SemiBold().FontSize(16).FontColor(Colors.Green.Darken2);
                    col.Item().AlignCenter().Text($"Generado el: {DateTime.Now:dd/MM/yyyy HH:mm}")
                        .FontSize(9).FontColor(Colors.Grey.Darken1);
                    col.Item().PaddingTop(4).Height(1).Background(Colors.Green.Darken2);
                });

                // Content
                page.Content().PaddingVertical(8).Table(table =>
                {
                    table.ColumnsDefinition(columns =>
                    {
                        columns.ConstantColumn(40);   // ID
                        columns.RelativeColumn(2);    // Nombre
                        columns.RelativeColumn(2);    // Apellido
                        columns.RelativeColumn(3);    // Correo
                        columns.RelativeColumn(1);    // Activo
                        columns.RelativeColumn(2);    // Fecha Registro
                    });

                    static IContainer HeaderCell(IContainer container) =>
                        container.DefaultTextStyle(x => x.SemiBold().FontColor(Colors.White))
                                 .Background(Colors.Green.Darken2)
                                 .Border(1).BorderColor(Colors.Green.Darken3)
                                 .Padding(5).AlignCenter();

                    table.Header(header =>
                    {
                        header.Cell().Element(HeaderCell).Text("ID");
                        header.Cell().Element(HeaderCell).Text("Nombre");
                        header.Cell().Element(HeaderCell).Text("Apellido");
                        header.Cell().Element(HeaderCell).Text("Correo");
                        header.Cell().Element(HeaderCell).Text("Activo");
                        header.Cell().Element(HeaderCell).Text("Fecha Registro");
                    });

                    var rowIndex = 0;
                    foreach (var usuario in usuariosList)
                    {
                        var bgColor = rowIndex % 2 == 0 ? Colors.White : Colors.Grey.Lighten3;
                        rowIndex++;

                        static IContainer DataCell(IContainer c, string color) =>
                            c.Background(color).Border(1).BorderColor(Colors.Grey.Lighten2)
                             .Padding(4).AlignCenter();

                        table.Cell().Element(c => DataCell(c, bgColor)).Text(usuario.Id.ToString());
                        table.Cell().Element(c => DataCell(c, bgColor)).Text(usuario.Nombre);
                        table.Cell().Element(c => DataCell(c, bgColor)).Text(usuario.Apellido);
                        table.Cell().Element(c => DataCell(c, bgColor)).Text(usuario.Correo);
                        table.Cell().Element(c => DataCell(c, bgColor)).Text(usuario.Activo ? "Si" : "No");
                        table.Cell().Element(c => DataCell(c, bgColor))
                             .Text(usuario.CreadoEn.ToString("dd/MM/yyyy"));
                    }
                });

                // Footer
                page.Footer().AlignRight().Text(text =>
                {
                    text.Span("Pagina ").FontSize(9);
                    text.CurrentPageNumber().FontSize(9);
                    text.Span(" de ").FontSize(9);
                    text.TotalPages().FontSize(9);
                });
            });
        });

        return document.GeneratePdf();
    }

    public byte[] GenerateLocationsReport(IEnumerable<Sede> sedes)
    {
        QuestPDF.Settings.License = LicenseType.Community;
        var sedesList = sedes.ToList();

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
                    col.Item().Text($"Fecha de generacion: {DateTime.Now:dd/MM/yyyy HH:mm}").FontSize(9).FontColor(Colors.Grey.Medium);
                    col.Spacing(5);
                });

                page.Content().PaddingVertical(1, Unit.Centimetre).Table(table =>
                {
                    table.ColumnsDefinition(columns =>
                    {
                        columns.RelativeColumn(3); // Nombre
                        columns.RelativeColumn(3); // Ciudad/Direccion
                        columns.RelativeColumn(2); // Telefono
                        columns.RelativeColumn(1); // Activo
                        columns.RelativeColumn(2); // Fecha
                    });

                    static IContainer HeaderCell(IContainer container) =>
                        container.DefaultTextStyle(x => x.SemiBold().FontColor(Colors.White))
                                 .Background(Colors.Blue.Darken2)
                                 .Border(1).BorderColor(Colors.Blue.Darken3)
                                 .PaddingVertical(5).PaddingHorizontal(5).AlignCenter();

                    static IContainer DataCell(IContainer container, string backgroundColor) =>
                        container.Background(backgroundColor)
                                 .Border(1).BorderColor(Colors.Grey.Lighten2)
                                 .PaddingVertical(5).PaddingHorizontal(5);

                    table.Header(header =>
                    {
                        header.Cell().Element(HeaderCell).Text("Nombre de Sede");
                        header.Cell().Element(HeaderCell).Text("Ubicacion");
                        header.Cell().Element(HeaderCell).Text("Telefono");
                        header.Cell().Element(HeaderCell).Text("Activa");
                        header.Cell().Element(HeaderCell).Text("Registrada");
                    });

                    var rowIndex = 0;
                    foreach (var sede in sedesList)
                    {
                        var bgColor = rowIndex++ % 2 == 0 ? Colors.White : Colors.Grey.Lighten4;
                        table.Cell().Element(c => DataCell(c, bgColor)).Text(sede.Nombre).Bold();
                        table.Cell().Element(c => DataCell(c, bgColor)).Text($"{sede.Ciudad} - {sede.Direccion}");
                        table.Cell().Element(c => DataCell(c, bgColor)).Text(sede.Telefono ?? "N/A");
                        table.Cell().Element(c => DataCell(c, bgColor)).Text(sede.Activo ? "Si" : "No");
                        table.Cell().Element(c => DataCell(c, bgColor)).Text(sede.CreadoEn.ToString("dd/MM/yyyy"));
                    }
                });

                page.Footer().AlignRight().Text(text =>
                {
                    text.Span("Pagina ").FontSize(9);
                    text.CurrentPageNumber().FontSize(9);
                    text.Span(" de ").FontSize(9);
                    text.TotalPages().FontSize(9);
                });
            });
        });

        return document.GeneratePdf();
    }

    public byte[] GeneratePerformanceReport(IEnumerable<Sportify.Application.DTOs.Reports.PerformanceReportItemDto> items)
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
                        col.Item().Text($"Fecha de Generacion: {DateTime.Now:dd/MM/yyyy HH:mm}");
                    });
                });

                page.Content().PaddingVertical(1, Unit.Centimetre).Table(table =>
                {
                    table.ColumnsDefinition(columns =>
                    {
                        columns.RelativeColumn(3); // Nombre
                        columns.RelativeColumn(2); // Fecha Asistencia
                        columns.RelativeColumn(3); // Competencia
                        columns.RelativeColumn(2); // Fecha Competencia
                        columns.RelativeColumn(4); // Observaciones
                    });

                    static IContainer HeaderCell(IContainer container) =>
                        container.DefaultTextStyle(x => x.SemiBold().FontColor(Colors.White))
                                 .Background(Colors.Red.Darken2)
                                 .Border(1).BorderColor(Colors.Red.Darken3)
                                 .PaddingVertical(5).PaddingHorizontal(5).AlignCenter();

                    static IContainer DataCell(IContainer container, string backgroundColor) =>
                        container.Background(backgroundColor)
                                 .Border(1).BorderColor(Colors.Grey.Lighten2)
                                 .PaddingVertical(5).PaddingHorizontal(5);

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
                    text.Span("Pagina ").FontSize(9);
                    text.CurrentPageNumber().FontSize(9);
                    text.Span(" de ").FontSize(9);
                    text.TotalPages().FontSize(9);
                });
            });
        });

        return document.GeneratePdf();
    }
}
