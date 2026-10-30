using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Sportify.Application.DTOs.Common;
using Sportify.Application.DTOs.Evaluations;
using Sportify.Application.Interfaces;
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
    public async Task<IActionResult> GetAll([FromQuery] PaginationParams pagination, [FromQuery] int? evaluadoPorId)
    {
        var evals = await _evaluationService.GetPagedAsync(pagination, evaluadoPorId);
        return Ok(evals);
    }

    [HttpGet("options")]
    public async Task<IActionResult> GetOptions()
    {
        var inscripciones = await _evaluationService.GetOptionsAsync();
        return Ok(inscripciones);
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] SaveEvaluationDto dto)
    {
        var userIdString = User.FindFirstValue(ClaimTypes.NameIdentifier);
        var userId = int.TryParse(userIdString, out var parsedId) ? parsedId : 1;

        var result = await _evaluationService.CreateAsync(dto, userId);
        if (!result.IsSuccess || result.Evaluation == null)
            return BadRequest(new { message = result.ErrorMessage });

        return CreatedAtAction(nameof(GetAll), new { id = result.Evaluation.Id }, result.Evaluation);
    }

    [HttpPut("{id:int}")]
    public async Task<IActionResult> Update(int id, [FromBody] SaveEvaluationDto dto)
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
