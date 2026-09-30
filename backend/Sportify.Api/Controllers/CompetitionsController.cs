using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Sportify.Domain.Entities;
using Sportify.Infrastructure.Persistence;

namespace Sportify.Api.Controllers;

[ApiController]
[Route("api/competitions")]
[Authorize(Roles = "ADMIN,ENTRENADOR")]
public class CompetitionsController : ControllerBase
{
    private readonly SportifyDbContext _context;

    public CompetitionsController(SportifyDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var competitions = await _context.Competencias
            .Where(c => c.EliminadoEn == null)
            .ToListAsync();
        return Ok(competitions);
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] Competencia dto)
    {
        dto.CreadoEn = DateTime.UtcNow;
        _context.Competencias.Add(dto);
        await _context.SaveChangesAsync();
        return CreatedAtAction(nameof(GetAll), new { id = dto.Id }, dto);
    }

    [HttpPut("{id:int}")]
    public async Task<IActionResult> Update(int id, [FromBody] Competencia dto)
    {
        var existing = await _context.Competencias.FindAsync(id);
        if (existing == null || existing.EliminadoEn != null) return NotFound();

        existing.Nombre = dto.Nombre;
        existing.Descripcion = dto.Descripcion;
        existing.FechaInicio = dto.FechaInicio;
        existing.FechaFin = dto.FechaFin;
        existing.Ubicacion = dto.Ubicacion;

        await _context.SaveChangesAsync();
        return Ok(existing);
    }

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id)
    {
        var existing = await _context.Competencias.FindAsync(id);
        if (existing == null || existing.EliminadoEn != null) return NotFound();

        existing.EliminadoEn = DateTime.UtcNow; // Soft delete
        await _context.SaveChangesAsync();
        return NoContent();
    }
}
