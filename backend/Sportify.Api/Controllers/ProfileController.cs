using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using Sportify.Application.Interfaces;

namespace Sportify.Api.Controllers;

public record UpdateBirthDateRequest(DateTime? FechaNacimiento);

[ApiController]
[Route("api/profile")]
[Authorize]
public class ProfileController : ControllerBase
{
    private readonly IMemberProfileService _memberProfileService;

    public ProfileController(IMemberProfileService memberProfileService)
    {
        _memberProfileService = memberProfileService;
    }

    private int GetUserId()
    {
        return int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
    }

    [HttpGet("me")]
    public async Task<IActionResult> GetMyProfile()
    {
        var userId = GetUserId();
        var profile = await _memberProfileService.GetProfileAsync(userId);

        if (profile == null) return NotFound();
        return Ok(profile);
    }

    [HttpPatch("birth-date")]
    public async Task<IActionResult> UpdateBirthDate([FromBody] UpdateBirthDateRequest req)
    {
        var userId = GetUserId();
        var updated = await _memberProfileService.UpdateBirthDateAsync(userId, req.FechaNacimiento);
        if (!updated) return NotFound();
        return Ok(new { message = "Fecha de nacimiento actualizada." });
    }

    [HttpPost("change-password")]
    public async Task<IActionResult> ChangePassword([FromBody] ChangePasswordRequest req)
    {
        var userId = GetUserId();
        var success = await _memberProfileService.ChangePasswordAsync(userId, req.CurrentPassword, req.NewPassword);

        if (!success)
            return BadRequest(new { message = "La contraseña actual es incorrecta o el usuario no existe." });

        return Ok(new { message = "Contraseña actualizada exitosamente." });
    }
}
