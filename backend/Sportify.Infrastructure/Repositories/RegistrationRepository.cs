using Microsoft.EntityFrameworkCore;
using Sportify.Application.Interfaces;
using Sportify.Domain.Entities;
using Sportify.Infrastructure.Persistence;

namespace Sportify.Infrastructure.Repositories;

public class RegistrationRepository : IRegistrationRepository
{
    private readonly SportifyDbContext _context;

    public RegistrationRepository(SportifyDbContext context)
    {
        _context = context;
    }

    public async Task<IEnumerable<object>> GetAllAsync()
    {
        return await _context.InscripcionesCompetencia
            .Include(i => i.Competencia)
            .Include(i => i.Usuario)
            .Select(i => new {
                i.Id,
                i.CompetenciaId,
                i.UsuarioId,
                i.Estado,
                i.FechaInscripcion,
                UsuarioNombre = i.Usuario.Nombre + " " + i.Usuario.Apellido,
                CompetenciaNombre = i.Competencia.Nombre
            })
            .ToListAsync();
    }

    public async Task<object> GetOptionsAsync()
    {
        var competitions = await _context.Competencias
            .Where(c => c.EliminadoEn == null)
            .Select(c => new { c.Id, c.Nombre, c.FechaInicio })
            .OrderBy(c => c.FechaInicio)
            .ToListAsync();

        var members = await _context.Usuarios
            .Include(u => u.UsuarioRoles)
            .ThenInclude(ur => ur.Rol)
            .Where(u => u.Activo && u.UsuarioRoles.Any(ur => ur.Rol.Nombre == "MIEMBRO"))
            .Select(u => new { u.Id, u.Nombre, u.Apellido })
            .OrderBy(u => u.Nombre)
            .ToListAsync();

        return new {
            Competitions = competitions,
            Members = members
        };
    }

    public async Task<bool> ExistsAsync(int usuarioId, int competenciaId)
    {
        return await _context.InscripcionesCompetencia
            .AnyAsync(i => i.UsuarioId == usuarioId && i.CompetenciaId == competenciaId);
    }

    public async Task<InscripcionCompetencia?> GetByIdAsync(int id)
    {
        return await _context.InscripcionesCompetencia.FindAsync(id);
    }

    public async Task AddAsync(InscripcionCompetencia inscripcion)
    {
        _context.InscripcionesCompetencia.Add(inscripcion);
        await _context.SaveChangesAsync();
    }

    public async Task UpdateAsync(InscripcionCompetencia inscripcion)
    {
        await _context.SaveChangesAsync();
    }

    public async Task DeleteAsync(InscripcionCompetencia inscripcion)
    {
        _context.InscripcionesCompetencia.Remove(inscripcion);
        await _context.SaveChangesAsync();
    }
}
