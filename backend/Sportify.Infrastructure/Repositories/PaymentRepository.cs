using Microsoft.EntityFrameworkCore;
using Sportify.Application.DTOs.Payments;
using Sportify.Application.Interfaces;
using Sportify.Domain.Entities;
using Sportify.Domain.Enums;
using Sportify.Infrastructure.Persistence;

namespace Sportify.Infrastructure.Repositories;

public class PaymentRepository : IPaymentRepository
{
    private readonly SportifyDbContext _context;

    public PaymentRepository(SportifyDbContext context)
    {
        _context = context;
    }

    public async Task<(IReadOnlyList<Pago> Items, int Total)> GetPagedAsync(int skip, int take)
    {
        // El HasQueryFilter del DbContext ya excluye pagos con EliminadoEn != null
        var query = _context.Pagos.AsNoTracking();

        var total = await query.CountAsync();

        // Orden estable (fecha + Id) para que Skip/Take no repita ni omita registros entre páginas
        var items = await query
            .Include(p => p.Usuario)
            .Include(p => p.Comprobante)
            .Include(p => p.AprobadoPor)
            .OrderByDescending(p => p.FechaPago)
            .ThenByDescending(p => p.Id)
            .Skip(skip)
            .Take(take)
            .ToListAsync();

        return (items, total);
    }

    public async Task<PaymentSummaryDto> GetSummaryAsync()
    {
        var pendientes = await _context.Pagos.CountAsync(p => p.Estado == EstadoPago.PENDIENTE);
        var totalAprobado = await _context.Pagos
            .Where(p => p.Estado == EstadoPago.APROBADO)
            .SumAsync(p => p.MontoCOP);

        return new PaymentSummaryDto { Pendientes = pendientes, TotalAprobadoCOP = totalAprobado };
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

    public async Task<IEnumerable<Usuario>> GetMembersForOptionsAsync()
    {
        return await _context.Usuarios
            .Include(u => u.UsuarioRoles)
            .ThenInclude(ur => ur.Rol)
            .Where(u => u.Activo && u.UsuarioRoles.Any(ur => ur.Rol.Nombre == "MIEMBRO"))
            .OrderBy(u => u.Nombre)
            .ToListAsync();
    }

    public async Task<IEnumerable<Membresia>> GetMembershipsForOptionsAsync()
    {
        return await _context.Membresias
            .Include(m => m.PlanMembresia)
            .ToListAsync();
    }

    public async Task CreateComprobanteAsync(ComprobantePago comprobante)
    {
        _context.ComprobantesPago.Add(comprobante);
        await _context.SaveChangesAsync();
    }

    public async Task UpdateMembresiaAsync(Membresia membresia)
    {
        _context.Membresias.Update(membresia);
        await _context.SaveChangesAsync();
    }
}
