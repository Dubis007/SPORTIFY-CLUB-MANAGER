using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Sportify.Infrastructure.Persistence;
using Sportify.Domain.Entities;

namespace Sportify.Api.Controllers;

[ApiController]
[Route("api/locations")]
[Authorize(Roles = "ADMIN")]
public class LocationsController : ControllerBase
{
    private readonly SportifyDbContext _context;

    public LocationsController(SportifyDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var locations = await _context.Sedes
            .Select(s => new {
                s.Id,
                s.Nombre,
                s.Direccion,
                s.Ciudad,
                s.Telefono,
                s.Activo,
                UsuariosActivos = _context.Usuarios.Count(u => u.SedeId == s.Id && u.Activo && u.UsuarioRoles.Any(ur => ur.Rol.Nombre == "MIEMBRO")),
                Empleados = _context.Usuarios.Count(u => u.SedeId == s.Id && u.Activo && u.UsuarioRoles.Any(ur => ur.Rol.Nombre != "MIEMBRO"))
            })
            .ToListAsync();

        return Ok(locations);
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] Sede dto)
    {
        dto.CreadoEn = DateTime.UtcNow;
        _context.Sedes.Add(dto);
        await _context.SaveChangesAsync();
        return Ok(dto);
    }

    [HttpPut("{id:int}")]
    public async Task<IActionResult> Update(int id, [FromBody] Sede dto)
    {
        var sede = await _context.Sedes.FindAsync(id);
        if (sede == null) return NotFound();

        sede.Nombre = dto.Nombre;
        sede.Direccion = dto.Direccion;
        sede.Ciudad = dto.Ciudad;
        sede.Telefono = dto.Telefono;
        sede.Activo = dto.Activo;

        await _context.SaveChangesAsync();
        return Ok(sede);
    }

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id)
    {
        var sede = await _context.Sedes.FindAsync(id);
        if (sede == null) return NotFound();

        // Soft delete (desactivar) en lugar de borrar para mantener historial
        sede.Activo = false;
        await _context.SaveChangesAsync();
        return Ok(new { message = "Sede desactivada correctamente." });
    }
}
