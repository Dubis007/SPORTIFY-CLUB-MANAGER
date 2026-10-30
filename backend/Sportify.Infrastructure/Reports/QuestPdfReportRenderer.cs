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

    public byte[] RenderPaymentVoucher(PaymentVoucherDataDto voucher)
    {
        var (statusBg, statusFg, statusLabel) = voucher.Estado switch
        {
            "APROBADO" => (Colors.Green.Lighten4, Colors.Green.Darken3, "APROBADO / AL DÍA"),
            "RECHAZADO" => (Colors.Red.Lighten4, Colors.Red.Darken3, "RECHAZADO"),
            _ => (Colors.Amber.Lighten4, Colors.Amber.Darken3, "PENDIENTE DE VALIDACIÓN")
        };

        var document = Document.Create(container =>
        {
            // Página 1: Colilla oficial y detalle de la obligación / pago
            container.Page(page =>
            {
                page.Size(PageSizes.A4);
                page.Margin(1.8f, Unit.Centimetre);
                page.PageColor(Colors.White);
                page.DefaultTextStyle(x => x.FontSize(10).FontColor(Colors.Grey.Darken4));

                page.Header().Column(col =>
                {
                    col.Item().Row(row =>
                    {
                        row.RelativeItem().Column(left =>
                        {
                            left.Item().Text("SPORTIFY CLUB MANAGER").Bold().FontSize(18).FontColor(Colors.Blue.Darken3);
                            left.Item().Text("Colilla Oficial de Pago y Estado de Membresía").FontSize(11).FontColor(Colors.Grey.Darken2);
                            left.Item().Text($"Referencia: {voucher.CodigoVerificacion}").SemiBold().FontSize(9).FontColor(Colors.Blue.Darken2);
                        });

                        row.ConstantItem(170).Background(statusBg).Border(1).BorderColor(statusFg)
                            .PaddingVertical(8).PaddingHorizontal(10).AlignCenter().AlignMiddle()
                            .Text(statusLabel).Bold().FontSize(10).FontColor(statusFg);
                    });

                    col.Item().PaddingTop(10).Height(1.5f).Background(Colors.Blue.Darken3);
                });

                page.Content().PaddingVertical(16).Column(col =>
                {
                    col.Spacing(14);

                    col.Item().Background(Colors.Grey.Lighten4).Border(1).BorderColor(Colors.Grey.Lighten2).Padding(12).Column(info =>
                    {
                        info.Spacing(4);
                        info.Item().Text("DATOS DEL DEPORTISTA / TITULAR").Bold().FontSize(10).FontColor(Colors.Blue.Darken3);
                        info.Item().Text($"Nombre Completo: {voucher.UsuarioNombre}").SemiBold();
                        info.Item().Text($"Correo Registrado: {voucher.UsuarioCorreo}");
                        info.Item().Text($"Sede Asignada: {voucher.SedeNombre}");
                    });

                    col.Item().Table(table =>
                    {
                        table.ColumnsDefinition(columns =>
                        {
                            columns.ConstantColumn(65);
                            columns.RelativeColumn(2.5f);
                            columns.RelativeColumn(2f);
                            columns.RelativeColumn(1.5f);
                        });

                        static IContainer HeaderCell(IContainer c) =>
                            c.DefaultTextStyle(x => x.SemiBold().FontColor(Colors.White))
                             .Background(Colors.Blue.Darken3).Padding(7);

                        static IContainer BodyCell(IContainer c) =>
                            c.BorderBottom(1).BorderColor(Colors.Grey.Lighten2).Padding(7);

                        table.Header(h =>
                        {
                            h.Cell().Element(HeaderCell).Text("ID Pago");
                            h.Cell().Element(HeaderCell).Text("Concepto / Plan");
                            h.Cell().Element(HeaderCell).Text("Vigencia");
                            h.Cell().Element(HeaderCell).AlignRight().Text("Valor (COP)");
                        });

                        var vigencia = voucher.FechaInicioMembresia.HasValue && voucher.FechaFinMembresia.HasValue
                            ? $"{voucher.FechaInicioMembresia:dd/MM/yyyy} - {voucher.FechaFinMembresia:dd/MM/yyyy}"
                            : "Pago puntual";

                        table.Cell().Element(BodyCell).Text($"#{voucher.PagoId}").Bold();
                        table.Cell().Element(BodyCell).Text(voucher.PlanNombre);
                        table.Cell().Element(BodyCell).Text(vigencia);
                        table.Cell().Element(BodyCell).AlignRight().Text($"$ {voucher.MontoCOP:N0} COP").Bold();
                    });

                    col.Item().Border(1).BorderColor(Colors.Grey.Lighten2).Padding(12).Column(audit =>
                    {
                        audit.Spacing(4);
                        audit.Item().Text("TRAZABILIDAD CONTABLE").Bold().FontSize(10).FontColor(Colors.Blue.Darken3);
                        audit.Item().Text($"Fecha de Registro: {voucher.FechaPago:dd/MM/yyyy HH:mm} UTC");
                        audit.Item().Text($"Fecha de Revisión Contable: {(voucher.FechaAprobacion.HasValue ? voucher.FechaAprobacion.Value.ToString("dd/MM/yyyy HH:mm") + " UTC" : "En espera de validación")}");
                        audit.Item().Text($"Auditor Responsable: {voucher.AprobadoPorNombre ?? "Pendiente de asignación"}");
                        if (!string.IsNullOrWhiteSpace(voucher.ComentarioRechazo))
                        {
                            audit.Item().Text($"Motivo de Rechazo: {voucher.ComentarioRechazo}").FontColor(Colors.Red.Darken2).SemiBold();
                        }
                    });
                });

                page.Footer().Row(row =>
                {
                    row.RelativeItem().Text($"Emitido el {DateTime.UtcNow:dd/MM/yyyy HH:mm} UTC").FontSize(8).FontColor(Colors.Grey.Darken1);
                    row.ConstantItem(100).AlignRight().Text(t =>
                    {
                        t.Span("Página ").FontSize(8);
                        t.CurrentPageNumber().FontSize(8);
                        t.Span(" de ").FontSize(8);
                        t.TotalPages().FontSize(8);
                    });
                });
            });

            // Página 2: Instrucciones institucionales de recaudo y código de verificación
            container.Page(page =>
            {
                page.Size(PageSizes.A4);
                page.Margin(1.8f, Unit.Centimetre);
                page.PageColor(Colors.White);
                page.DefaultTextStyle(x => x.FontSize(10).FontColor(Colors.Grey.Darken4));

                page.Header().Column(col =>
                {
                    col.Item().Text("SPORTIFY CLUB MANAGER — Información de Recaudo y Verificación")
                        .Bold().FontSize(14).FontColor(Colors.Blue.Darken3);
                    col.Item().PaddingTop(6).Height(1).Background(Colors.Blue.Darken3);
                });

                page.Content().PaddingVertical(16).Column(col =>
                {
                    col.Spacing(14);
                    col.Item().Background(Colors.Blue.Lighten5).Border(1).BorderColor(Colors.Blue.Lighten3).Padding(14).Column(bank =>
                    {
                        bank.Spacing(5);
                        bank.Item().Text("CANALES INSTITUCIONALES DE RECAUDO").Bold().FontColor(Colors.Blue.Darken3);
                        bank.Item().Text("• Canal Oficial: Tesorería Sportify Club Manager (Transferencia / Consignación verificada por Contaduría).");
                        bank.Item().Text($"• Referencia Obligatoria del Comprobante: {voucher.CodigoVerificacion}");
                        bank.Item().Text("• Recuerde cargar el soporte digital (PDF, JPG o PNG) en su portal de miembro para conciliación.");
                    });

                    col.Item().AlignCenter().Width(240).Border(1.5f).BorderColor(Colors.Blue.Darken3).Padding(14).Column(qrBox =>
                    {
                        qrBox.Spacing(6);
                        qrBox.Item().AlignCenter().Text("SELLO DE VERIFICACIÓN DIGITAL").Bold().FontSize(9).FontColor(Colors.Blue.Darken3);
                        qrBox.Item().AlignCenter().Background(Colors.Grey.Lighten3).Padding(12)
                            .Text(voucher.CodigoVerificacion).FontFamily(Fonts.Consolas).Bold().FontSize(11);
                        qrBox.Item().AlignCenter().Text($"Pago #{voucher.PagoId} • Estado: {voucher.Estado}").FontSize(8).FontColor(Colors.Grey.Darken2);
                    });
                });

                page.Footer().Row(row =>
                {
                    row.RelativeItem().Text("Documento generado electrónicamente por Sportify Club Manager.").FontSize(8).FontColor(Colors.Grey.Darken1);
                    row.ConstantItem(100).AlignRight().Text(t =>
                    {
                        t.Span("Página ").FontSize(8);
                        t.CurrentPageNumber().FontSize(8);
                        t.Span(" de ").FontSize(8);
                        t.TotalPages().FontSize(8);
                    });
                });
            });
        });

        return document.GeneratePdf();
    }
}
