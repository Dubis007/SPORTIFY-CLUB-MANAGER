namespace Sportify.Application.Interfaces;

using Sportify.Domain.Entities;
using System.Collections.Generic;
using System.Threading.Tasks;

public interface IMembershipPlanService
{
    Task<IEnumerable<PlanMembresia>> GetAllAsync();
    Task<PlanMembresia> CreateAsync(PlanMembresia plan);
    Task<PlanMembresia?> UpdateAsync(int id, PlanMembresia plan);
    Task<bool> DeleteAsync(int id);
}
