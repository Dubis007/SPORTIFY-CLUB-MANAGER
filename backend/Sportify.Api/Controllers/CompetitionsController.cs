using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Sportify.Application.DTOs.Competitions;
using Sportify.Application.Interfaces;

namespace Sportify.Api.Controllers;

[ApiController]
[Route("api/competitions")]
[Authorize]
public class CompetitionsController : ControllerBase
{
    private readonly ICompetitionService _competitionService;

    public CompetitionsController(ICompetitionService competitionService)
    {
        _competitionService = competitionService;
    }

    [HttpGet]
    [Authorize(Roles = "ADMIN,ENTRENADOR,MIEMBRO")]
    public async Task<IActionResult> GetAll()
    {
        var competitions = await _competitionService.GetAllAsync();
        return Ok(competitions);
    }

    [HttpPost]
    [Authorize(Roles = "ADMIN,ENTRENADOR")]
    public async Task<IActionResult> Create([FromBody] SaveCompetitionDto dto)
    {
        var created = await _competitionService.CreateAsync(dto);
        return CreatedAtAction(nameof(GetAll), new { id = created.Id }, created);
    }

    [HttpPut("{id:int}")]
    [Authorize(Roles = "ADMIN,ENTRENADOR")]
    public async Task<IActionResult> Update(int id, [FromBody] SaveCompetitionDto dto)
    {
        var updated = await _competitionService.UpdateAsync(id, dto);
        if (updated == null) return NotFound();

        return Ok(updated);
    }

    [HttpDelete("{id:int}")]
    [Authorize(Roles = "ADMIN,ENTRENADOR")]
    public async Task<IActionResult> Delete(int id)
    {
        var result = await _competitionService.DeleteAsync(id);
        if (!result) return NotFound();

        return NoContent();
    }
}
