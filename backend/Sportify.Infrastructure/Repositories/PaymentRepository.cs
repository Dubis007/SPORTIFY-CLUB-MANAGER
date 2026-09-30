using Microsoft.EntityFrameworkCore;
using Sportify.Application.Interfaces;
using Sportify.Domain.Entities;
using Sportify.Infrastructure.Persistence;

namespace Sportify.Infrastructure.Repositories;

public class PaymentRepository : IPaymentRepository
{
    private readonly SportifyDbContext _context;

    public PaymentRepository(SportifyDbContext context)
    {
        _context = context;
    }

    public async Task<IEnumerable<Pago>> GetAllAsync()
    {
        // El HasQueryFilter del DbContext ya excluye pagos con EliminadoEn != null
        return await _context.Pagos
            .Include(p => p.Usuario)
            .Include(p => p.Comprobante)
            .Include(p => p.AprobadoPor)
            .AsNoTracking()
            .ToListAsync();
    }

    public async Task<Pago?> GetByIdAsync(int id)
    {
        return await _context.Pagos
            .Include(p => p.Usuario)
            .Include(p => p.Comprobante)
            .Include(p => p.AprobadoPor)
            .Include(p => p.Membresia)
                .ThenInclude(m => m != null ? m.PlanMembresia : null)
            .FirstOrDefaultAsync(p => p.Id == id);
    }

    public async Task<Pago> CreateAsync(Pago pago)
    {
        _context.Pagos.Add(pago);
        await _context.SaveChangesAsync();
        return pago;
    }

    public async Task UpdateAsync(Pago pago)
    {
        _context.Pagos.Update(pago);
        await _context.SaveChangesAsync();
    }

    public async Task<Membresia?> GetMembresiaByIdAsync(int membresiaId)
    {
        return await _context.Membresias
            .Include(m => m.PlanMembresia)
            .FirstOrDefaultAsync(m => m.Id == membresiaId);
    }
}
