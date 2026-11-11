using Sportify.Application.DTOs.Memberships;

namespace Sportify.Application.Interfaces;

public interface IMembershipService
{
    Task<IEnumerable<PlanMembresiaDto>> GetPlansAsync();
    Task<IEnumerable<MembershipDto>> GetAllMembershipsAsync();
    Task<IEnumerable<MembershipDto>> GetMembershipsByUserAsync(int userId);
    Task<MembershipDto> CreateMembershipAsync(CreateMembershipDto dto);
    Task<MembershipDto> UpdateMembershipStatusAsync(int id, UpdateMembershipStatusDto dto);

    /// <summary>Cancela una membresía a petición de su titular; solo aplica a membresías propias activas o pendientes.</summary>
    Task<MembershipDto> CancelOwnMembershipAsync(int membershipId, int userId);
}
