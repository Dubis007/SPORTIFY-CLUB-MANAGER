using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Sportify.Application.Interfaces;
using Sportify.Domain.Entities;

namespace Sportify.Api.Controllers;

public class MarkAttendanceDto 
{
    public int UsuarioId { get; set; }
    public string? Observaciones { get; set; }
}

[ApiController]
[Route("api/trainings")]
[Authorize(Roles = "ADMIN,ENTRENADOR")]
public class TrainingsController : ControllerBase
{
    private readonly ITrainingService _trainingService;

    public TrainingsController(ITrainingService trainingService)
    {
        _trainingService = trainingService;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var trainings = await _trainingService.GetAllAsync();
        return Ok(trainings);
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] Entrenamiento dto)
    {
        var created = await _trainingService.CreateAsync(dto);
        return CreatedAtAction(nameof(GetAll), new { id = created.Id }, created);
    }

    [HttpPut("{id:int}")]
    public async Task<IActionResult> Update(int id, [FromBody] Entrenamiento dto)
    {
        var existing = await _trainingService.UpdateAsync(id, dto);
        if (existing == null) return NotFound();

        return Ok(existing);
    }

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id)
    {
        var deleted = await _trainingService.DeleteAsync(id);
        if (!deleted) return NotFound();

        return NoContent();
    }

    [HttpPatch("{id:int}/close")]
    public async Task<IActionResult> CloseTraining(int id)
    {
        var existing = await _trainingService.CloseTrainingAsync(id);
        if (existing == null) return NotFound();

        return Ok(existing);
    }

    [HttpGet("{id:int}/attendance")]
    public async Task<IActionResult> GetAttendance(int id)
    {
        var miembros = await _trainingService.GetAttendanceAsync(id);
        return Ok(miembros);
    }

    [HttpPost("{id:int}/attendance")]
    public async Task<IActionResult> MarkAttendance(int id, [FromBody] MarkAttendanceDto dto)
    {
        var result = await _trainingService.MarkAttendanceAsync(id, dto.UsuarioId, dto.Observaciones);
        if (!result.IsSuccess) return BadRequest(new { message = result.ErrorMessage });

        return Ok(new { message = "Asistencia registrada correctamente." });
    }
}
