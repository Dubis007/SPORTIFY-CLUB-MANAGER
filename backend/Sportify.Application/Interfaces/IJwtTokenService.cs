namespace Sportify.Application.Interfaces;

public interface IJwtTokenService
{
    string GenerateToken(int userId, string email, string role);

    bool ValidateJwtToken(string? jwtToken, out int userId, out string role)
    {
        userId = 0;
        role = string.Empty;
        return false;
    }

    string GenerateCsrfToken(int userId) => string.Empty;

    bool ValidateCsrfToken(string? csrfToken, int? expectedUserId = null) => false;
}
