using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Sportify.Application.DTOs.MembershipPlans;
using Sportify.Application.Interfaces;

namespace Sportify.Api.Controllers;

[ApiController]
[Route("api/plans")]
[Authorize(Roles = "ADMIN")]
public class MembershipPlansController : ControllerBase
{
    private readonly IMembershipPlanService _planService;

    public MembershipPlansController(IMembershipPlanService planService)
    {
        _planService = planService;
    }

    [HttpGet]
    [AllowAnonymous]
    public async Task<IActionResult> GetAll()
    {
        var planes = await _planService.GetAllAsync();
        return Ok(planes);
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] SaveMembershipPlanDto dto)
    {
        var result = await _planService.CreateAsync(dto);
        return Ok(result);
    }

    [HttpPut("{id:int}")]
    public async Task<IActionResult> Update(int id, [FromBody] SaveMembershipPlanDto dto)
    {
        var result = await _planService.UpdateAsync(id, dto);
        if (result == null) return NotFound();
        return Ok(result);
    }

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id)
    {
        var success = await _planService.DeleteAsync(id);
        if (!success) return NotFound();

        return Ok(new { message = "Plan desactivado correctamente." });
    }
}
