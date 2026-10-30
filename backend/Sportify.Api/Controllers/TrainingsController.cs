using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Sportify.Application.DTOs.Trainings;
using Sportify.Application.Interfaces;

namespace Sportify.Api.Controllers;

[ApiController]
[Route("api/trainings")]
[Authorize]
public class TrainingsController : ControllerBase
{
    private readonly ITrainingService _trainingService;

    public TrainingsController(ITrainingService trainingService)
    {
        _trainingService = trainingService;
    }

    [HttpGet]
    [Authorize(Roles = "ADMIN,ENTRENADOR,MIEMBRO")]
    public async Task<IActionResult> GetAll()
    {
        var trainings = await _trainingService.GetAllAsync();
        return Ok(trainings);
    }

    [HttpPost]
    [Authorize(Roles = "ADMIN,ENTRENADOR")]
    public async Task<IActionResult> Create([FromBody] SaveTrainingDto dto)
    {
        var created = await _trainingService.CreateAsync(dto);
        return CreatedAtAction(nameof(GetAll), new { id = created.Id }, created);
    }

    [HttpPut("{id:int}")]
    [Authorize(Roles = "ADMIN,ENTRENADOR")]
    public async Task<IActionResult> Update(int id, [FromBody] SaveTrainingDto dto)
    {
        var existing = await _trainingService.UpdateAsync(id, dto);
        if (existing == null) return NotFound();

        return Ok(existing);
    }

    [HttpDelete("{id:int}")]
    [Authorize(Roles = "ADMIN,ENTRENADOR")]
    public async Task<IActionResult> Delete(int id)
    {
        var deleted = await _trainingService.DeleteAsync(id);
        if (!deleted) return NotFound();

        return NoContent();
    }

    [HttpPatch("{id:int}/close")]
    [Authorize(Roles = "ADMIN,ENTRENADOR")]
    public async Task<IActionResult> CloseTraining(int id)
    {
        var existing = await _trainingService.CloseTrainingAsync(id);
        if (existing == null) return NotFound();

        return Ok(existing);
    }

    [HttpGet("{id:int}/attendance")]
    [Authorize(Roles = "ADMIN,ENTRENADOR")]
    public async Task<IActionResult> GetAttendance(int id)
    {
        var miembros = await _trainingService.GetAttendanceAsync(id);
        return Ok(miembros);
    }

    [HttpPost("{id:int}/attendance")]
    [Authorize(Roles = "ADMIN,ENTRENADOR")]
    public async Task<IActionResult> MarkAttendance(int id, [FromBody] MarkAttendanceDto dto)
    {
        var result = await _trainingService.MarkAttendanceAsync(id, dto.UsuarioId, dto.Observaciones);
        if (!result.IsSuccess) return BadRequest(new { message = result.ErrorMessage });

        return Ok(new { message = "Asistencia registrada correctamente." });
    }
}
