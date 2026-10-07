using Sportify.Domain.Entities;

namespace Sportify.Application.Interfaces;

public interface ITrainingService
{
    Task<IEnumerable<Entrenamiento>> GetAllAsync();
    Task<Entrenamiento> CreateAsync(Entrenamiento dto);
    Task<Entrenamiento?> UpdateAsync(int id, Entrenamiento dto);
    Task<bool> DeleteAsync(int id);
    Task<Entrenamiento?> CloseTrainingAsync(int id);
    Task<IEnumerable<object>> GetAttendanceAsync(int id);
    Task<(bool IsSuccess, string ErrorMessage)> MarkAttendanceAsync(int id, int usuarioId, string? observaciones);
}
