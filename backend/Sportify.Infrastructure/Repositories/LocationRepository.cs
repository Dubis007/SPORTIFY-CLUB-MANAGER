using Microsoft.EntityFrameworkCore;
using Sportify.Application.DTOs.Locations;
using Sportify.Application.Interfaces;
using Sportify.Domain.Entities;
using Sportify.Infrastructure.Persistence;

namespace Sportify.Infrastructure.Repositories;

public class LocationRepository : ILocationRepository
{
    private readonly SportifyDbContext _context;

    public LocationRepository(SportifyDbContext context)
    {
        _context = context;
    }

    public async Task<IEnumerable<LocationDto>> GetAllWithStatsAsync()
    {
        return await _context.Sedes
            .Select(s => new LocationDto
            {
                Id = s.Id,
                Nombre = s.Nombre,
                Direccion = s.Direccion,
                Ciudad = s.Ciudad,
                Telefono = s.Telefono,
                Activo = s.Activo,
                CreadoEn = s.CreadoEn,
                UsuariosActivos = _context.Usuarios.Count(u => u.SedeId == s.Id && u.Activo && u.UsuarioRoles.Any(ur => ur.Rol.Nombre == "MIEMBRO")),
                Empleados = _context.Usuarios.Count(u => u.SedeId == s.Id && u.Activo && u.UsuarioRoles.Any(ur => ur.Rol.Nombre != "MIEMBRO"))
            })
            .ToListAsync();
    }

    public async Task<Sede?> GetByIdAsync(int id)
    {
        return await _context.Sedes.FindAsync(id);
    }

    public async Task<Sede> AddAsync(Sede sede)
    {
        _context.Sedes.Add(sede);
        await _context.SaveChangesAsync();
        return sede;
    }

    public async Task UpdateAsync(Sede sede)
    {
        _context.Sedes.Update(sede);
        await _context.SaveChangesAsync();
    }
}
