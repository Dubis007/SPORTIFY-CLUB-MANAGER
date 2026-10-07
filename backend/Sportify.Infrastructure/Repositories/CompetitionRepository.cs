using Microsoft.EntityFrameworkCore;
using Sportify.Application.Interfaces;
using Sportify.Domain.Entities;
using Sportify.Infrastructure.Persistence;

namespace Sportify.Infrastructure.Repositories;

public class CompetitionRepository : ICompetitionRepository
{
    private readonly SportifyDbContext _context;

    public CompetitionRepository(SportifyDbContext context)
    {
        _context = context;
    }

    public async Task<IEnumerable<Competencia>> GetAllAsync()
    {
        return await _context.Competencias
            .Where(c => c.EliminadoEn == null)
            .ToListAsync();
    }

    public async Task<Competencia?> GetByIdAsync(int id)
    {
        return await _context.Competencias.FindAsync(id);
    }

    public async Task AddAsync(Competencia competencia)
    {
        _context.Competencias.Add(competencia);
        await _context.SaveChangesAsync();
    }

    public async Task UpdateAsync(Competencia competencia)
    {
        await _context.SaveChangesAsync();
    }
}
