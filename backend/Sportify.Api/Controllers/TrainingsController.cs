using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Sportify.Domain.Entities;
using Sportify.Infrastructure.Persistence;

namespace Sportify.Api.Controllers;

public class MarkAttendanceDto 
{
    public int UsuarioId { get; set; }
    public string? Observaciones { get; set; }
}

[ApiController]
[Route("api/trainings")]
[Authorize(Roles = "ADMIN,ENTRENADOR")]
public class TrainingsController : ControllerBase
{
    private readonly SportifyDbContext _context;

    public TrainingsController(SportifyDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var trainings = await _context.Entrenamientos
            .Include(e => e.Asistencias)
            .Where(e => e.EliminadoEn == null)
            .OrderByDescending(e => e.FechaHora)
            .ToListAsync();
        return Ok(trainings);
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] Entrenamiento dto)
    {
        dto.CreadoEn = DateTime.UtcNow;
        dto.Estado = "PENDIENTE";
        if (dto.CapacidadMaxima <= 0) dto.CapacidadMaxima = 20; // Default

        _context.Entrenamientos.Add(dto);
        await _context.SaveChangesAsync();
        return CreatedAtAction(nameof(GetAll), new { id = dto.Id }, dto);
    }

    [HttpPut("{id:int}")]
    public async Task<IActionResult> Update(int id, [FromBody] Entrenamiento dto)
    {
        var existing = await _context.Entrenamientos.FindAsync(id);
        if (existing == null || existing.EliminadoEn != null) return NotFound();

        existing.Titulo = dto.Titulo;
        existing.Descripcion = dto.Descripcion;
        existing.FechaHora = dto.FechaHora;
        existing.FechaFin = dto.FechaFin;
        existing.SedeId = dto.SedeId;
        existing.CapacidadMaxima = dto.CapacidadMaxima;

        await _context.SaveChangesAsync();
        return Ok(existing);
    }

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id)
    {
        var existing = await _context.Entrenamientos.FindAsync(id);
        if (existing == null || existing.EliminadoEn != null) return NotFound();

        existing.EliminadoEn = DateTime.UtcNow;
        await _context.SaveChangesAsync();
        return NoContent();
    }

    [HttpPatch("{id:int}/close")]
    public async Task<IActionResult> CloseTraining(int id)
    {
        var existing = await _context.Entrenamientos.FindAsync(id);
        if (existing == null || existing.EliminadoEn != null) return NotFound();

        existing.Estado = "CERRADO";
        await _context.SaveChangesAsync();
        return Ok(existing);
    }

    [HttpGet("{id:int}/attendance")]
    public async Task<IActionResult> GetAttendance(int id)
    {
        var asistencia = await _context.Asistencias
            .Where(a => a.EntrenamientoId == id)
            .Select(a => new { a.UsuarioId, a.Presente, a.Observaciones })
            .ToListAsync();
        
        var miembrosDb = await _context.Usuarios
            .Include(u => u.UsuarioRoles)
            .ThenInclude(ur => ur.Rol)
            .Where(u => u.Activo && u.UsuarioRoles.Any(ur => ur.Rol.Nombre == "MIEMBRO"))
            .ToListAsync();
            
        var miembros = miembrosDb.Select(u => new {
            u.Id,
            u.Nombre,
            u.Apellido,
            Asistio = asistencia.Any(a => a.UsuarioId == u.Id && a.Presente),
            Observaciones = asistencia.FirstOrDefault(a => a.UsuarioId == u.Id)?.Observaciones
        }).ToList();
            
        return Ok(miembros);
    }

    [HttpPost("{id:int}/attendance")]
    public async Task<IActionResult> MarkAttendance(int id, [FromBody] MarkAttendanceDto dto)
    {
        var training = await _context.Entrenamientos.FindAsync(id);
        if (training == null) return NotFound("Entrenamiento no encontrado.");

        var existingAttendance = await _context.Asistencias
            .FirstOrDefaultAsync(a => a.EntrenamientoId == id && a.UsuarioId == dto.UsuarioId);

        if (existingAttendance != null)
        {
            if (existingAttendance.Presente) 
                return BadRequest(new { message = "El usuario ya tiene asistencia marcada para este entrenamiento." });
            
            existingAttendance.Presente = true;
            existingAttendance.Observaciones = dto.Observaciones;
        }
        else
        {
            var asistencia = new Asistencia
            {
                EntrenamientoId = id,
                UsuarioId = dto.UsuarioId,
                Presente = true,
                Observaciones = dto.Observaciones,
                FechaRegistro = DateTime.UtcNow
            };
            _context.Asistencias.Add(asistencia);
        }

        await _context.SaveChangesAsync();
        return Ok(new { message = "Asistencia registrada correctamente." });
    }
}
