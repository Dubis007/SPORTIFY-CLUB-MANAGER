using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Sportify.Application.DTOs.Common;
using Sportify.Domain.Entities;
using Sportify.Infrastructure.Persistence;
using System.Security.Claims;

namespace Sportify.Api.Controllers;

[ApiController]
[Route("api/evaluations")]
[Authorize(Roles = "ADMIN,ENTRENADOR")]
public class EvaluationsController : ControllerBase
{
    private readonly SportifyDbContext _context;

    public EvaluationsController(SportifyDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll([FromQuery] PaginationParams pagination, [FromQuery] int? evaluadoPorId)
    {
        var query = _context.EvaluacionesCompetencia.AsNoTracking();
        if (evaluadoPorId.HasValue)
            query = query.Where(e => e.EvaluadoPorId == evaluadoPorId.Value);

        var total = await query.CountAsync();

        // Orden estable (fecha + Id) antes de Skip/Take; la proyección hace los joins necesarios
        var evals = await query
            .OrderByDescending(e => e.EvaluadoEn)
            .ThenByDescending(e => e.Id)
            .Skip(pagination.Skip)
            .Take(pagination.PageSize)
            .Select(e => new {
                e.Id,
                e.InscripcionId,
                e.Puntaje,
                e.Desempeno,
                e.Comentarios,
                e.EvaluadoEn,
                e.EvaluadoPorId,
                UsuarioNombre = e.Inscripcion.Usuario.Nombre + " " + e.Inscripcion.Usuario.Apellido,
                CompetenciaNombre = e.Inscripcion.Competencia.Nombre
            })
            .ToListAsync();

        return Ok(new PagedResult<object>
        {
            Items = evals,
            Page = pagination.Page,
            PageSize = pagination.PageSize,
            TotalCount = total
        });
    }

    [HttpGet("options")]
    public async Task<IActionResult> GetOptions()
    {
        // Traer inscripciones que tengan estado CONFIRMADA o PAGO, 
        // y que Opcionalmente no tengan evaluación. (Dejaremos todas por ahora, 
        // pero incluimos nombre usuario y competencia).
        var inscripciones = await _context.InscripcionesCompetencia
            .Include(i => i.Usuario)
            .Include(i => i.Competencia)
            .Where(i => i.Estado == Sportify.Domain.Enums.EstadoInscripcion.CONFIRMADA || i.Estado == Sportify.Domain.Enums.EstadoInscripcion.PAGO)
            .Select(i => new {
                i.Id,
                UsuarioNombre = i.Usuario.Nombre + " " + i.Usuario.Apellido,
                CompetenciaNombre = i.Competencia.Nombre,
                i.Competencia.FechaInicio
            })
            .OrderByDescending(i => i.FechaInicio)
            .ToListAsync();

        return Ok(inscripciones);
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] EvaluacionCompetencia dto)
    {
        var userIdString = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (int.TryParse(userIdString, out int userId))
        {
            dto.EvaluadoPorId = userId;
        }
        else
        {
            dto.EvaluadoPorId = 1; // Fallback
        }

        var exists = await _context.EvaluacionesCompetencia.AnyAsync(e => e.InscripcionId == dto.InscripcionId);
        if (exists) return BadRequest(new { message = "Esta inscripción ya tiene una evaluación." });

        dto.EvaluadoEn = DateTime.UtcNow;
        _context.EvaluacionesCompetencia.Add(dto);
        await _context.SaveChangesAsync();
        return CreatedAtAction(nameof(GetAll), new { id = dto.Id }, dto);
    }

    [HttpPut("{id:int}")]
    public async Task<IActionResult> Update(int id, [FromBody] EvaluacionCompetencia dto)
    {
        var existing = await _context.EvaluacionesCompetencia.FindAsync(id);
        if (existing == null) return NotFound();

        existing.Puntaje = dto.Puntaje;
        existing.Desempeno = dto.Desempeno;
        existing.Comentarios = dto.Comentarios;
        
        await _context.SaveChangesAsync();
        return Ok(existing);
    }

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id)
    {
        var existing = await _context.EvaluacionesCompetencia.FindAsync(id);
        if (existing == null) return NotFound();

        _context.EvaluacionesCompetencia.Remove(existing);
        await _context.SaveChangesAsync();
        return NoContent();
    }
}
