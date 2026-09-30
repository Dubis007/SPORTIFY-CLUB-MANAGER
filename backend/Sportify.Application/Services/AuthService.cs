using Microsoft.Extensions.Configuration;
using Sportify.Application.DTOs.Auth;
using Sportify.Application.Interfaces;
using Sportify.Domain.Entities;

namespace Sportify.Application.Services;

/// <summary>Implementación del servicio de autenticación.</summary>
public class AuthService : IAuthService
{
    private readonly IUserRepository _userRepository;
    private readonly IJwtTokenService _jwtTokenService;

    public AuthService(IUserRepository userRepository, IJwtTokenService jwtTokenService)
    {
        _userRepository = userRepository;
        _jwtTokenService = jwtTokenService;
    }

    /// <inheritdoc/>
    public async Task<LoginResponseDto> LoginAsync(LoginDto dto)
    {
        var usuario = await _userRepository.GetByEmailAsync(dto.Correo);

        if (usuario is null)
            throw new UnauthorizedAccessException("Credenciales inválidas");

        if (!BCrypt.Net.BCrypt.Verify(dto.Contrasena, usuario.ContrasenaHash))
            throw new UnauthorizedAccessException("Credenciales inválidas");

        if (!usuario.Activo)
            throw new UnauthorizedAccessException("La cuenta se encuentra desactivada");

        // Obtiene el primer rol del usuario
        var rol = usuario.UsuarioRoles?.FirstOrDefault()?.Rol?.Nombre ?? "MIEMBRO";

        var token = _jwtTokenService.GenerateToken(usuario.Id, usuario.Correo, rol);
        var expiracion = DateTime.UtcNow.AddHours(8);

        return new LoginResponseDto
        {
            Token = token,
            TokenExpira = expiracion,
            Usuario = new UsuarioInfoDto
            {
                Id = usuario.Id,
                Nombre = usuario.Nombre,
                Apellido = usuario.Apellido,
                Correo = usuario.Correo,
                Rol = rol
            }
        };
    }

    /// <inheritdoc/>
    public async Task ForgotPasswordAsync(ForgotPasswordDto dto)
    {
        var usuario = await _userRepository.GetByEmailAsync(dto.Correo);

        // No revelamos si el correo existe o no (seguridad)
        if (usuario is null)
            return;

        // Opción A: Encender la alarma para que el administrador la vea
        usuario.SolicitaCambioClave = true;
        usuario.ActualizadoEn = DateTime.UtcNow;
        
        await _userRepository.UpdateAsync(usuario);
    }

    /// <inheritdoc/>
    public async Task ResetPasswordAsync(ResetPasswordDto dto)
    {
        if (dto.NuevaContrasena != dto.ConfirmarContrasena)
            throw new InvalidOperationException("Las contraseñas no coinciden");

        var usuario = await _userRepository.GetByEmailAsync(dto.Correo)
            ?? throw new InvalidOperationException("Correo no registrado");

        var tokensActivos = await _userRepository.GetActiveTokensAsync(usuario.Id);
        var tokenValido = tokensActivos.FirstOrDefault();

        if (tokenValido is null)
            throw new InvalidOperationException("No existe un PIN activo o ha expirado. Solicite uno nuevo.");

        if (!BCrypt.Net.BCrypt.Verify(dto.Pin, tokenValido.CodigoHash))
            throw new InvalidOperationException("El PIN ingresado no es válido");

        // Actualiza la contraseña del usuario
        usuario.ContrasenaHash = BCrypt.Net.BCrypt.HashPassword(dto.NuevaContrasena);
        await _userRepository.UpdateAsync(usuario);

        // Marca el token como usado
        tokenValido.Usado = true;
        await _userRepository.UpdateResetTokenAsync(tokenValido);
    }
}
