using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Sportify.Domain.Entities;
using Sportify.Infrastructure.Persistence;
using System.Security.Claims;
using BCrypt.Net;

namespace Sportify.Api.Controllers;

[ApiController]
[Route("api/members")]
[Authorize(Roles = "MIEMBRO")]
public class MembersController : ControllerBase
{
    private readonly SportifyDbContext _context;

    public MembersController(SportifyDbContext context)
    {
        _context = context;
    }

    private int GetUserId()
    {
        return int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
    }

    [HttpGet("me")]
    public async Task<IActionResult> GetMyProfile()
    {
        var userId = GetUserId();
        var user = await _context.Usuarios
            .Where(u => u.Id == userId)
            .Select(u => new { u.Id, u.Nombre, u.Apellido, u.Correo, u.Activo })
            .FirstOrDefaultAsync();
            
        if (user == null) return NotFound();
        return Ok(user);
    }

    [HttpPost("me/change-password")]
    public async Task<IActionResult> ChangePassword([FromBody] ChangePasswordRequest req)
    {
        var userId = GetUserId();
        var user = await _context.Usuarios.FindAsync(userId);
        if (user == null) return NotFound();

        if (!BCrypt.Net.BCrypt.Verify(req.CurrentPassword, user.ContrasenaHash))
            return BadRequest(new { message = "La contraseña actual es incorrecta." });

        user.ContrasenaHash = BCrypt.Net.BCrypt.HashPassword(req.NewPassword);
        await _context.SaveChangesAsync();
        return Ok(new { message = "Contraseña actualizada exitosamente." });
    }

    [HttpGet("me/payments")]
    public async Task<IActionResult> GetMyPayments()
    {
        var userId = GetUserId();
        
        var memberships = await _context.Membresias
            .Include(m => m.PlanMembresia)
            .Where(m => m.UsuarioId == userId)
            .OrderByDescending(m => m.FechaInicio)
            .Select(m => new {
                m.Id,
                Plan = m.PlanMembresia.Nombre,
                m.Estado,
                m.FechaInicio,
                m.FechaFin
            })
            .ToListAsync();

        var payments = await _context.Pagos
            .Include(p => p.Membresia)
                .ThenInclude(m => m.PlanMembresia)
            .Where(p => p.UsuarioId == userId)
            .OrderByDescending(p => p.FechaPago)
            .Select(p => new {
                p.Id,
                p.MontoCOP,
                p.Estado,
                p.FechaPago,
                Plan = p.Membresia.PlanMembresia.Nombre
            })
            .ToListAsync();

        return Ok(new { Memberships = memberships, Payments = payments });
    }

    [HttpGet("me/activities")]
    public async Task<IActionResult> GetMyActivities()
    {
        var userId = GetUserId();
        var now = DateTime.UtcNow;

        // Entrenamientos asistidos o programados.
        // Wait, members don't explicitly register for trainings, they just attend?
        // Actually, if a member is active, they can attend any training. 
        // We will just show trainings they HAVE attended (Asistencias), 
        // and MAYBE upcoming trainings for the club?
        var upcomingTrainings = await _context.Entrenamientos
            .Where(e => e.FechaHora >= now && e.EliminadoEn == null)
            .OrderBy(e => e.FechaHora)
            .Select(e => new { e.Id, e.Titulo, e.FechaHora, e.FechaFin, Tipo = "ENTRENAMIENTO" })
            .ToListAsync();

        var attendances = await _context.Asistencias
            .Include(a => a.Entrenamiento)
            .Where(a => a.UsuarioId == userId && a.Presente)
            .OrderByDescending(a => a.FechaRegistro)
            .Select(a => new { 
                a.Entrenamiento.Titulo, 
                a.Entrenamiento.FechaHora, 
                a.Observaciones,
                Tipo = "ASISTENCIA_ENTRENAMIENTO"
            })
            .ToListAsync();

        // Competencias inscritas
        var competitions = await _context.InscripcionesCompetencia
            .Include(i => i.Competencia)
            .Where(i => i.UsuarioId == userId)
            .OrderByDescending(i => i.Competencia.FechaInicio)
            .Select(i => new {
                i.CompetenciaId,
                i.Competencia.Nombre,
                i.Competencia.FechaInicio,
                i.Competencia.Ubicacion,
                EstadoInscripcion = i.Estado.ToString(),
                Tipo = "COMPETENCIA"
            })
            .ToListAsync();

        return Ok(new { 
            UpcomingTrainings = upcomingTrainings, 
            Attendances = attendances,
            Competitions = competitions
        });
    }
}

public class ChangePasswordRequest 
{
    public string CurrentPassword { get; set; } = string.Empty;
    public string NewPassword { get; set; } = string.Empty;
}
