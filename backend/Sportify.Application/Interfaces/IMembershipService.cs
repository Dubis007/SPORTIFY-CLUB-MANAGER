using Sportify.Application.DTOs.Memberships;

namespace Sportify.Application.Interfaces;

public interface IMembershipService
{
    Task<IEnumerable<PlanMembresiaDto>> GetPlansAsync();
    Task<IEnumerable<MembershipDto>> GetAllMembershipsAsync();
    Task<IEnumerable<MembershipDto>> GetMembershipsByUserAsync(int userId);
    Task<MembershipDto> CreateMembershipAsync(CreateMembershipDto dto);
    Task<MembershipDto> UpdateMembershipStatusAsync(int id, UpdateMembershipStatusDto dto);
}
