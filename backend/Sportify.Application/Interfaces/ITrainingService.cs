using Sportify.Application.DTOs.Trainings;
using Sportify.Domain.Enums;

namespace Sportify.Application.Interfaces;

public interface ITrainingService
{
    Task<IEnumerable<TrainingDto>> GetAllAsync();
    Task<TrainingDto> CreateAsync(SaveTrainingDto dto);
    Task<TrainingDto?> UpdateAsync(int id, SaveTrainingDto dto);
    Task<bool> DeleteAsync(int id);
    Task<TrainingDto?> CloseTrainingAsync(int id);
    Task<IEnumerable<TrainingAttendanceMemberDto>> GetAttendanceAsync(int id);
    Task<(bool IsSuccess, string ErrorMessage)> MarkAttendanceAsync(int id, int usuarioId, EstadoAsistencia estado, string? observaciones);
}
