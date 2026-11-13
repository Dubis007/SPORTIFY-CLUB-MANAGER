using Sportify.Application.DTOs.Trainings;
using Sportify.Application.Interfaces;
using Sportify.Application.Security;
using Sportify.Domain.Entities;
using Sportify.Domain.Enums;

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
        return trainings.OrderByDescending(e => e.FechaHora).Select(e => MapToDto(e)).ToList();
    }

    public async Task<TrainingFormOptionsDto> GetFormOptionsAsync(int? actingCoachId = null)
    {
        var sedes = await _repository.GetActiveSedesAsync();
        var entrenadores = await _repository.GetActiveCoachesAsync();

        // Un entrenador programa sesiones a su nombre: no recibe la lista de sus colegas
        if (actingCoachId is int coachId)
            entrenadores = entrenadores.Where(u => u.Id == coachId).ToList();

        return new TrainingFormOptionsDto
        {
            Sedes = sedes
                .Select(s => new TrainingOptionDto { Id = s.Id, Nombre = s.Nombre })
                .OrderBy(o => o.Nombre, StringComparer.CurrentCultureIgnoreCase)
                .ToList(),
            Entrenadores = entrenadores
                .Select(u => new TrainingOptionDto { Id = u.Id, Nombre = NombreCompleto(u) })
                .OrderBy(o => o.Nombre, StringComparer.CurrentCultureIgnoreCase)
                .ToList()
        };
    }

    public async Task<TrainingDto> CreateAsync(SaveTrainingDto dto, int? actingCoachId = null)
    {
        var sede = await RequireActiveSedeAsync(dto.SedeId);
        // El entrenador que crea la sesión queda como responsable; solo el administrador elige a otro
        var entrenador = await RequireActiveCoachAsync(actingCoachId ?? dto.EntrenadorId);

        var entity = new Entrenamiento
        {
            SedeId = sede.Id,
            EntrenadorId = entrenador.Id,
            Titulo = XssSanitizer.ValidateAndSanitize(dto.Titulo, nameof(dto.Titulo)),
            Descripcion = XssSanitizer.ValidateAndSanitizeOptional(dto.Descripcion, nameof(dto.Descripcion)) ?? string.Empty,
            FechaHora = dto.FechaHora,
            FechaFin = dto.FechaFin,
            CapacidadMaxima = dto.CapacidadMaxima > 0 ? dto.CapacidadMaxima : 20,
            Estado = "PENDIENTE",
            CreadoEn = DateTime.UtcNow
        };

        await _repository.AddAsync(entity);
        return MapToDto(entity, sede, entrenador);
    }

    public async Task<TrainingDto?> UpdateAsync(int id, SaveTrainingDto dto, int? actingCoachId = null)
    {
        var existing = await _repository.GetByIdActiveAsync(id);
        if (existing == null) return null;

        // La sede y el entrenador solo se validan cuando cambian: una sesión antigua conserva los que ya tenía,
        // aunque la sede se haya desactivado después o su responsable ya no sea entrenador.
        var nuevaSede = dto.SedeId != existing.SedeId
            ? await RequireActiveSedeAsync(dto.SedeId)
            : null;

        // Reasignar la sesión a otro entrenador es decisión del administrador
        var nuevoEntrenador = actingCoachId is null && dto.EntrenadorId != existing.EntrenadorId
            ? await RequireActiveCoachAsync(dto.EntrenadorId)
            : null;

        existing.Titulo = XssSanitizer.ValidateAndSanitize(dto.Titulo, nameof(dto.Titulo));
        existing.Descripcion = XssSanitizer.ValidateAndSanitizeOptional(dto.Descripcion, nameof(dto.Descripcion)) ?? string.Empty;
        existing.FechaHora = dto.FechaHora;
        existing.FechaFin = dto.FechaFin;
        existing.CapacidadMaxima = dto.CapacidadMaxima;
        // Solo se cambia la llave foránea: EF ajusta la navegación al guardar
        if (nuevaSede != null) existing.SedeId = nuevaSede.Id;
        if (nuevoEntrenador != null) existing.EntrenadorId = nuevoEntrenador.Id;

        await _repository.UpdateAsync(existing);
        return MapToDto(existing, nuevaSede, nuevoEntrenador);
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

        return miembrosDb.Select(u =>
        {
            var registro = asistencia.FirstOrDefault(a => a.UsuarioId == u.Id);
            return new TrainingAttendanceMemberDto
            {
                Id = u.Id,
                Nombre = u.Nombre,
                Apellido = u.Apellido,
                Asistio = registro != null && registro.Presente,
                Estado = registro?.Estado.ToString(),
                Observaciones = registro?.Observaciones
            };
        }).ToList();
    }

    public async Task<(bool IsSuccess, string ErrorMessage)> MarkAttendanceAsync(
        int id,
        int usuarioId,
        EstadoAsistencia estado,
        string? observaciones)
    {
        var training = await _repository.GetByIdAsync(id);
        if (training == null) return (false, "Entrenamiento no encontrado.");

        if (string.Equals(training.Estado, "CERRADO", StringComparison.OrdinalIgnoreCase))
            return (false, "El entrenamiento está cerrado y no admite cambios de asistencia.");

        var cleanObservaciones = XssSanitizer.ValidateAndSanitizeOptional(observaciones, nameof(observaciones));
        var asistioEfectivo = estado is EstadoAsistencia.PRESENTE or EstadoAsistencia.TARDE;
        var existingAttendance = await _repository.GetAsistenciaAsync(id, usuarioId);

        if (existingAttendance != null)
        {
            existingAttendance.Estado = estado;
            existingAttendance.Presente = asistioEfectivo;
            existingAttendance.Observaciones = cleanObservaciones;
            existingAttendance.FechaRegistro = DateTime.UtcNow;
            await _repository.SaveChangesAsync();
        }
        else
        {
            var asistencia = new Asistencia
            {
                EntrenamientoId = id,
                UsuarioId = usuarioId,
                Estado = estado,
                Presente = asistioEfectivo,
                Observaciones = cleanObservaciones,
                FechaRegistro = DateTime.UtcNow
            };
            await _repository.AddAsistenciaAsync(asistencia);
        }

        return (true, string.Empty);
    }

    private async Task<Sede> RequireActiveSedeAsync(int sedeId)
    {
        var sede = sedeId > 0 ? await _repository.GetSedeByIdAsync(sedeId) : null;
        if (sede is null || !sede.Activo)
            throw new ArgumentException("Selecciona una sede activa para el entrenamiento.");

        return sede;
    }

    private async Task<Usuario> RequireActiveCoachAsync(int usuarioId)
    {
        var entrenador = usuarioId > 0 ? await _repository.GetActiveCoachByIdAsync(usuarioId) : null;
        if (entrenador is null)
            throw new ArgumentException("Selecciona un entrenador activo como responsable del entrenamiento.");

        return entrenador;
    }

    private static string NombreCompleto(Usuario u) => $"{u.Nombre} {u.Apellido}".Trim();

    /// <summary>
    /// <paramref name="sede"/> y <paramref name="entrenador"/> son los recién elegidos al crear o editar:
    /// en ese momento la entidad todavía no trae cargadas sus navegaciones.
    /// </summary>
    private static TrainingDto MapToDto(Entrenamiento e, Sede? sede = null, Usuario? entrenador = null)
    {
        var responsable = entrenador ?? e.Entrenador;

        return new TrainingDto
        {
            Id = e.Id,
            SedeId = e.SedeId,
            SedeNombre = (sede ?? e.Sede)?.Nombre,
            EntrenadorId = e.EntrenadorId,
            EntrenadorNombre = responsable is null ? null : NombreCompleto(responsable),
            Titulo = e.Titulo,
            Descripcion = e.Descripcion,
            FechaHora = e.FechaHora,
            FechaFin = e.FechaFin,
            CapacidadMaxima = e.CapacidadMaxima,
            Estado = e.Estado,
            CreadoEn = e.CreadoEn
        };
    }
}
