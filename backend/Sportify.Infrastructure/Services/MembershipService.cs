using Microsoft.EntityFrameworkCore;
using Sportify.Application.DTOs.Memberships;
using Sportify.Application.Interfaces;
using Sportify.Domain.Entities;
using Sportify.Infrastructure.Persistence;

namespace Sportify.Infrastructure.Services;

public class MembershipService : IMembershipService
{
    private readonly SportifyDbContext _context;

    public MembershipService(SportifyDbContext context)
    {
        _context = context;
    }

    public async Task<IEnumerable<PlanMembresiaDto>> GetPlansAsync()
    {
        var planes = await _context.PlanesMembresia
            .Where(p => p.Activo)
            .ToListAsync();

        return planes.Select(p => new PlanMembresiaDto
        {
            Id = p.Id,
            Nombre = p.Nombre,
            Descripcion = p.Descripcion,
            PrecioCOP = p.PrecioCOP,
            DuracionDias = p.DuracionDias,
            Activo = p.Activo
        });
    }

    public async Task<IEnumerable<MembershipDto>> GetAllMembershipsAsync()
    {
        var membresias = await _context.Membresias
            .Include(m => m.Usuario)
            .Include(m => m.PlanMembresia)
            .OrderByDescending(m => m.FechaInicio)
            .ToListAsync();

        return membresias.Select(MapToDto);
    }

    public async Task<IEnumerable<MembershipDto>> GetMembershipsByUserAsync(int userId)
    {
        var membresias = await _context.Membresias
            .Include(m => m.Usuario)
            .Include(m => m.PlanMembresia)
            .Where(m => m.UsuarioId == userId)
            .OrderByDescending(m => m.FechaInicio)
            .ToListAsync();

        return membresias.Select(MapToDto);
    }

    public async Task<MembershipDto> CreateMembershipAsync(CreateMembershipDto dto)
    {
        var userExists = await _context.Usuarios.AnyAsync(u => u.Id == dto.UsuarioId);
        if (!userExists) throw new KeyNotFoundException("Usuario no encontrado.");

        // Regla de Negocio: Un usuario no puede tener más de una membresía activa o pendiente.
        var hasActiveMembership = await _context.Membresias
            .AnyAsync(m => m.UsuarioId == dto.UsuarioId && 
                          (m.Estado == Sportify.Domain.Enums.EstadoMembresia.ACTIVA || 
                           m.Estado == Sportify.Domain.Enums.EstadoMembresia.PENDIENTE));
                           
        if (hasActiveMembership)
        {
            throw new InvalidOperationException("El usuario ya tiene una membresía Activa o Pendiente. No puede tener dos membresías al mismo tiempo.");
        }

        var plan = await _context.PlanesMembresia.FindAsync(dto.PlanMembresiaId);
        if (plan == null) throw new KeyNotFoundException("Plan de membresía no encontrado.");

        var membresia = new Membresia
        {
            UsuarioId = dto.UsuarioId,
            PlanMembresiaId = dto.PlanMembresiaId,
            FechaInicio = dto.FechaInicio,
            FechaFin = dto.FechaInicio.AddDays(plan.DuracionDias),
            Estado = Sportify.Domain.Enums.EstadoMembresia.ACTIVA,
            CreadoEn = DateTime.UtcNow,
            ActualizadoEn = DateTime.UtcNow
        };

        _context.Membresias.Add(membresia);
        await _context.SaveChangesAsync();

        // Load navigations
        await _context.Entry(membresia).Reference(m => m.Usuario).LoadAsync();
        await _context.Entry(membresia).Reference(m => m.PlanMembresia).LoadAsync();

        return MapToDto(membresia);
    }

    public async Task<MembershipDto> UpdateMembershipStatusAsync(int id, UpdateMembershipStatusDto dto)
    {
        var membresia = await _context.Membresias
            .Include(m => m.Usuario)
            .Include(m => m.PlanMembresia)
            .FirstOrDefaultAsync(m => m.Id == id);

        if (membresia == null) throw new KeyNotFoundException("Membresía no encontrada.");

        membresia.Estado = dto.Estado;
        membresia.ActualizadoEn = DateTime.UtcNow;

        _context.Membresias.Update(membresia);
        await _context.SaveChangesAsync();

        return MapToDto(membresia);
    }

    private static MembershipDto MapToDto(Membresia m)
    {
        return new MembershipDto
        {
            Id = m.Id,
            UsuarioId = m.UsuarioId,
            UsuarioNombre = $"{m.Usuario?.Nombre} {m.Usuario?.Apellido}",
            PlanMembresiaId = m.PlanMembresiaId,
            PlanNombre = m.PlanMembresia?.Nombre ?? string.Empty,
            FechaInicio = m.FechaInicio,
            FechaFin = m.FechaFin,
            Estado = m.Estado.ToString(),
            CreadoEn = m.CreadoEn
        };
    }
}
