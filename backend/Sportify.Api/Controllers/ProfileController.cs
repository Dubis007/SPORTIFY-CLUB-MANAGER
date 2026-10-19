using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using System.Threading.Tasks;
using Sportify.Application.Interfaces;

namespace Sportify.Api.Controllers;

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

    [HttpPost("change-password")]
    public async Task<IActionResult> ChangePassword([FromBody] ChangePasswordRequest req)
    {
        var userId = GetUserId();
        var success = await _memberProfileService.ChangePasswordAsync(userId, req.CurrentPassword, req.NewPassword);

        if (!success)
            return BadRequest(new { message = "La contrasea actual es incorrecta o el usuario no existe." });

        return Ok(new { message = "Contrasea actualizada exitosamente." });
    }
}
// Note: ChangePasswordRequest is already defined in MembersController.cs in the same namespace (or we can just reuse it). Wait, it was in MembersController.cs, so it's in Sportify.Api.Controllers namespace. It should be fine.
