using System;
using System.Linq;
using System.Threading.Tasks;
using Sportify.Application.Interfaces;
using Sportify.Application.DTOs.MemberProfile;
using BCrypt.Net;

namespace Sportify.Application.Services;

public class MemberProfileService : IMemberProfileService
{
    private readonly IMemberProfileRepository _repository;

    public MemberProfileService(IMemberProfileRepository repository)
    {
        _repository = repository;
    }

    public async Task<MemberProfileDto?> GetProfileAsync(int userId)
    {
        var user = await _repository.GetUserByIdAsync(userId);
        if (user == null) return null;

        return new MemberProfileDto
        {
            Id = user.Id,
            Nombre = user.Nombre,
            Apellido = user.Apellido,
            Correo = user.Correo,
            Activo = user.Activo
        };
    }

    public async Task<bool> ChangePasswordAsync(int userId, string currentPassword, string newPassword)
    {
        var user = await _repository.GetUserByIdAsync(userId);
        if (user == null) return false;

        if (!BCrypt.Net.BCrypt.Verify(currentPassword, user.ContrasenaHash))
            return false;

        user.ContrasenaHash = BCrypt.Net.BCrypt.HashPassword(newPassword);
        await _repository.UpdateUserAsync(user);

        return true;
    }

    public async Task<MemberPaymentsDto> GetPaymentsAsync(int userId)
    {
        var membershipsDomain = await _repository.GetMembershipsByUserIdAsync(userId);
        var paymentsDomain = await _repository.GetPaymentsByUserIdAsync(userId);

        var memberships = membershipsDomain.Select(m => new MembershipDto
        {
            Id = m.Id,
            Plan = m.PlanMembresia?.Nombre ?? string.Empty,
            Estado = m.Estado.ToString(),
            FechaInicio = m.FechaInicio,
            FechaFin = m.FechaFin
        }).ToList();

        var payments = paymentsDomain.Select(p => new PaymentDto
        {
            Id = p.Id,
            MontoCOP = p.MontoCOP,
            Estado = p.Estado.ToString(),
            FechaPago = p.FechaPago,
            Plan = p.Membresia?.PlanMembresia?.Nombre ?? string.Empty
        }).ToList();

        return new MemberPaymentsDto
        {
            Memberships = memberships,
            Payments = payments
        };
    }

    public async Task<MemberActivitiesDto> GetActivitiesAsync(int userId)
    {
        var now = DateTime.UtcNow;
        var trainingsDomain = await _repository.GetUpcomingTrainingsAsync(now);
        var attendancesDomain = await _repository.GetAttendancesByUserIdAsync(userId);
        var competitionsDomain = await _repository.GetCompetitionsByUserIdAsync(userId);

        var upcomingTrainings = trainingsDomain.Select(e => new UpcomingTrainingDto
        {
            Id = e.Id,
            Titulo = e.Titulo,
            FechaHora = e.FechaHora,
            FechaFin = e.FechaFin,
            Tipo = "ENTRENAMIENTO"
        }).ToList();

        var attendances = attendancesDomain.Select(a => new AttendanceDto
        {
            Titulo = a.Entrenamiento?.Titulo ?? string.Empty,
            FechaHora = a.Entrenamiento?.FechaHora ?? DateTime.MinValue,
            Observaciones = a.Observaciones ?? string.Empty,
            Tipo = "ASISTENCIA_ENTRENAMIENTO"
        }).ToList();

        var competitions = competitionsDomain.Select(i => new CompetitionDto
        {
            CompetenciaId = i.CompetenciaId,
            Nombre = i.Competencia?.Nombre ?? string.Empty,
            FechaInicio = i.Competencia?.FechaInicio ?? DateTime.MinValue,
            Ubicacion = i.Competencia?.Ubicacion ?? string.Empty,
            EstadoInscripcion = i.Estado.ToString(),
            Tipo = "COMPETENCIA"
        }).ToList();

        return new MemberActivitiesDto
        {
            UpcomingTrainings = upcomingTrainings,
            Attendances = attendances,
            Competitions = competitions
        };
    }
}
