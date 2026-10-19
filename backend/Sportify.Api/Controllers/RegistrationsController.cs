using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Sportify.Application.Interfaces;
using Sportify.Domain.Entities;

namespace Sportify.Api.Controllers;

[ApiController]
[Route("api/registrations")]
[Authorize(Roles = "ADMIN,ENTRENADOR")]
public class RegistrationsController : ControllerBase
{
    private readonly IRegistrationService _registrationService;

    public RegistrationsController(IRegistrationService registrationService)
    {
        _registrationService = registrationService;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var regs = await _registrationService.GetAllAsync();
        return Ok(regs);
    }

    [HttpGet("options")]
    public async Task<IActionResult> GetOptions()
    {
        var options = await _registrationService.GetOptionsAsync();
        return Ok(options);
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] InscripcionCompetencia dto)
    {
        var created = await _registrationService.CreateAsync(dto);
        if (created == null) return BadRequest(new { message = "El usuario ya se encuentra inscrito en esta competencia." });

        return CreatedAtAction(nameof(GetAll), new { id = created.Id }, created);
    }

    [HttpPut("{id:int}")]
    public async Task<IActionResult> Update(int id, [FromBody] InscripcionCompetencia dto)
    {
        var updated = await _registrationService.UpdateAsync(id, dto);
        if (updated == null) return NotFound();

        return Ok(updated);
    }

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id)
    {
        var result = await _registrationService.DeleteAsync(id);
        if (!result) return NotFound();

        return NoContent();
    }
}
