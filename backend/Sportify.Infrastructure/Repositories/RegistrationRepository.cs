using Microsoft.EntityFrameworkCore;
using Sportify.Application.DTOs.Registrations;
using Sportify.Application.Interfaces;
using Sportify.Domain.Entities;
using Sportify.Domain.Enums;
using Sportify.Infrastructure.Persistence;

namespace Sportify.Infrastructure.Repositories;

public class RegistrationRepository : IRegistrationRepository
{
    private readonly SportifyDbContext _context;

    public RegistrationRepository(SportifyDbContext context)
    {
        _context = context;
    }

    public async Task<IEnumerable<RegistrationDto>> GetAllAsync()
    {
        return await _context.InscripcionesCompetencia
            .AsNoTracking()
            .Include(i => i.Competencia)
            .Include(i => i.Usuario)
            .Select(i => new RegistrationDto
            {
                Id = i.Id,
                CompetenciaId = i.CompetenciaId,
                UsuarioId = i.UsuarioId,
                Estado = i.Estado,
                FechaInscripcion = i.FechaInscripcion,
                UsuarioNombre = i.Usuario.Nombre + " " + i.Usuario.Apellido,
                CompetenciaNombre = i.Competencia.Nombre
            })
            .ToListAsync();
    }

    public async Task<RegistrationOptionsDto> GetOptionsAsync()
    {
        var competitions = await _context.Competencias
            .AsNoTracking()
            .Where(c => c.EliminadoEn == null)
            .Select(c => new RegistrationCompetitionOptionDto
            {
                Id = c.Id,
                Nombre = c.Nombre,
                FechaInicio = c.FechaInicio
            })
            .OrderBy(c => c.FechaInicio)
            .ToListAsync();

        var members = await _context.Usuarios
            .AsNoTracking()
            .Include(u => u.UsuarioRoles)
            .ThenInclude(ur => ur.Rol)
            .Where(u => u.Activo && u.UsuarioRoles.Any(ur => ur.Rol.Nombre == "MIEMBRO"))
            .Select(u => new RegistrationMemberOptionDto
            {
                Id = u.Id,
                Nombre = u.Nombre,
                Apellido = u.Apellido
            })
            .OrderBy(u => u.Nombre)
            .ToListAsync();

        return new RegistrationOptionsDto
        {
            Competitions = competitions,
            Members = members
        };
    }

    public async Task<bool> ExistsAsync(int usuarioId, int competenciaId)
    {
        return await _context.InscripcionesCompetencia
            .AnyAsync(i => i.UsuarioId == usuarioId && i.CompetenciaId == competenciaId);
    }

    public async Task<bool> HasActiveMembershipAsync(int usuarioId)
    {
        // RN-03: se evalúa la membresía más reciente del deportista (mayor fecha de vencimiento).
        var estadoMasReciente = await _context.Membresias
            .AsNoTracking()
            .Where(m => m.UsuarioId == usuarioId)
            .OrderByDescending(m => m.FechaFin)
            .Select(m => (EstadoMembresia?)m.Estado)
            .FirstOrDefaultAsync();

        return estadoMasReciente == EstadoMembresia.ACTIVA;
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
