using Sportify.Domain.Entities;

namespace Sportify.Application.Interfaces;

public interface ITrainingRepository
{
    Task<List<Entrenamiento>> GetAllActiveAsync();
    Task<Entrenamiento?> GetByIdActiveAsync(int id);
    Task<Entrenamiento?> GetByIdAsync(int id);
    Task AddAsync(Entrenamiento entrenamiento);
    Task UpdateAsync(Entrenamiento entrenamiento);
    
    Task<List<Asistencia>> GetAsistenciasByEntrenamientoIdAsync(int entrenamientoId);
    Task<List<Usuario>> GetActiveMembersAsync();
    Task<Asistencia?> GetAsistenciaAsync(int entrenamientoId, int usuarioId);
    Task AddAsistenciaAsync(Asistencia asistencia);
    Task SaveChangesAsync();
}
