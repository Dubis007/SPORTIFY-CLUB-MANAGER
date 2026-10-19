using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Sportify.Application.Interfaces;
using Sportify.Domain.Entities;

namespace Sportify.Api.Controllers;

[ApiController]
[Route("api/competitions")]
[Authorize(Roles = "ADMIN,ENTRENADOR")]
public class CompetitionsController : ControllerBase
{
    private readonly ICompetitionService _competitionService;

    public CompetitionsController(ICompetitionService competitionService)
    {
        _competitionService = competitionService;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var competitions = await _competitionService.GetAllAsync();
        return Ok(competitions);
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] Competencia dto)
    {
        var created = await _competitionService.CreateAsync(dto);
        return CreatedAtAction(nameof(GetAll), new { id = created.Id }, created);
    }

    [HttpPut("{id:int}")]
    public async Task<IActionResult> Update(int id, [FromBody] Competencia dto)
    {
        var updated = await _competitionService.UpdateAsync(id, dto);
        if (updated == null) return NotFound();

        return Ok(updated);
    }

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id)
    {
        var result = await _competitionService.DeleteAsync(id);
        if (!result) return NotFound();

        return NoContent();
    }
}
