using System;
using System.Collections.Generic;

namespace Sportify.Application.DTOs.MemberProfile;

public class MemberProfileDto
{
    public int Id { get; set; }
    public string Nombre { get; set; } = string.Empty;
    public string Apellido { get; set; } = string.Empty;
    public string Correo { get; set; } = string.Empty;
    public bool Activo { get; set; }
}

public class MemberPaymentsDto
{
    public IEnumerable<MembershipDto> Memberships { get; set; } = new List<MembershipDto>();
    public IEnumerable<PaymentDto> Payments { get; set; } = new List<PaymentDto>();
}

public class MembershipDto
{
    public int Id { get; set; }
    public string Plan { get; set; } = string.Empty;
    public string Estado { get; set; } = string.Empty;
    public DateTime FechaInicio { get; set; }
    public DateTime FechaFin { get; set; }
}

public class PaymentDto
{
    public int Id { get; set; }
    public decimal MontoCOP { get; set; }
    public string Estado { get; set; } = string.Empty;
    public DateTime FechaPago { get; set; }
    public string Plan { get; set; } = string.Empty;
}

public class MemberActivitiesDto
{
    public IEnumerable<UpcomingTrainingDto> UpcomingTrainings { get; set; } = new List<UpcomingTrainingDto>();
    public IEnumerable<AttendanceDto> Attendances { get; set; } = new List<AttendanceDto>();
    public IEnumerable<CompetitionDto> Competitions { get; set; } = new List<CompetitionDto>();
}

public class UpcomingTrainingDto
{
    public int Id { get; set; }
    public string Titulo { get; set; } = string.Empty;
    public DateTime FechaHora { get; set; }
    public DateTime FechaFin { get; set; }
    public string Tipo { get; set; } = "ENTRENAMIENTO";
}

public class AttendanceDto
{
    public string Titulo { get; set; } = string.Empty;
    public DateTime FechaHora { get; set; }
    public string Observaciones { get; set; } = string.Empty;
    public string Tipo { get; set; } = "ASISTENCIA_ENTRENAMIENTO";
}

public class CompetitionDto
{
    public int CompetenciaId { get; set; }
    public string Nombre { get; set; } = string.Empty;
    public DateTime FechaInicio { get; set; }
    public string Ubicacion { get; set; } = string.Empty;
    public string EstadoInscripcion { get; set; } = string.Empty;
    public string Tipo { get; set; } = "COMPETENCIA";
}
