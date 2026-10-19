namespace Sportify.Infrastructure.Repositories;

using Microsoft.EntityFrameworkCore;
using Sportify.Application.Interfaces;
using Sportify.Domain.Entities;
using Sportify.Infrastructure.Persistence;
using System.Collections.Generic;
using System.Threading.Tasks;

public class MembershipPlanRepository : IMembershipPlanRepository
{
    private readonly SportifyDbContext _context;

    public MembershipPlanRepository(SportifyDbContext context)
    {
        _context = context;
    }

    public async Task<IEnumerable<PlanMembresia>> GetAllAsync()
    {
        return await _context.PlanesMembresia.ToListAsync();
    }

    public async Task<PlanMembresia?> GetByIdAsync(int id)
    {
        return await _context.PlanesMembresia.FindAsync(id);
    }

    public async Task<PlanMembresia> AddAsync(PlanMembresia plan)
    {
        _context.PlanesMembresia.Add(plan);
        await _context.SaveChangesAsync();
        return plan;
    }

    public async Task UpdateAsync(PlanMembresia plan)
    {
        _context.PlanesMembresia.Update(plan);
        await _context.SaveChangesAsync();
    }
}
