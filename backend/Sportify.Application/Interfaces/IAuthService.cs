using Sportify.Application.DTOs.Auth;

namespace Sportify.Application.Interfaces;

/// <summary>Interfaz del servicio de autenticación.</summary>
public interface IAuthService
{
    Task<LoginResponseDto> LoginAsync(LoginDto dto);
    Task ForgotPasswordAsync(ForgotPasswordDto dto);
    Task ResetPasswordAsync(ResetPasswordDto dto);
}
