namespace Sportify.Application.Interfaces;

public interface IJwtTokenService
{
    string GenerateToken(int userId, string email, string role);
}
