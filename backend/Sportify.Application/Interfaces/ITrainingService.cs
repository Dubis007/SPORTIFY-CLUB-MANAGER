using Sportify.Application.DTOs.Trainings;
using Sportify.Domain.Enums;

namespace Sportify.Application.Interfaces;

public interface ITrainingService
{
    Task<IEnumerable<TrainingDto>> GetAllAsync();

    /// <summary>
    /// Sedes y entrenadores disponibles para el formulario. <paramref name="actingCoachId"/> es el id del
    /// entrenador que hace la petición, o null cuando la hace un administrador.
    /// </summary>
    Task<TrainingFormOptionsDto> GetFormOptionsAsync(int? actingCoachId = null);
    Task<TrainingDto> CreateAsync(SaveTrainingDto dto, int? actingCoachId = null);
    Task<TrainingDto?> UpdateAsync(int id, SaveTrainingDto dto, int? actingCoachId = null);
    Task<bool> DeleteAsync(int id);
    Task<TrainingDto?> CloseTrainingAsync(int id);
    Task<IEnumerable<TrainingAttendanceMemberDto>> GetAttendanceAsync(int id);
    Task<(bool IsSuccess, string ErrorMessage)> MarkAttendanceAsync(int id, int usuarioId, EstadoAsistencia estado, string? observaciones);
}
