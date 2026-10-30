using Sportify.Application.DTOs.MembershipPlans;

namespace Sportify.Application.Interfaces;

public interface IMembershipPlanService
{
    Task<IEnumerable<MembershipPlanDto>> GetAllAsync();
    Task<MembershipPlanDto> CreateAsync(SaveMembershipPlanDto dto);
    Task<MembershipPlanDto?> UpdateAsync(int id, SaveMembershipPlanDto dto);
    Task<bool> DeleteAsync(int id);
}
