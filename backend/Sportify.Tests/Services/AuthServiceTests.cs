using Moq;
using Sportify.Application.DTOs.Auth;
using Sportify.Application.Interfaces;
using Sportify.Application.Services;
using Sportify.Domain.Entities;

namespace Sportify.Tests.Services;

public class AuthServiceTests
{
    [Fact]
    public async Task LoginAsync_ValidCredentials_ReturnsTokenAndUserRole()
    {
        var passwordHash = BCrypt.Net.BCrypt.HashPassword("Sportify2026!");
        var user = new Usuario
        {
            Id = 1,
            Nombre = "Ana",
            Apellido = "Admin",
            Correo = "admin@sportify.com",
            ContrasenaHash = passwordHash,
            Activo = true,
            UsuarioRoles = new List<UsuarioRol>
            {
                new() { Rol = new Rol { Nombre = "ADMIN" } }
            }
        };

        var mockUsers = new Mock<IUserRepository>();
        mockUsers.Setup(r => r.GetByEmailAsync("admin@sportify.com")).ReturnsAsync(user);

        var mockJwt = new Mock<IJwtTokenService>();
        mockJwt.Setup(j => j.GenerateToken(1, "admin@sportify.com", "ADMIN")).Returns("jwt-token-test");

        var service = new AuthService(mockUsers.Object, mockJwt.Object);
        var result = await service.LoginAsync(new LoginDto
        {
            Correo = "admin@sportify.com",
            Contrasena = "Sportify2026!"
        });

        Assert.Equal("jwt-token-test", result.Token);
        Assert.Equal("ADMIN", result.Usuario.Rol);
        Assert.Equal("admin@sportify.com", result.Usuario.Correo);
    }

    [Fact]
    public async Task LoginAsync_InactiveUser_ThrowsUnauthorizedAccessException()
    {
        var user = new Usuario
        {
            Id = 2,
            Correo = "inactivo@sportify.com",
            ContrasenaHash = BCrypt.Net.BCrypt.HashPassword("Sportify2026!"),
            Activo = false
        };

        var mockUsers = new Mock<IUserRepository>();
        mockUsers.Setup(r => r.GetByEmailAsync("inactivo@sportify.com")).ReturnsAsync(user);
        var mockJwt = new Mock<IJwtTokenService>();

        var service = new AuthService(mockUsers.Object, mockJwt.Object);

        await Assert.ThrowsAsync<UnauthorizedAccessException>(() =>
            service.LoginAsync(new LoginDto
            {
                Correo = "inactivo@sportify.com",
                Contrasena = "Sportify2026!"
            }));
    }

    [Fact]
    public async Task LoginAsync_FiveFailedAttempts_LocksAccountAndBlocksSixthAttemptEvenWithValidPassword()
    {
        var user = new Usuario
        {
            Id = 4,
            Nombre = "Mario",
            Apellido = "Miembro",
            Correo = "miembro@sportify.com",
            ContrasenaHash = BCrypt.Net.BCrypt.HashPassword("CorrectPassword2026!"),
            Activo = true
        };

        var mockUsers = new Mock<IUserRepository>();
        mockUsers.Setup(r => r.GetByEmailAsync("miembro@sportify.com")).ReturnsAsync(user);
        var mockJwt = new Mock<IJwtTokenService>();

        var service = new AuthService(mockUsers.Object, mockJwt.Object);

        for (var i = 1; i <= 5; i++)
        {
            await Assert.ThrowsAsync<UnauthorizedAccessException>(() =>
                service.LoginAsync(new LoginDto
                {
                    Correo = "miembro@sportify.com",
                    Contrasena = "WrongPassword!"
                }));
            Assert.Equal(i, user.IntentosFallidos);
        }

        Assert.NotNull(user.BloqueadoHasta);
        Assert.True(user.BloqueadoHasta > DateTime.UtcNow);

        // El 6to intento es rechazado incluso con la contraseña correcta mientras dure el bloqueo
        var ex = await Assert.ThrowsAsync<UnauthorizedAccessException>(() =>
            service.LoginAsync(new LoginDto
            {
                Correo = "miembro@sportify.com",
                Contrasena = "CorrectPassword2026!"
            }));

        Assert.Contains("bloqueada", ex.Message, StringComparison.OrdinalIgnoreCase);
    }

