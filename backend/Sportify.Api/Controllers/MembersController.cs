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
    private readonly IMembershipService _membershipService;
    private readonly IRegistrationService _registrationService;

    public MembersController(
        IMemberProfileService memberProfileService,
        IMembershipService membershipService,
        IRegistrationService registrationService)
    {
        _memberProfileService = memberProfileService;
        _membershipService = membershipService;
        _registrationService = registrationService;
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
            return BadRequest(new { message = "La contraseña actual es incorrecta o el usuario no existe." });

        return Ok(new { message = "Contraseña actualizada exitosamente." });
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

    /// <summary>Cancela una membresía propia activa o pendiente. El titular se toma siempre del JWT.</summary>
    [HttpPost("me/memberships/{id:int}/cancel")]
    public async Task<IActionResult> CancelMyMembership(int id)
    {
        var userId = GetUserId();
        var membership = await _membershipService.CancelOwnMembershipAsync(id, userId);
        return Ok(membership);
    }

    /// <summary>Acepta una convocatoria propia a un torneo: la inscripción queda CONFIRMADA (exige membresía activa, RN-03).</summary>
    [HttpPost("me/registrations/{id:int}/accept")]
    public async Task<IActionResult> AcceptInvitation(int id)
    {
        var registration = await _registrationService.RespondToInvitationAsync(id, GetUserId(), accept: true);
        return Ok(registration);
    }

    /// <summary>Rechaza una convocatoria propia a un torneo: la inscripción queda CANCELADA.</summary>
    [HttpPost("me/registrations/{id:int}/decline")]
    public async Task<IActionResult> DeclineInvitation(int id)
    {
        var registration = await _registrationService.RespondToInvitationAsync(id, GetUserId(), accept: false);
        return Ok(registration);
    }
}

public class ChangePasswordRequest 
{
    public string CurrentPassword { get; set; } = string.Empty;
    public string NewPassword { get; set; } = string.Empty;
}
