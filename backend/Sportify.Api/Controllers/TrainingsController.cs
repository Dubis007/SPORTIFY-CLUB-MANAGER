using System.Security.Claims;
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

    /// <summary>
    /// Id del entrenador que hace la petición, o null si la hace un administrador.
    /// El responsable de la sesión se toma de la sesión iniciada y no del cuerpo de la petición.
    /// </summary>
    private int? GetActingCoachId()
    {
        if (User.IsInRole("ADMIN")) return null;

        var claim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? User.FindFirst("sub")?.Value;
        if (!int.TryParse(claim, out var userId))
            throw new UnauthorizedAccessException("No fue posible identificar al usuario de la sesión.");

        return userId;
    }

    [HttpGet]
    [Authorize(Roles = "ADMIN,ENTRENADOR,MIEMBRO")]
    public async Task<IActionResult> GetAll()
    {
        var trainings = await _trainingService.GetAllAsync();
        return Ok(trainings);
    }

    /// <summary>
    /// Sedes activas y entrenadores que se pueden elegir en el formulario de sesiones.
    /// Solo entrega identificador y nombre: la dirección y el teléfono de las sedes siguen siendo del administrador.
    /// </summary>
    [HttpGet("form-options")]
    [Authorize(Roles = "ADMIN,ENTRENADOR")]
    public async Task<IActionResult> GetFormOptions()
    {
        var options = await _trainingService.GetFormOptionsAsync(GetActingCoachId());
        return Ok(options);
    }

    [HttpPost]
    [Authorize(Roles = "ADMIN,ENTRENADOR")]
    public async Task<IActionResult> Create([FromBody] SaveTrainingDto dto)
    {
        var created = await _trainingService.CreateAsync(dto, GetActingCoachId());
        return CreatedAtAction(nameof(GetAll), new { id = created.Id }, created);
    }

    [HttpPut("{id:int}")]
    [Authorize(Roles = "ADMIN,ENTRENADOR")]
    public async Task<IActionResult> Update(int id, [FromBody] SaveTrainingDto dto)
    {
        var existing = await _trainingService.UpdateAsync(id, dto, GetActingCoachId());
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
        var result = await _trainingService.MarkAttendanceAsync(id, dto.UsuarioId, dto.Estado, dto.Observaciones);
        if (!result.IsSuccess) return BadRequest(new { message = result.ErrorMessage });

        return Ok(new { message = "Asistencia registrada correctamente." });
    }
}
