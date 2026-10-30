using Sportify.Domain.Entities;

namespace Sportify.Application.Interfaces;

public interface IMembershipRepository
{
    Task<IReadOnlyList<PlanMembresia>> GetActivePlansAsync();
    Task<IReadOnlyList<Membresia>> GetAllWithDetailsAsync();
    Task<IReadOnlyList<Membresia>> GetByUserIdWithDetailsAsync(int userId);
    Task<Membresia?> GetByIdWithDetailsAsync(int id);
    Task<bool> UserExistsAsync(int userId);
    Task<bool> HasActiveOrPendingMembershipAsync(int userId);
    Task<PlanMembresia?> GetPlanByIdAsync(int planId);
    Task<Membresia> AddAsync(Membresia membresia);
    Task UpdateAsync(Membresia membresia);
}
