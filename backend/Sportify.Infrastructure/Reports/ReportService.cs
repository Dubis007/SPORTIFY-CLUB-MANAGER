using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using QuestPDF.Fluent;
using QuestPDF.Helpers;
using QuestPDF.Infrastructure;
using Sportify.Application.Interfaces;
using Sportify.Domain.Entities;
using Sportify.Infrastructure.Persistence;

namespace Sportify.Infrastructure.Reports;

public class ReportService : IReportService
{
    private readonly SportifyDbContext _context;

    public ReportService(SportifyDbContext context)
    {
        _context = context;
        QuestPDF.Settings.License = LicenseType.Community;
    }

    public async Task<byte[]> GeneratePaymentsReportAsync()
    {
        var pagos = await _context.Pagos
            .Include(p => p.Usuario)
            .Include(p => p.AprobadoPor)
            .OrderByDescending(p => p.FechaPago)
            .ToListAsync();

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

                    static IContainer HeaderCell(IContainer container) =>
                        container.DefaultTextStyle(x => x.SemiBold().FontColor(Colors.White)).Background(Colors.Blue.Darken2).Border(1).BorderColor(Colors.Blue.Darken3).PaddingVertical(5).PaddingHorizontal(5).AlignCenter();

                    static IContainer DataCell(IContainer container, string backgroundColor) =>
                        container.Background(backgroundColor).Border(1).BorderColor(Colors.Grey.Lighten2).PaddingVertical(5).PaddingHorizontal(5);

                    table.Header(header =>
                    {
                        header.Cell().Element(HeaderCell).Text("ID Pago");
                        header.Cell().Element(HeaderCell).Text("Usuario");
                        header.Cell().Element(HeaderCell).Text("Monto (COP)");
                        header.Cell().Element(HeaderCell).Text("Estado");
                        header.Cell().Element(HeaderCell).Text("Fecha Pago");
                        header.Cell().Element(HeaderCell).Text("Fecha Aprobacion");
                    });

                    var rowIndex = 0;
                    foreach (var pago in pagos)
                    {
                        var bgColor = rowIndex++ % 2 == 0 ? Colors.White : Colors.Grey.Lighten4;
                        table.Cell().Element(c => DataCell(c, bgColor)).Text(pago.Id.ToString()).Bold();
                        table.Cell().Element(c => DataCell(c, bgColor)).Text($"{pago.Usuario?.Nombre} {pago.Usuario?.Apellido}");
                        table.Cell().Element(c => DataCell(c, bgColor)).Text(pago.MontoCOP.ToString("C0"));
                        table.Cell().Element(c => DataCell(c, bgColor)).Text(pago.Estado.ToString());
                        table.Cell().Element(c => DataCell(c, bgColor)).Text(pago.FechaPago.ToString("dd/MM/yyyy HH:mm"));
                        table.Cell().Element(c => DataCell(c, bgColor)).Text(pago.FechaAprobacion?.ToString("dd/MM/yyyy HH:mm") ?? "N/A");
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

    public async Task<byte[]> GenerateMembersReportAsync()
    {
        var usuarios = await _context.Usuarios
            .Include(u => u.UsuarioRoles)
                .ThenInclude(ur => ur.Rol)
            .Where(u => u.Activo)
            .OrderBy(u => u.Apellido)
            .ToListAsync();

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

                    static IContainer HeaderCell(IContainer container) =>
                        container.DefaultTextStyle(x => x.SemiBold().FontColor(Colors.White)).Background(Colors.Green.Darken2).Border(1).BorderColor(Colors.Green.Darken3).PaddingVertical(5).PaddingHorizontal(5).AlignCenter();

                    static IContainer DataCell(IContainer container, string backgroundColor) =>
                        container.Background(backgroundColor).Border(1).BorderColor(Colors.Grey.Lighten2).PaddingVertical(5).PaddingHorizontal(5);

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
                        table.Cell().Element(c => DataCell(c, bgColor)).Text($"{user.Nombre} {user.Apellido}").Bold();
                        table.Cell().Element(c => DataCell(c, bgColor)).Text(user.Correo);
                        var roles = string.Join(", ", user.UsuarioRoles.Select(ur => ur.Rol.Nombre));
                        table.Cell().Element(c => DataCell(c, bgColor)).Text(roles);
                        table.Cell().Element(c => DataCell(c, bgColor)).Text(user.CreadoEn.ToString("dd/MM/yyyy"));
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

    public async Task<byte[]> GenerateLocationsReportAsync()
    {
        var sedes = await _context.Sedes
            .OrderBy(s => s.Nombre)
            .ToListAsync();

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
                        columns.RelativeColumn(3);
                        columns.RelativeColumn(3);
                        columns.RelativeColumn(2);
                        columns.RelativeColumn(1);
                        columns.RelativeColumn(2);
                    });

                    static IContainer HeaderCell(IContainer container) =>
                        container.DefaultTextStyle(x => x.SemiBold().FontColor(Colors.White)).Background(Colors.Blue.Darken2).Border(1).BorderColor(Colors.Blue.Darken3).PaddingVertical(5).PaddingHorizontal(5).AlignCenter();

                    static IContainer DataCell(IContainer container, string backgroundColor) =>
                        container.Background(backgroundColor).Border(1).BorderColor(Colors.Grey.Lighten2).PaddingVertical(5).PaddingHorizontal(5);

                    table.Header(header =>
                    {
                        header.Cell().Element(HeaderCell).Text("Nombre de Sede");
                        header.Cell().Element(HeaderCell).Text("Ubicacion");
                        header.Cell().Element(HeaderCell).Text("Telefono");
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

    public async Task<byte[]> GeneratePerformanceReportAsync()
    {
        var evaluaciones = await _context.EvaluacionesCompetencia
            .Include(e => e.Inscripcion)
                .ThenInclude(i => i.Competencia)
            .Include(e => e.Inscripcion)
                .ThenInclude(i => i.Usuario)
            .OrderByDescending(e => e.EvaluadoEn)
            .ToListAsync();

        var items = new List<Sportify.Application.DTOs.Reports.PerformanceReportItemDto>();

        foreach (var eval in evaluaciones)
        {
            var ultimaAsistencia = await _context.Asistencias
                .Where(a => a.UsuarioId == eval.Inscripcion.UsuarioId && a.Presente)
                .OrderByDescending(a => a.FechaRegistro)
                .Select(a => (DateTime?)a.FechaRegistro)
                .FirstOrDefaultAsync();

            items.Add(new Sportify.Application.DTOs.Reports.PerformanceReportItemDto
            {
                Atleta = $"{eval.Inscripcion.Usuario.Nombre} {eval.Inscripcion.Usuario.Apellido}",
                FechaUltimaAsistencia = ultimaAsistencia,
                Competencia = eval.Inscripcion.Competencia.Nombre,
                FechaCompetencia = eval.Inscripcion.Competencia.FechaInicio,
                Observaciones = eval.Comentarios ?? "Sin observaciones"
            });
        }

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
                        columns.RelativeColumn(3);
                        columns.RelativeColumn(2);
                        columns.RelativeColumn(3);
                        columns.RelativeColumn(2);
                        columns.RelativeColumn(4);
                    });

                    static IContainer HeaderCell(IContainer container) =>
                        container.DefaultTextStyle(x => x.SemiBold().FontColor(Colors.White)).Background(Colors.Red.Darken2).Border(1).BorderColor(Colors.Red.Darken3).PaddingVertical(5).PaddingHorizontal(5).AlignCenter();

                    static IContainer DataCell(IContainer container, string backgroundColor) =>
                        container.Background(backgroundColor).Border(1).BorderColor(Colors.Grey.Lighten2).PaddingVertical(5).PaddingHorizontal(5);

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
