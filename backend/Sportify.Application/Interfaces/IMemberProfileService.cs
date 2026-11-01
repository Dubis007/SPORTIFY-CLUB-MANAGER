using System;
using System.Threading.Tasks;
using Sportify.Application.DTOs.MemberProfile;

namespace Sportify.Application.Interfaces;

public interface IMemberProfileService
{
    Task<MemberProfileDto?> GetProfileAsync(int userId);
    Task<bool> UpdateBirthDateAsync(int userId, DateTime? fechaNacimiento);
    Task<bool> ChangePasswordAsync(int userId, string currentPassword, string newPassword);
    Task<MemberPaymentsDto> GetPaymentsAsync(int userId);
    Task<MemberActivitiesDto> GetActivitiesAsync(int userId);
}
