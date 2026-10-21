using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Sportify.Application.Interfaces;
using Sportify.Domain.Entities;
using Sportify.Infrastructure.Persistence;

namespace Sportify.Infrastructure.Repositories;

public class MemberProfileRepository : IMemberProfileRepository
{
    private readonly SportifyDbContext _context;

    public MemberProfileRepository(SportifyDbContext context)
    {
        _context = context;
    }

    public async Task<Usuario?> GetUserByIdAsync(int userId)
    {
        return await _context.Usuarios.FindAsync(userId);
    }

    public async Task UpdateUserAsync(Usuario user)
    {
        _context.Usuarios.Update(user);
        await _context.SaveChangesAsync();
    }

    public async Task<IEnumerable<Membresia>> GetMembershipsByUserIdAsync(int userId)
    {
        return await _context.Membresias
            .Include(m => m.PlanMembresia)
            .Where(m => m.UsuarioId == userId)
            .OrderByDescending(m => m.FechaInicio)
            .ToListAsync();
    }

    public async Task<IEnumerable<Pago>> GetPaymentsByUserIdAsync(int userId)
    {
        return await _context.Pagos
            .Include(p => p.Membresia)
                .ThenInclude(m => m!.PlanMembresia)
            .Where(p => p.UsuarioId == userId)
            .OrderByDescending(p => p.FechaPago)
            .ToListAsync();
    }

    public async Task<IEnumerable<Entrenamiento>> GetUpcomingTrainingsAsync(DateTime fromDate)
    {
        return await _context.Entrenamientos
            .Where(e => e.FechaHora >= fromDate && e.EliminadoEn == null)
            .OrderBy(e => e.FechaHora)
            .ToListAsync();
    }

    public async Task<IEnumerable<Asistencia>> GetAttendancesByUserIdAsync(int userId)
    {
        return await _context.Asistencias
            .Include(a => a.Entrenamiento)
            .Where(a => a.UsuarioId == userId && a.Presente)
            .OrderByDescending(a => a.FechaRegistro)
            .ToListAsync();
    }

    public async Task<IEnumerable<InscripcionCompetencia>> GetCompetitionsByUserIdAsync(int userId)
    {
        return await _context.InscripcionesCompetencia
            .Include(i => i.Competencia)
            .Where(i => i.UsuarioId == userId)
            .OrderByDescending(i => i.Competencia.FechaInicio)
            .ToListAsync();
    }
}
