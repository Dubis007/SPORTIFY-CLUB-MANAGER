using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Sportify.Infrastructure.Persistence;
using Sportify.Domain.Entities;

namespace Sportify.Api.Controllers;

[ApiController]
[Route("api/plans")]
[Authorize(Roles = "ADMIN")]
public class MembershipPlansController : ControllerBase
{
    private readonly SportifyDbContext _context;

    public MembershipPlansController(SportifyDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    [AllowAnonymous] // Permitir ver los planes sin login
    public async Task<IActionResult> GetAll()
    {
        var planes = await _context.PlanesMembresia.ToListAsync();
        return Ok(planes);
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] PlanMembresia dto)
    {
        dto.CreadoEn = DateTime.UtcNow;
        _context.PlanesMembresia.Add(dto);
        await _context.SaveChangesAsync();
        return Ok(dto);
    }

    [HttpPut("{id:int}")]
    public async Task<IActionResult> Update(int id, [FromBody] PlanMembresia dto)
    {
        var plan = await _context.PlanesMembresia.FindAsync(id);
        if (plan == null) return NotFound();

        plan.Nombre = dto.Nombre;
        plan.Descripcion = dto.Descripcion;
        plan.PrecioCOP = dto.PrecioCOP;
        plan.DuracionDias = dto.DuracionDias;
        plan.Activo = dto.Activo;

        await _context.SaveChangesAsync();
        return Ok(plan);
    }

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id)
    {
        var plan = await _context.PlanesMembresia.FindAsync(id);
        if (plan == null) return NotFound();

        plan.Activo = false;
        await _context.SaveChangesAsync();
        return Ok(new { message = "Plan desactivado correctamente." });
    }
}
