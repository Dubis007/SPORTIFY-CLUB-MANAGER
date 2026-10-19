namespace Sportify.Application.Interfaces;

using Sportify.Domain.Entities;
using System.Collections.Generic;
using System.Threading.Tasks;

public interface IMembershipPlanRepository
{
    Task<IEnumerable<PlanMembresia>> GetAllAsync();
    Task<PlanMembresia?> GetByIdAsync(int id);
    Task<PlanMembresia> AddAsync(PlanMembresia plan);
    Task UpdateAsync(PlanMembresia plan);
}
