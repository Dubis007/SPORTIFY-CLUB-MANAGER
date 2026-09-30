using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Sportify.Infrastructure.Persistence;
using System.Security.Claims;

namespace Sportify.Api.Controllers;

[ApiController]
[Route("api/profile")]
[Authorize]
public class ProfileController : ControllerBase
{
    private readonly SportifyDbContext _context;

    public ProfileController(SportifyDbContext context)
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

    [HttpPost("change-password")]
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
}
