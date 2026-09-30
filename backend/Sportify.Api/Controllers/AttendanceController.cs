using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace Sportify.Api.Controllers;

/// <summary>Controlador para gestion de asistencia a entrenamientos.</summary>
[ApiController]
[Route("api/attendance")]
[Authorize]
public class AttendanceController : ControllerBase
{
    // TODO: Inyectar IAttendanceService cuando se implemente

    /// <summary>Lista entrenamientos disponibles. [ENTRENADOR, ADMIN]</summary>
    [HttpGet("trainings")]
    [Authorize(Roles = "ENTRENADOR,ADMIN")]
    public IActionResult GetTrainings()
    {
        return Ok(new { message = "Lista de entrenamientos", data = Array.Empty<object>() });
    }

    /// <summary>Registra asistencia a un entrenamiento. [ENTRENADOR]</summary>
    [HttpPost("trainings/{trainingId:int}/register")]
    [Authorize(Roles = "ENTRENADOR")]
    public IActionResult RegisterAttendance(int trainingId, [FromBody] RegisterAttendanceRequest request)
    {
        var entrenadorId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        return Ok(new { message = $"Asistencia registrada para entrenamiento {trainingId}", entrenadorId });
    }

    /// <summary>Lista asistencias de un entrenamiento. [ENTRENADOR, ADMIN]</summary>
    [HttpGet("trainings/{trainingId:int}")]
    [Authorize(Roles = "ENTRENADOR,ADMIN")]
    public IActionResult GetAttendance(int trainingId)
    {
        return Ok(new { message = $"Asistencias del entrenamiento {trainingId}", data = Array.Empty<object>() });
    }

    /// <summary>Obtiene el historial de asistencia de un miembro. [ADMIN, ENTRENADOR]</summary>
    [HttpGet("members/{memberId:int}")]
    [Authorize(Roles = "ADMIN,ENTRENADOR")]
    public IActionResult GetMemberAttendance(int memberId)
    {
        return Ok(new { message = $"Historial de asistencia del miembro {memberId}", data = Array.Empty<object>() });
    }
}

/// <summary>Request para registro de asistencia.</summary>
public record RegisterAttendanceRequest(int UsuarioId, bool Presente, string? Observaciones);
