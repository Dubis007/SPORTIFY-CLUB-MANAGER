using Microsoft.EntityFrameworkCore;
using Sportify.Application.Interfaces;
using Sportify.Domain.Entities;
using Sportify.Infrastructure.Persistence;

namespace Sportify.Infrastructure.Repositories;

public class EvaluationRepository : IEvaluationRepository
{
    private readonly SportifyDbContext _context;

    public EvaluationRepository(SportifyDbContext context)
    {
        _context = context;
    }

    public async Task<(List<EvaluacionCompetencia> Items, int Total)> GetPagedWithIncludesAsync(int skip, int take, int? evaluadoPorId)
    {
        var query = _context.EvaluacionesCompetencia.AsNoTracking();
        if (evaluadoPorId.HasValue)
            query = query.Where(e => e.EvaluadoPorId == evaluadoPorId.Value);

        var total = await query.CountAsync();

        var items = await query
            .Include(e => e.Inscripcion)
                .ThenInclude(i => i.Usuario)
            .Include(e => e.Inscripcion)
                .ThenInclude(i => i.Competencia)
            .OrderByDescending(e => e.EvaluadoEn)
            .ThenByDescending(e => e.Id)
            .Skip(skip)
            .Take(take)
            .ToListAsync();

        return (items, total);
    }

    public async Task<List<EvaluacionCompetencia>> GetAllWithIncludesAsync()
    {
        return await _context.EvaluacionesCompetencia
            .Include(e => e.Inscripcion)
                .ThenInclude(i => i.Usuario)
            .Include(e => e.Inscripcion)
                .ThenInclude(i => i.Competencia)
            .ToListAsync();
    }

    public async Task<List<InscripcionCompetencia>> GetInscripcionesOptionsAsync()
    {
        return await _context.InscripcionesCompetencia
            .Include(i => i.Usuario)
            .Include(i => i.Competencia)
            .Where(i => i.Estado == Sportify.Domain.Enums.EstadoInscripcion.CONFIRMADA || i.Estado == Sportify.Domain.Enums.EstadoInscripcion.PAGO)
            .ToListAsync();
    }

    public async Task<bool> ExistsByInscripcionIdAsync(int inscripcionId)
    {
        return await _context.EvaluacionesCompetencia.AnyAsync(e => e.InscripcionId == inscripcionId);
    }

    public async Task<EvaluacionCompetencia?> GetByIdAsync(int id)
    {
        return await _context.EvaluacionesCompetencia.FindAsync(id);
    }

    public async Task AddAsync(EvaluacionCompetencia evaluacion)
    {
        _context.EvaluacionesCompetencia.Add(evaluacion);
        await _context.SaveChangesAsync();
    }

    public async Task UpdateAsync(EvaluacionCompetencia evaluacion)
    {
        _context.EvaluacionesCompetencia.Update(evaluacion);
        await _context.SaveChangesAsync();
    }

    public async Task DeleteAsync(EvaluacionCompetencia evaluacion)
    {
        _context.EvaluacionesCompetencia.Remove(evaluacion);
        await _context.SaveChangesAsync();
    }
}
