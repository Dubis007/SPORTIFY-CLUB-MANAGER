using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Sportify.Application.Interfaces;
using Sportify.Domain.Entities;
using System.Security.Claims;

namespace Sportify.Api.Controllers;

[ApiController]
[Route("api/evaluations")]
[Authorize(Roles = "ADMIN,ENTRENADOR")]
public class EvaluationsController : ControllerBase
{
    private readonly IEvaluationService _evaluationService;

    public EvaluationsController(IEvaluationService evaluationService)
    {
        _evaluationService = evaluationService;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var evals = await _evaluationService.GetAllAsync();
        return Ok(evals);
    }

    [HttpGet("options")]
    public async Task<IActionResult> GetOptions()
    {
        var inscripciones = await _evaluationService.GetOptionsAsync();
        return Ok(inscripciones);
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] EvaluacionCompetencia dto)
    {
        var userIdString = User.FindFirstValue(ClaimTypes.NameIdentifier);
        int userId = int.TryParse(userIdString, out int parsedId) ? parsedId : 1;

        var result = await _evaluationService.CreateAsync(dto, userId);
        if (!result.IsSuccess) return BadRequest(new { message = result.ErrorMessage });

        return CreatedAtAction(nameof(GetAll), new { id = dto.Id }, dto);
    }

    [HttpPut("{id:int}")]
    public async Task<IActionResult> Update(int id, [FromBody] EvaluacionCompetencia dto)
    {
        var existing = await _evaluationService.UpdateAsync(id, dto);
        if (existing == null) return NotFound();

        return Ok(existing);
    }

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id)
    {
        var deleted = await _evaluationService.DeleteAsync(id);
        if (!deleted) return NotFound();

        return NoContent();
    }
}
