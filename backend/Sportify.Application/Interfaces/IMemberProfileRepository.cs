using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Sportify.Domain.Entities;
using Sportify.Application.DTOs.MemberProfile;

namespace Sportify.Application.Interfaces;

public interface IMemberProfileRepository
{
    Task<Usuario?> GetUserByIdAsync(int userId);
    Task UpdateUserAsync(Usuario user);
    
    Task<IEnumerable<Membresia>> GetMembershipsByUserIdAsync(int userId);
    Task<IEnumerable<Pago>> GetPaymentsByUserIdAsync(int userId);
    
    Task<IEnumerable<Entrenamiento>> GetUpcomingTrainingsAsync(DateTime fromDate);
    Task<IEnumerable<Asistencia>> GetAttendancesByUserIdAsync(int userId);
    Task<IEnumerable<InscripcionCompetencia>> GetCompetitionsByUserIdAsync(int userId);
}
