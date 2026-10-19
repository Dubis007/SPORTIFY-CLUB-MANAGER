using Microsoft.EntityFrameworkCore;
using Sportify.Application.Interfaces;
using Sportify.Domain.Entities;
using Sportify.Infrastructure.Persistence;

namespace Sportify.Infrastructure.Repositories;

public class TrainingRepository : ITrainingRepository
{
    private readonly SportifyDbContext _context;

    public TrainingRepository(SportifyDbContext context)
    {
        _context = context;
    }

    public async Task<List<Entrenamiento>> GetAllActiveAsync()
    {
        return await _context.Entrenamientos
            .Include(e => e.Asistencias)
            .Where(e => e.EliminadoEn == null)
            .ToListAsync();
    }

    public async Task<Entrenamiento?> GetByIdActiveAsync(int id)
    {
        return await _context.Entrenamientos
            .FirstOrDefaultAsync(e => e.Id == id && e.EliminadoEn == null);
    }

    public async Task<Entrenamiento?> GetByIdAsync(int id)
    {
        return await _context.Entrenamientos.FindAsync(id);
    }

    public async Task AddAsync(Entrenamiento entrenamiento)
    {
        _context.Entrenamientos.Add(entrenamiento);
        await _context.SaveChangesAsync();
    }

    public async Task UpdateAsync(Entrenamiento entrenamiento)
    {
        _context.Entrenamientos.Update(entrenamiento);
        await _context.SaveChangesAsync();
    }

    public async Task<List<Asistencia>> GetAsistenciasByEntrenamientoIdAsync(int entrenamientoId)
    {
        return await _context.Asistencias
            .Where(a => a.EntrenamientoId == entrenamientoId)
            .ToListAsync();
    }

    public async Task<List<Usuario>> GetActiveMembersAsync()
    {
        return await _context.Usuarios
            .Include(u => u.UsuarioRoles)
            .ThenInclude(ur => ur.Rol)
            .Where(u => u.Activo && u.UsuarioRoles.Any(ur => ur.Rol.Nombre == "MIEMBRO"))
            .ToListAsync();
    }

    public async Task<Asistencia?> GetAsistenciaAsync(int entrenamientoId, int usuarioId)
    {
        return await _context.Asistencias
            .FirstOrDefaultAsync(a => a.EntrenamientoId == entrenamientoId && a.UsuarioId == usuarioId);
    }

    public async Task AddAsistenciaAsync(Asistencia asistencia)
    {
        _context.Asistencias.Add(asistencia);
        await _context.SaveChangesAsync();
    }

    public async Task SaveChangesAsync()
    {
        await _context.SaveChangesAsync();
    }
}
