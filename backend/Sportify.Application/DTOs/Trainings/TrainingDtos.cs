namespace Sportify.Application.DTOs.Trainings;

public class TrainingDto
{
    public int Id { get; set; }
    public int SedeId { get; set; }
    public int EntrenadorId { get; set; }
    public string Titulo { get; set; } = string.Empty;
    public string Descripcion { get; set; } = string.Empty;
    public DateTime FechaHora { get; set; }
    public DateTime FechaFin { get; set; }
    public int CapacidadMaxima { get; set; }
    public string Estado { get; set; } = "PENDIENTE";
    public DateTime CreadoEn { get; set; }
}

public class SaveTrainingDto
{
    public int SedeId { get; set; }
    public int EntrenadorId { get; set; }
    public string Titulo { get; set; } = string.Empty;
    public string Descripcion { get; set; } = string.Empty;
    public DateTime FechaHora { get; set; }
    public DateTime FechaFin { get; set; }
    public int CapacidadMaxima { get; set; }
    public string Estado { get; set; } = "PENDIENTE";
}

public class TrainingAttendanceMemberDto
{
    public int Id { get; set; }
    public string Nombre { get; set; } = string.Empty;
    public string Apellido { get; set; } = string.Empty;
    public bool Asistio { get; set; }
    public string? Observaciones { get; set; }
}

public class MarkAttendanceDto
{
    public int UsuarioId { get; set; }
    public string? Observaciones { get; set; }
}
