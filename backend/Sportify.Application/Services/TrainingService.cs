using Sportify.Application.Interfaces;
using Sportify.Domain.Entities;

namespace Sportify.Application.Services;

public class TrainingService : ITrainingService
{
    private readonly ITrainingRepository _repository;

    public TrainingService(ITrainingRepository repository)
    {
        _repository = repository;
    }

    public async Task<IEnumerable<Entrenamiento>> GetAllAsync()
    {
        var trainings = await _repository.GetAllActiveAsync();
        return trainings.OrderByDescending(e => e.FechaHora).ToList();
    }

    public async Task<Entrenamiento> CreateAsync(Entrenamiento dto)
    {
        dto.CreadoEn = DateTime.UtcNow;
        dto.Estado = "PENDIENTE";
        if (dto.CapacidadMaxima <= 0) dto.CapacidadMaxima = 20;

        await _repository.AddAsync(dto);
        return dto;
    }

    public async Task<Entrenamiento?> UpdateAsync(int id, Entrenamiento dto)
    {
        var existing = await _repository.GetByIdActiveAsync(id);
        if (existing == null) return null;

        existing.Titulo = dto.Titulo;
        existing.Descripcion = dto.Descripcion;
        existing.FechaHora = dto.FechaHora;
        existing.FechaFin = dto.FechaFin;
        existing.SedeId = dto.SedeId;
        existing.CapacidadMaxima = dto.CapacidadMaxima;

        await _repository.UpdateAsync(existing);
        return existing;
    }

    public async Task<bool> DeleteAsync(int id)
    {
        var existing = await _repository.GetByIdActiveAsync(id);
        if (existing == null) return false;

        existing.EliminadoEn = DateTime.UtcNow;
        await _repository.UpdateAsync(existing);
        return true;
    }

    public async Task<Entrenamiento?> CloseTrainingAsync(int id)
    {
        var existing = await _repository.GetByIdActiveAsync(id);
        if (existing == null) return null;

        existing.Estado = "CERRADO";
        await _repository.UpdateAsync(existing);
        return existing;
    }

    public async Task<IEnumerable<object>> GetAttendanceAsync(int id)
    {
        var asistencia = await _repository.GetAsistenciasByEntrenamientoIdAsync(id);
        var miembrosDb = await _repository.GetActiveMembersAsync();
        
        var miembros = miembrosDb.Select(u => new {
            u.Id,
            u.Nombre,
            u.Apellido,
            Asistio = asistencia.Any(a => a.UsuarioId == u.Id && a.Presente),
            Observaciones = asistencia.FirstOrDefault(a => a.UsuarioId == u.Id)?.Observaciones
        }).ToList();
        
        return miembros;
    }

    public async Task<(bool IsSuccess, string ErrorMessage)> MarkAttendanceAsync(int id, int usuarioId, string? observaciones)
    {
        var training = await _repository.GetByIdAsync(id);
        if (training == null) return (false, "Entrenamiento no encontrado.");

        var existingAttendance = await _repository.GetAsistenciaAsync(id, usuarioId);

        if (existingAttendance != null)
        {
            if (existingAttendance.Presente) 
                return (false, "El usuario ya tiene asistencia marcada para este entrenamiento.");
            
            existingAttendance.Presente = true;
            existingAttendance.Observaciones = observaciones;
            await _repository.SaveChangesAsync();
        }
        else
        {
            var asistencia = new Asistencia
            {
                EntrenamientoId = id,
                UsuarioId = usuarioId,
                Presente = true,
                Observaciones = observaciones,
                FechaRegistro = DateTime.UtcNow
            };
            await _repository.AddAsistenciaAsync(asistencia);
        }

        return (true, string.Empty);
    }
}
