using Sportify.Application.DTOs.Trainings;
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

    public async Task<IEnumerable<TrainingDto>> GetAllAsync()
    {
        var trainings = await _repository.GetAllActiveAsync();
        return trainings.OrderByDescending(e => e.FechaHora).Select(MapToDto).ToList();
    }

    public async Task<TrainingDto> CreateAsync(SaveTrainingDto dto)
    {
        var entity = new Entrenamiento
        {
            SedeId = dto.SedeId,
            EntrenadorId = dto.EntrenadorId,
            Titulo = dto.Titulo,
            Descripcion = dto.Descripcion,
            FechaHora = dto.FechaHora,
            FechaFin = dto.FechaFin,
            CapacidadMaxima = dto.CapacidadMaxima > 0 ? dto.CapacidadMaxima : 20,
            Estado = "PENDIENTE",
            CreadoEn = DateTime.UtcNow
        };

        await _repository.AddAsync(entity);
        return MapToDto(entity);
    }

    public async Task<TrainingDto?> UpdateAsync(int id, SaveTrainingDto dto)
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
        return MapToDto(existing);
    }

    public async Task<bool> DeleteAsync(int id)
    {
        var existing = await _repository.GetByIdActiveAsync(id);
        if (existing == null) return false;

        existing.EliminadoEn = DateTime.UtcNow;
        await _repository.UpdateAsync(existing);
        return true;
    }

    public async Task<TrainingDto?> CloseTrainingAsync(int id)
    {
        var existing = await _repository.GetByIdActiveAsync(id);
        if (existing == null) return null;

        existing.Estado = "CERRADO";
        await _repository.UpdateAsync(existing);
        return MapToDto(existing);
    }

    public async Task<IEnumerable<TrainingAttendanceMemberDto>> GetAttendanceAsync(int id)
    {
        var asistencia = await _repository.GetAsistenciasByEntrenamientoIdAsync(id);
        var miembrosDb = await _repository.GetActiveMembersAsync();

        return miembrosDb.Select(u => new TrainingAttendanceMemberDto
        {
            Id = u.Id,
            Nombre = u.Nombre,
            Apellido = u.Apellido,
            Asistio = asistencia.Any(a => a.UsuarioId == u.Id && a.Presente),
            Observaciones = asistencia.FirstOrDefault(a => a.UsuarioId == u.Id)?.Observaciones
        }).ToList();
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

    private static TrainingDto MapToDto(Entrenamiento e) => new()
    {
        Id = e.Id,
        SedeId = e.SedeId,
        EntrenadorId = e.EntrenadorId,
        Titulo = e.Titulo,
        Descripcion = e.Descripcion,
        FechaHora = e.FechaHora,
        FechaFin = e.FechaFin,
        CapacidadMaxima = e.CapacidadMaxima,
        Estado = e.Estado,
        CreadoEn = e.CreadoEn
    };
}
