using Microsoft.EntityFrameworkCore;
using Sportify.Application.Interfaces;
using Sportify.Domain.Entities;
using Sportify.Domain.Enums;
using Sportify.Infrastructure.Persistence;

namespace Sportify.Infrastructure.Repositories;

public class MembershipRepository : IMembershipRepository
{
    private readonly SportifyDbContext _context;

    public MembershipRepository(SportifyDbContext context)
    {
        _context = context;
    }

    public async Task<IReadOnlyList<PlanMembresia>> GetActivePlansAsync()
    {
        return await _context.PlanesMembresia
            .Where(p => p.Activo)
            .ToListAsync();
    }

    public async Task<IReadOnlyList<Membresia>> GetAllWithDetailsAsync()
    {
        return await _context.Membresias
            .Include(m => m.Usuario)
            .Include(m => m.PlanMembresia)
            .OrderByDescending(m => m.FechaInicio)
            .ToListAsync();
    }

    public async Task<IReadOnlyList<Membresia>> GetByUserIdWithDetailsAsync(int userId)
    {
        return await _context.Membresias
            .Include(m => m.Usuario)
            .Include(m => m.PlanMembresia)
            .Where(m => m.UsuarioId == userId)
            .OrderByDescending(m => m.FechaInicio)
            .ToListAsync();
    }

    public async Task<Membresia?> GetByIdWithDetailsAsync(int id)
    {
        return await _context.Membresias
            .Include(m => m.Usuario)
            .Include(m => m.PlanMembresia)
            .FirstOrDefaultAsync(m => m.Id == id);
    }

    public async Task<bool> UserExistsAsync(int userId)
    {
        return await _context.Usuarios.AnyAsync(u => u.Id == userId);
    }

    public async Task<bool> HasActiveOrPendingMembershipAsync(int userId)
    {
        return await _context.Membresias.AnyAsync(m =>
            m.UsuarioId == userId &&
            (m.Estado == EstadoMembresia.ACTIVA || m.Estado == EstadoMembresia.PENDIENTE));
    }

    public async Task<PlanMembresia?> GetPlanByIdAsync(int planId)
    {
        return await _context.PlanesMembresia.FindAsync(planId);
    }

    public async Task<Membresia> AddAsync(Membresia membresia)
    {
        _context.Membresias.Add(membresia);
        await _context.SaveChangesAsync();

        await _context.Entry(membresia).Reference(m => m.Usuario).LoadAsync();
        await _context.Entry(membresia).Reference(m => m.PlanMembresia).LoadAsync();
        return membresia;
    }

    public async Task UpdateAsync(Membresia membresia)
    {
        _context.Membresias.Update(membresia);
        await _context.SaveChangesAsync();
    }
}
