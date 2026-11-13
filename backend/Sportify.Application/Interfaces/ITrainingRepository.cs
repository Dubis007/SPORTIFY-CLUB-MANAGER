using Sportify.Domain.Entities;

namespace Sportify.Application.Interfaces;

public interface ITrainingRepository
{
    Task<List<Entrenamiento>> GetAllActiveAsync();
    Task<Entrenamiento?> GetByIdActiveAsync(int id);
    Task<Entrenamiento?> GetByIdAsync(int id);
    Task AddAsync(Entrenamiento entrenamiento);
    Task UpdateAsync(Entrenamiento entrenamiento);

    // Datos para elegir y validar la sede y el entrenador de una sesión (lectura sin seguimiento)
    Task<List<Sede>> GetActiveSedesAsync();
    Task<Sede?> GetSedeByIdAsync(int sedeId);
    Task<List<Usuario>> GetActiveCoachesAsync();
    /// <summary>Devuelve el usuario solo si está activo y tiene el rol ENTRENADOR.</summary>
    Task<Usuario?> GetActiveCoachByIdAsync(int usuarioId);

    Task<List<Asistencia>> GetAsistenciasByEntrenamientoIdAsync(int entrenamientoId);
    Task<List<Usuario>> GetActiveMembersAsync();
    Task<Asistencia?> GetAsistenciaAsync(int entrenamientoId, int usuarioId);
    Task AddAsistenciaAsync(Asistencia asistencia);
    Task SaveChangesAsync();
}
