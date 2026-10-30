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
    public async Task ResetPasswordAsync_ValidPin_UpdatesPasswordAndMarksTokenUsed()
    {
        var user = new Usuario
        {
            Id = 4,
            Correo = "miembro@sportify.com",
            ContrasenaHash = BCrypt.Net.BCrypt.HashPassword("OldPass123!"),
            Activo = true
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
        Assert.True(BCrypt.Net.BCrypt.Verify("NewPassword2026!", user.ContrasenaHash));
        mockUsers.Verify(r => r.UpdateResetTokenAsync(resetToken), Times.Once);
    }
}
