using Microsoft.EntityFrameworkCore;
using Sportify.Application.DTOs.Reports;
using Sportify.Application.Interfaces;
using Sportify.Infrastructure.Persistence;

namespace Sportify.Infrastructure.Repositories;

public class ReportRepository : IReportRepository
{
    private readonly SportifyDbContext _context;

    public ReportRepository(SportifyDbContext context)
    {
        _context = context;
    }

    public async Task<IReadOnlyList<PaymentReportRowDto>> GetPaymentsReportDataAsync()
    {
        var pagos = await _context.Pagos
            .Include(p => p.Usuario)
            .OrderByDescending(p => p.FechaPago)
            .ToListAsync();

        return pagos.Select(p => new PaymentReportRowDto
        {
            Id = p.Id,
            UsuarioNombre = $"{p.Usuario?.Nombre} {p.Usuario?.Apellido}".Trim(),
            MontoCOP = p.MontoCOP,
            Estado = p.Estado.ToString(),
            FechaPago = p.FechaPago,
            FechaAprobacion = p.FechaAprobacion
        }).ToList();
    }

    public async Task<IReadOnlyList<MemberReportRowDto>> GetActiveMembersReportDataAsync()
    {
        var usuarios = await _context.Usuarios
            .Include(u => u.UsuarioRoles)
                .ThenInclude(ur => ur.Rol)
            .Where(u => u.Activo)
            .OrderBy(u => u.Apellido)
            .ToListAsync();

        return usuarios.Select(u => new MemberReportRowDto
        {
            NombreCompleto = $"{u.Nombre} {u.Apellido}".Trim(),
            Correo = u.Correo,
            Roles = string.Join(", ", u.UsuarioRoles.Select(ur => ur.Rol.Nombre)),
            FechaRegistro = u.CreadoEn
        }).ToList();
    }

    public async Task<IReadOnlyList<LocationReportRowDto>> GetLocationsReportDataAsync()
    {
        var sedes = await _context.Sedes
            .OrderBy(s => s.Nombre)
            .ToListAsync();

        return sedes.Select(s => new LocationReportRowDto
        {
            Nombre = s.Nombre,
            Ciudad = s.Ciudad,
            Direccion = s.Direccion,
            Telefono = s.Telefono,
            Activo = s.Activo,
            CreadoEn = s.CreadoEn
        }).ToList();
    }

    public async Task<IReadOnlyList<PerformanceReportItemDto>> GetPerformanceReportDataAsync()
    {
        var evaluaciones = await _context.EvaluacionesCompetencia
            .Include(e => e.Inscripcion)
                .ThenInclude(i => i.Competencia)
            .Include(e => e.Inscripcion)
                .ThenInclude(i => i.Usuario)
            .OrderByDescending(e => e.EvaluadoEn)
            .ToListAsync();

        if (evaluaciones.Count == 0)
            return [];

        var userIds = evaluaciones.Select(e => e.Inscripcion.UsuarioId).Distinct().ToList();
        var ultimasAsistencias = await _context.Asistencias
            .Where(a => userIds.Contains(a.UsuarioId) && a.Presente)
            .GroupBy(a => a.UsuarioId)
            .Select(g => new { UsuarioId = g.Key, Ultima = g.Max(a => a.FechaRegistro) })
            .ToDictionaryAsync(x => x.UsuarioId, x => (DateTime?)x.Ultima);

        return evaluaciones.Select(eval => new PerformanceReportItemDto
        {
            Atleta = $"{eval.Inscripcion.Usuario.Nombre} {eval.Inscripcion.Usuario.Apellido}".Trim(),
            FechaUltimaAsistencia = ultimasAsistencias.GetValueOrDefault(eval.Inscripcion.UsuarioId),
            Competencia = eval.Inscripcion.Competencia.Nombre,
            FechaCompetencia = eval.Inscripcion.Competencia.FechaInicio,
            Observaciones = eval.Comentarios ?? "Sin observaciones"
        }).ToList();
    }
}
