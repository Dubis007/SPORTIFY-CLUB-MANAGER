using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Sportify.Application.Interfaces;
using Sportify.Application.DTOs.Memberships;

namespace Sportify.Api.Controllers;

[ApiController]
[Route("api/memberships")]
[Authorize]
public class MembershipsController : ControllerBase
{
    private readonly IMembershipService _membershipService;

    public MembershipsController(IMembershipService membershipService)
    {
        _membershipService = membershipService;
    }

    [HttpGet("plans")]
    [AllowAnonymous]
    public async Task<IActionResult> GetPlans()
    {
        var plans = await _membershipService.GetPlansAsync();
        return Ok(plans);
    }
    
    [HttpGet]
    [Authorize(Roles = "ADMIN,CONTADOR")]
    public async Task<IActionResult> GetAll()
    {
        var memberships = await _membershipService.GetAllMembershipsAsync();
        return Ok(memberships);
    }

    [HttpGet("user/{userId:int}")]
    [Authorize(Roles = "ADMIN,MIEMBRO")]
    public async Task<IActionResult> GetByUser(int userId)
    {
        var memberships = await _membershipService.GetMembershipsByUserAsync(userId);
        return Ok(memberships);
    }

    [HttpPost]
    [Authorize(Roles = "ADMIN,CONTADOR")]
    public async Task<IActionResult> Create([FromBody] CreateMembershipDto dto)
    {
        try
        {
            var membership = await _membershipService.CreateMembershipAsync(dto);
            return Ok(membership);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { message = ex.Message });
        }
    }

    [HttpPatch("{id:int}/status")]
    [Authorize(Roles = "ADMIN,CONTADOR")]
    public async Task<IActionResult> UpdateStatus(int id, [FromBody] UpdateMembershipStatusDto dto)
    {
        var membership = await _membershipService.UpdateMembershipStatusAsync(id, dto);
        return Ok(membership);
    }
}
