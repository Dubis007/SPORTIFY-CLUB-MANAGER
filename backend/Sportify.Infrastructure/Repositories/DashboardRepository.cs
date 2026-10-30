using Microsoft.EntityFrameworkCore;
using Sportify.Application.Interfaces;
using Sportify.Domain.Enums;
using Sportify.Infrastructure.Persistence;

namespace Sportify.Infrastructure.Repositories;

public class DashboardRepository : IDashboardRepository
{
    private readonly SportifyDbContext _context;

    public DashboardRepository(SportifyDbContext context)
    {
        _context = context;
    }

    public Task<int> CountActiveUsersAsync()
    {
        return _context.Usuarios.CountAsync(u => u.Activo);
    }

    public Task<int> CountActiveSportMembersAsync()
    {
        return _context.Usuarios.CountAsync(u =>
            u.Activo && u.UsuarioRoles.Any(ur => ur.Rol.Nombre == "MIEMBRO"));
    }

    public Task<int> CountActiveMembersWithoutAttendanceSinceAsync(DateTime sinceUtc)
    {
        return _context.Usuarios.CountAsync(u =>
            u.Activo &&
            u.UsuarioRoles.Any(ur => ur.Rol.Nombre == "MIEMBRO") &&
            !u.Asistencias.Any(a => a.Presente && a.FechaRegistro >= sinceUtc));
    }

    public Task<int> CountMembershipsByStatusAsync(EstadoMembresia estado)
    {
        return _context.Membresias.CountAsync(m => m.Estado == estado);
    }

    public Task<int> CountMembershipsExpiringBetweenAsync(DateTime fromUtc, DateTime toUtc)
    {
        return _context.Membresias.CountAsync(m =>
            m.Estado == EstadoMembresia.ACTIVA &&
            m.FechaFin >= fromUtc &&
            m.FechaFin <= toUtc);
    }

    public Task<int> CountPaymentsByStatusAsync(EstadoPago estado)
    {
        return _context.Pagos.CountAsync(p => p.Estado == estado);
    }

    public Task<decimal> SumApprovedPaymentsSinceAsync(DateTime fromUtc)
    {
        return _context.Pagos
            .Where(p => p.Estado == EstadoPago.APROBADO && p.FechaPago >= fromUtc)
            .SumAsync(p => p.MontoCOP);
    }

    public Task<decimal> SumAllApprovedPaymentsAsync()
    {
        return _context.Pagos
            .Where(p => p.Estado == EstadoPago.APROBADO)
            .SumAsync(p => p.MontoCOP);
    }

    public Task<int> CountScheduledTrainingsAsync(DateTime fromUtc)
    {
        return _context.Entrenamientos.CountAsync(e =>
            e.EliminadoEn == null &&
            e.Estado != "CERRADO" &&
            e.FechaFin >= fromUtc);
    }

    public Task<int> CountActiveCompetitionsAsync(DateTime fromUtc)
    {
        return _context.Competencias.CountAsync(c =>
            c.EliminadoEn == null &&
            c.FechaFin >= fromUtc);
    }

    public async Task<(int PresentCount, int TotalCount)> GetAttendanceTotalsAsync()
    {
        var total = await _context.Asistencias.CountAsync();
        if (total == 0)
        {
            return (0, 0);
        }

        var present = await _context.Asistencias.CountAsync(a => a.Presente);
        return (present, total);
    }

    public async Task<IReadOnlyList<(int Year, int Month, decimal TotalCOP)>> GetMonthlyApprovedPaymentsSinceAsync(DateTime fromUtc)
    {
        var rows = await _context.Pagos
            .Where(p => p.Estado == EstadoPago.APROBADO && p.FechaPago >= fromUtc)
            .GroupBy(p => new { p.FechaPago.Year, p.FechaPago.Month })
            .Select(g => new { g.Key.Year, g.Key.Month, Total = g.Sum(p => p.MontoCOP) })
            .ToListAsync();

        return rows.Select(r => (r.Year, r.Month, r.Total)).ToList();
    }

    public async Task<IReadOnlyList<(int Year, int Month, int Count)>> GetMonthlyNewUsersSinceAsync(DateTime fromUtc)
    {
        var rows = await _context.Usuarios
            .Where(u => u.CreadoEn >= fromUtc)
            .GroupBy(u => new { u.CreadoEn.Year, u.CreadoEn.Month })
            .Select(g => new { g.Key.Year, g.Key.Month, Cantidad = g.Count() })
            .ToListAsync();

        return rows.Select(r => (r.Year, r.Month, r.Cantidad)).ToList();
    }

    public async Task<IReadOnlyList<(EstadoMembresia Estado, int Count)>> GetMembershipsGroupedByStatusAsync()
    {
        var rows = await _context.Membresias
            .GroupBy(m => m.Estado)
            .Select(g => new { Estado = g.Key, Cantidad = g.Count() })
            .ToListAsync();

        return rows.Select(r => (r.Estado, r.Cantidad)).ToList();
    }
}
