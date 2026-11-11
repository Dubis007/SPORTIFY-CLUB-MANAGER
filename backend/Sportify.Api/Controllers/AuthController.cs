using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using Sportify.Application.DTOs.Auth;
using Sportify.Application.Interfaces;

namespace Sportify.Api.Controllers;

[ApiController]
[Route("api/auth")]
[EnableRateLimiting("AuthRateLimit")]
public class AuthController : ControllerBase
{
    private readonly IAuthService _authService;
    private readonly IJwtTokenService _jwtTokenService;

    public AuthController(IAuthService authService, IJwtTokenService? jwtTokenService = null)
    {
        _authService = authService;
        _jwtTokenService = jwtTokenService!;
    }

    /// <summary>Inicia sesion y retorna un token JWT junto con su token anti-CSRF.</summary>
    [HttpPost("login")]
    [ProducesResponseType(typeof(LoginResponseDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> Login([FromBody] LoginDto dto)
    {
        var response = await _authService.LoginAsync(dto);

        if (!string.IsNullOrWhiteSpace(response.CsrfToken) && Response != null)
        {
            Response.Headers["X-CSRF-TOKEN"] = response.CsrfToken;
            Response.Cookies.Append("XSRF-TOKEN", response.CsrfToken, new CookieOptions
            {
                HttpOnly = false,
                SameSite = SameSiteMode.Strict,
                Secure = Request?.IsHttps ?? false,
                Expires = response.TokenExpira
            });
        }

        return Ok(response);
    }

    /// <summary>Emite o renueva un token CSRF firmado para el cliente o usuario autenticado.</summary>
    [HttpGet("csrf-token")]
    [AllowAnonymous]
    [ProducesResponseType(StatusCodes.Status200OK)]
    public IActionResult GetCsrfToken()
    {
        var userIdClaim = User?.FindFirst(ClaimTypes.NameIdentifier)?.Value
                       ?? User?.FindFirst("sub")?.Value;
        var userId = int.TryParse(userIdClaim, out var uid) ? uid : 0;

        var csrfToken = _jwtTokenService?.GenerateCsrfToken(userId) ?? Guid.NewGuid().ToString("N");
        if (Response != null)
        {
            Response.Headers["X-CSRF-TOKEN"] = csrfToken;
        }

        return Ok(new { csrfToken });
    }

    /// <summary>Solicita recuperacion de contrasena (envia PIN por email con vigencia de 15 minutos).</summary>
    [HttpPost("forgot-password")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    public async Task<IActionResult> ForgotPassword([FromBody] ForgotPasswordDto dto)
    {
        await _authService.ForgotPasswordAsync(dto);
        return Ok(new { message = "Si el correo existe, recibiras un PIN de recuperacion." });
    }

    /// <summary>Resetea la contrasena usando el PIN recibido.</summary>
    [HttpPost("reset-password")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> ResetPassword([FromBody] ResetPasswordDto dto)
    {
        await _authService.ResetPasswordAsync(dto);
        return Ok(new { message = "Contrasena actualizada exitosamente." });
    }
}
