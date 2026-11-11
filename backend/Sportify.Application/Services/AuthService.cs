using System.Security.Cryptography;
using Sportify.Application.DTOs.Auth;
using Sportify.Application.Interfaces;
using Sportify.Domain.Entities;

namespace Sportify.Application.Services;

/// <summary>Implementación del servicio de autenticación con bloqueo por intentos fallidos y caducidad de tokens.</summary>
public class AuthService : IAuthService
{
    public const int MaxFailedLoginAttempts = 5;
    public const int AccountLockoutMinutes = 15;
    public const int RecoveryTokenExpirationMinutes = 15;

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

        if (!usuario.Activo)
            throw new UnauthorizedAccessException("La cuenta se encuentra desactivada");

        var now = DateTime.UtcNow;

        // Verificar si la cuenta está bloqueada por intentos fallidos previos
        if (usuario.BloqueadoHasta.HasValue && usuario.BloqueadoHasta.Value > now)
        {
            throw new UnauthorizedAccessException(
                "La cuenta se encuentra bloqueada temporalmente tras superar el límite de 5 intentos fallidos. Intente más tarde.");
        }

        if (!BCrypt.Net.BCrypt.Verify(dto.Contrasena, usuario.ContrasenaHash))
        {
            if (usuario.BloqueadoHasta.HasValue && usuario.BloqueadoHasta.Value <= now)
            {
                usuario.IntentosFallidos = 0;
                usuario.BloqueadoHasta = null;
            }

            usuario.IntentosFallidos++;
            usuario.ActualizadoEn = now;

            if (usuario.IntentosFallidos >= MaxFailedLoginAttempts)
            {
                usuario.BloqueadoHasta = now.AddMinutes(AccountLockoutMinutes);
                await _userRepository.UpdateAsync(usuario);
                throw new UnauthorizedAccessException(
                    "La cuenta ha sido bloqueada temporalmente tras 5 intentos fallidos de inicio de sesión.");
            }

            await _userRepository.UpdateAsync(usuario);
            throw new UnauthorizedAccessException("Credenciales inválidas");
        }

        // Restablecer contador tras inicio de sesión exitoso
        if (usuario.IntentosFallidos > 0 || usuario.BloqueadoHasta.HasValue)
        {
            usuario.IntentosFallidos = 0;
            usuario.BloqueadoHasta = null;
            usuario.ActualizadoEn = now;
            await _userRepository.UpdateAsync(usuario);
        }

        // Obtiene el primer rol del usuario
        var rol = usuario.UsuarioRoles?.FirstOrDefault()?.Rol?.Nombre ?? "MIEMBRO";

        var token = _jwtTokenService.GenerateToken(usuario.Id, usuario.Correo, rol);
        var csrfToken = _jwtTokenService.GenerateCsrfToken(usuario.Id);
        if (string.IsNullOrWhiteSpace(csrfToken))
        {
            csrfToken = Convert.ToHexString(RandomNumberGenerator.GetBytes(24));
        }
        var expiracion = now.AddHours(8);

        return new LoginResponseDto
        {
            Token = token,
            CsrfToken = csrfToken,
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

        // No revelamos si el correo existe o no (prevención de enumeración de cuentas)
        if (usuario is null)
            return;

        var now = DateTime.UtcNow;

        // Invalidar cualquier token activo previo del usuario
        var tokensPrevios = await _userRepository.GetActiveTokensAsync(usuario.Id);
        if (tokensPrevios is not null)
        {
            foreach (var previo in tokensPrevios)
            {
                previo.Usado = true;
                await _userRepository.UpdateResetTokenAsync(previo);
            }
        }

        // Generar PIN criptográficamente seguro de 6 dígitos con vigencia estricta de 15 minutos
        var pin = RandomNumberGenerator.GetInt32(100_000, 1_000_000).ToString("D6");
        var resetToken = new PasswordResetToken
        {
            UsuarioId = usuario.Id,
            CodigoHash = BCrypt.Net.BCrypt.HashPassword(pin),
            CreadoEn = now,
            Expiracion = now.AddMinutes(RecoveryTokenExpirationMinutes),
            Usado = false
        };

        await _userRepository.AddResetTokenAsync(resetToken);

        usuario.SolicitaCambioClave = true;
        usuario.ActualizadoEn = now;
        await _userRepository.UpdateAsync(usuario);
    }

    /// <inheritdoc/>
    public async Task ResetPasswordAsync(ResetPasswordDto dto)
    {
        if (dto.NuevaContrasena != dto.ConfirmarContrasena)
            throw new InvalidOperationException("Las contraseñas no coinciden");

        var usuario = await _userRepository.GetByEmailAsync(dto.Correo)
            ?? throw new InvalidOperationException("Correo no registrado");

        var now = DateTime.UtcNow;
        var tokensActivos = await _userRepository.GetActiveTokensAsync(usuario.Id);
        var tokenValido = tokensActivos?
            .FirstOrDefault(t => !t.Usado && t.Expiracion > now);

        if (tokenValido is null)
            throw new InvalidOperationException("No existe un PIN activo o ha expirado. Solicite uno nuevo.");

        if (!BCrypt.Net.BCrypt.Verify(dto.Pin, tokenValido.CodigoHash))
            throw new InvalidOperationException("El PIN ingresado no es válido");

        // Actualiza la contraseña y desbloquea la cuenta si estaba bloqueada
        usuario.ContrasenaHash = BCrypt.Net.BCrypt.HashPassword(dto.NuevaContrasena);
        usuario.SolicitaCambioClave = false;
        usuario.IntentosFallidos = 0;
        usuario.BloqueadoHasta = null;
        usuario.ActualizadoEn = now;
        await _userRepository.UpdateAsync(usuario);

        // Marca el token como usado para evitar reutilización
        tokenValido.Usado = true;
        await _userRepository.UpdateResetTokenAsync(tokenValido);
    }
}
