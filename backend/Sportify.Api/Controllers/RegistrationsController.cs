using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Sportify.Domain.Entities;
using Sportify.Infrastructure.Persistence;

namespace Sportify.Api.Controllers;

[ApiController]
[Route("api/registrations")]
[Authorize(Roles = "ADMIN,ENTRENADOR")]
public class RegistrationsController : ControllerBase
{
    private readonly SportifyDbContext _context;

    public RegistrationsController(SportifyDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var regs = await _context.InscripcionesCompetencia
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
            
        return Ok(regs);
    }

    [HttpGet("options")]
    public async Task<IActionResult> GetOptions()
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

        return Ok(new {
            Competitions = competitions,
            Members = members
        });
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] InscripcionCompetencia dto)
    {
        // Verificar si ya existe
        var exists = await _context.InscripcionesCompetencia
            .AnyAsync(i => i.UsuarioId == dto.UsuarioId && i.CompetenciaId == dto.CompetenciaId);
            
        if (exists) return BadRequest(new { message = "El usuario ya se encuentra inscrito en esta competencia." });

        dto.FechaInscripcion = DateTime.UtcNow;
        _context.InscripcionesCompetencia.Add(dto);
        await _context.SaveChangesAsync();
        return CreatedAtAction(nameof(GetAll), new { id = dto.Id }, dto);
    }

    [HttpPut("{id:int}")]
    public async Task<IActionResult> Update(int id, [FromBody] InscripcionCompetencia dto)
    {
        var existing = await _context.InscripcionesCompetencia.FindAsync(id);
        if (existing == null) return NotFound();

        existing.Estado = dto.Estado;
        await _context.SaveChangesAsync();
        return Ok(existing);
    }

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id)
    {
        var existing = await _context.InscripcionesCompetencia.FindAsync(id);
        if (existing == null) return NotFound();

        _context.InscripcionesCompetencia.Remove(existing);
        await _context.SaveChangesAsync();
        return NoContent();
    }
}
