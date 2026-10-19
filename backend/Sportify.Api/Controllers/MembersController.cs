using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using System.Threading.Tasks;
using Sportify.Application.Interfaces;

namespace Sportify.Api.Controllers;

[ApiController]
[Route("api/members")]
[Authorize(Roles = "MIEMBRO")]
public class MembersController : ControllerBase
{
    private readonly IMemberProfileService _memberProfileService;

    public MembersController(IMemberProfileService memberProfileService)
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

    [HttpPost("me/change-password")]
    public async Task<IActionResult> ChangePassword([FromBody] ChangePasswordRequest req)
    {
        var userId = GetUserId();
        var success = await _memberProfileService.ChangePasswordAsync(userId, req.CurrentPassword, req.NewPassword);

        if (!success)
            return BadRequest(new { message = "La contrasea actual es incorrecta o el usuario no existe." });

        return Ok(new { message = "Contrasea actualizada exitosamente." });
    }

    [HttpGet("me/payments")]
    public async Task<IActionResult> GetMyPayments()
    {
        var userId = GetUserId();
        var paymentsDto = await _memberProfileService.GetPaymentsAsync(userId);
        return Ok(paymentsDto);
    }

    [HttpGet("me/activities")]
    public async Task<IActionResult> GetMyActivities()
    {
        var userId = GetUserId();
        var activitiesDto = await _memberProfileService.GetActivitiesAsync(userId);
        return Ok(activitiesDto);
    }
}

public class ChangePasswordRequest 
{
    public string CurrentPassword { get; set; } = string.Empty;
    public string NewPassword { get; set; } = string.Empty;
}
