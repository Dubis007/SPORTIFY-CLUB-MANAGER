using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;
using Sportify.Application.Interfaces;

namespace Sportify.Infrastructure.Authentication;

public class JwtTokenService : IJwtTokenService
{
    private readonly IConfiguration _configuration;

    public JwtTokenService(IConfiguration configuration)
    {
        _configuration = configuration;
    }

    public string GenerateToken(int userId, string email, string role)
    {
        var secret = _configuration["JwtSettings:Secret"]
            ?? throw new InvalidOperationException("JwtSettings:Secret no esta configurado.");
        var issuer = _configuration["JwtSettings:Issuer"]
            ?? throw new InvalidOperationException("JwtSettings:Issuer no esta configurado.");
        var audience = _configuration["JwtSettings:Audience"]
            ?? throw new InvalidOperationException("JwtSettings:Audience no esta configurado.");
        var expirationMinutesStr = _configuration["JwtSettings:ExpirationMinutes"] ?? "60";

        if (!int.TryParse(expirationMinutesStr, out var expirationMinutes))
            expirationMinutes = 60;

        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secret));
        var credentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var claims = new[]
        {
            new Claim(JwtRegisteredClaimNames.Sub, userId.ToString()),
            new Claim(ClaimTypes.NameIdentifier, userId.ToString()),
            new Claim(JwtRegisteredClaimNames.Email, email),
            new Claim(ClaimTypes.Role, role),
            new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString())
        };

        var token = new JwtSecurityToken(
            issuer: issuer,
            audience: audience,
            claims: claims,
            expires: DateTime.UtcNow.AddMinutes(expirationMinutes),
            signingCredentials: credentials
        );

        return new JwtSecurityTokenHandler().WriteToken(token);
    }

    public bool ValidateJwtToken(string? jwtToken, out int userId, out string role)
    {
        userId = 0;
        role = string.Empty;

        if (string.IsNullOrWhiteSpace(jwtToken))
            return false;

        var secret = _configuration["JwtSettings:Secret"];
        var issuer = _configuration["JwtSettings:Issuer"];
        var audience = _configuration["JwtSettings:Audience"];

        if (string.IsNullOrWhiteSpace(secret))
            return false;

        try
        {
            var handler = new JwtSecurityTokenHandler();
            var parameters = new TokenValidationParameters
            {
                ValidateIssuer = !string.IsNullOrWhiteSpace(issuer),
                ValidateAudience = !string.IsNullOrWhiteSpace(audience),
                ValidateLifetime = true,
                ValidateIssuerSigningKey = true,
                ValidIssuer = issuer,
                ValidAudience = audience,
                IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secret)),
                ClockSkew = TimeSpan.FromMinutes(1)
            };

            var principal = handler.ValidateToken(jwtToken, parameters, out _);
            var subClaim = principal.FindFirst(ClaimTypes.NameIdentifier)?.Value
                        ?? principal.FindFirst(JwtRegisteredClaimNames.Sub)?.Value;
            if (!int.TryParse(subClaim, out userId))
                return false;

            role = principal.FindFirst(ClaimTypes.Role)?.Value ?? string.Empty;
            return true;
        }
        catch
        {
            return false;
        }
    }

    public string GenerateCsrfToken(int userId)
    {
        var secret = _configuration["JwtSettings:Secret"]
            ?? "A_VERY_SECRET_KEY_THAT_NEEDS_TO_BE_AT_LEAST_32_CHARACTERS_LONG!";
        var issuedAtUnix = DateTimeOffset.UtcNow.ToUnixTimeSeconds();
        var nonce = Convert.ToHexString(RandomNumberGenerator.GetBytes(16));
        var payload = $"{userId}:{issuedAtUnix}:{nonce}";
        var payloadBytes = Encoding.UTF8.GetBytes(payload);
        var signature = ComputeHmac(payloadBytes, secret);

        return $"{Base64UrlEncoder.Encode(payloadBytes)}.{Base64UrlEncoder.Encode(signature)}";
    }

    public bool ValidateCsrfToken(string? csrfToken, int? expectedUserId = null)
    {
        if (string.IsNullOrWhiteSpace(csrfToken))
            return false;

        var parts = csrfToken.Split('.');
        if (parts.Length != 2)
            return false;

        var secret = _configuration["JwtSettings:Secret"]
            ?? "A_VERY_SECRET_KEY_THAT_NEEDS_TO_BE_AT_LEAST_32_CHARACTERS_LONG!";

        try
        {
            var payloadBytes = Base64UrlEncoder.DecodeBytes(parts[0]);
            var providedSig = Base64UrlEncoder.DecodeBytes(parts[1]);
            var expectedSig = ComputeHmac(payloadBytes, secret);

            if (!CryptographicOperations.FixedTimeEquals(providedSig, expectedSig))
                return false;

            var payload = Encoding.UTF8.GetString(payloadBytes);
            var segments = payload.Split(':');
            if (segments.Length != 3)
                return false;

            if (!int.TryParse(segments[0], out var tokenUserId) || !long.TryParse(segments[1], out var issuedUnix))
                return false;

            if (expectedUserId.HasValue && expectedUserId.Value > 0 && tokenUserId != 0 && tokenUserId != expectedUserId.Value)
                return false;

            var ageSeconds = DateTimeOffset.UtcNow.ToUnixTimeSeconds() - issuedUnix;
            if (ageSeconds < -60 || ageSeconds > 8 * 3600)
                return false;

            return true;
        }
        catch
        {
            return false;
        }
    }

    private static byte[] ComputeHmac(byte[] data, string secret)
    {
        using var hmac = new HMACSHA256(Encoding.UTF8.GetBytes($"CSRF::{secret}"));
        return hmac.ComputeHash(data);
    }
}