    [Fact]
    public async Task ForgotPasswordAsync_ExistingUser_CreatesTokenExpiringIn15Minutes()
    {
        var user = new Usuario
        {
            Id = 4,
            Correo = "miembro@sportify.com",
            Activo = true
        };

        PasswordResetToken? capturedToken = null;
        var mockUsers = new Mock<IUserRepository>();
        mockUsers.Setup(r => r.GetByEmailAsync("miembro@sportify.com")).ReturnsAsync(user);
        mockUsers.Setup(r => r.GetActiveTokensAsync(4)).ReturnsAsync(new List<PasswordResetToken>());
        mockUsers.Setup(r => r.AddResetTokenAsync(It.IsAny<PasswordResetToken>()))
            .Callback<PasswordResetToken>(t => capturedToken = t)
            .Returns(Task.CompletedTask);

        var service = new AuthService(mockUsers.Object, new Mock<IJwtTokenService>().Object);
        var before = DateTime.UtcNow;

        await service.ForgotPasswordAsync(new ForgotPasswordDto { Correo = "miembro@sportify.com" });

        Assert.NotNull(capturedToken);
        Assert.Equal(4, capturedToken!.UsuarioId);
        Assert.False(capturedToken.Usado);
        Assert.NotEmpty(capturedToken.CodigoHash);

        var ttlMinutes = (capturedToken.Expiracion - before).TotalMinutes;
        Assert.InRange(ttlMinutes, 14.9, 15.5);
        Assert.True(user.SolicitaCambioClave);
    }

    [Fact]
    public async Task ResetPasswordAsync_ValidPin_UpdatesPasswordAndMarksTokenUsed()
    {
        var user = new Usuario
        {
            Id = 4,
            Correo = "miembro@sportify.com",
            ContrasenaHash = BCrypt.Net.BCrypt.HashPassword("OldPass123!"),
            Activo = true,
            IntentosFallidos = 3
        };
        var resetToken = new PasswordResetToken
        {
            Id = 10,
            UsuarioId = 4,
            CodigoHash = BCrypt.Net.BCrypt.HashPassword("123456"),
            Usado = false,
            Expiracion = DateTime.UtcNow.AddMinutes(15)
        };

        var mockUsers = new Mock<IUserRepository>();
        mockUsers.Setup(r => r.GetByEmailAsync("miembro@sportify.com")).ReturnsAsync(user);
        mockUsers.Setup(r => r.GetActiveTokensAsync(4)).ReturnsAsync(new List<PasswordResetToken> { resetToken });

        var service = new AuthService(mockUsers.Object, new Mock<IJwtTokenService>().Object);
        await service.ResetPasswordAsync(new ResetPasswordDto
        {
            Correo = "miembro@sportify.com",
            Pin = "123456",
            NuevaContrasena = "NewPassword2026!",
            ConfirmarContrasena = "NewPassword2026!"
        });

        Assert.True(resetToken.Usado);
        Assert.Equal(0, user.IntentosFallidos);
        Assert.True(BCrypt.Net.BCrypt.Verify("NewPassword2026!", user.ContrasenaHash));
        mockUsers.Verify(r => r.UpdateResetTokenAsync(resetToken), Times.Once);
    }

    [Fact]
    public async Task ResetPasswordAsync_ExpiredToken_ThrowsInvalidOperationException()
    {
        var user = new Usuario
        {
            Id = 4,
            Correo = "miembro@sportify.com",
            ContrasenaHash = BCrypt.Net.BCrypt.HashPassword("OldPass123!"),
            Activo = true
        };
        var expiredToken = new PasswordResetToken
        {
            Id = 11,
            UsuarioId = 4,
            CodigoHash = BCrypt.Net.BCrypt.HashPassword("123456"),
            Usado = false,
            Expiracion = DateTime.UtcNow.AddMinutes(-1) // Caducó hace 1 minuto
        };

        var mockUsers = new Mock<IUserRepository>();
        mockUsers.Setup(r => r.GetByEmailAsync("miembro@sportify.com")).ReturnsAsync(user);
        mockUsers.Setup(r => r.GetActiveTokensAsync(4)).ReturnsAsync(new List<PasswordResetToken> { expiredToken });

        var service = new AuthService(mockUsers.Object, new Mock<IJwtTokenService>().Object);

        await Assert.ThrowsAsync<InvalidOperationException>(() =>
            service.ResetPasswordAsync(new ResetPasswordDto
            {
                Correo = "miembro@sportify.com",
                Pin = "123456",
                NuevaContrasena = "NewPassword2026!",
                ConfirmarContrasena = "NewPassword2026!"
            }));
    }
}
