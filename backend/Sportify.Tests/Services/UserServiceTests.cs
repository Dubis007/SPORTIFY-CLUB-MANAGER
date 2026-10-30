using Moq;
using Sportify.Application.DTOs.Users;
using Sportify.Application.Interfaces;
using Sportify.Application.Services;
using Sportify.Domain.Entities;

namespace Sportify.Tests.Services;

public class UserServiceTests
{
    [Fact]
    public async Task CreateAsync_UniqueEmail_HashesPasswordAndMapsSedeAndRoles()
    {
        var mockRepo = new Mock<IUserRepository>();
        mockRepo.Setup(r => r.GetByEmailAsync("nuevo@sportify.com")).ReturnsAsync((Usuario?)null);
        mockRepo.Setup(r => r.CreateAsync(It.IsAny<Usuario>(), "ENTRENADOR"))
            .ReturnsAsync((Usuario u, string _) =>
            {
                u.Id = 15;
                u.Sede = new Sede { Id = 1, Nombre = "Sede Norte" };
                u.UsuarioRoles = new List<UsuarioRol>
                {
                    new() { Rol = new Rol { Nombre = "ENTRENADOR" } }
                };
                return u;
            });

        var service = new UserService(mockRepo.Object);
        var dto = await service.CreateAsync(new CreateUserDto
        {
            Nombre = "Pedro",
            Apellido = "Pérez",
            Correo = "nuevo@sportify.com",
            Contrasena = "Password2026!",
            RolNombre = "ENTRENADOR",
            SedeId = 1
        });

        Assert.Equal("nuevo@sportify.com", dto.Correo);
        Assert.Equal(1, dto.SedeId);
        Assert.Equal("Sede Norte", dto.SedeNombre);
        Assert.Contains("ENTRENADOR", dto.Roles);
    }

    [Fact]
    public async Task CreateAsync_DuplicateEmail_ThrowsInvalidOperationException()
    {
        var mockRepo = new Mock<IUserRepository>();
        mockRepo.Setup(r => r.GetByEmailAsync("duplicado@sportify.com"))
            .ReturnsAsync(new Usuario { Id = 2, Correo = "duplicado@sportify.com" });

        var service = new UserService(mockRepo.Object);

        await Assert.ThrowsAsync<InvalidOperationException>(() =>
            service.CreateAsync(new CreateUserDto
            {
                Nombre = "Test",
                Apellido = "Dup",
                Correo = "duplicado@sportify.com",
                Contrasena = "Password2026!",
                RolNombre = "MIEMBRO"
            }));
    }

    [Fact]
    public async Task SetStatusAsync_ExistingUser_UpdatesActiveFlag()
    {
        var user = new Usuario { Id = 7, Nombre = "Mario", Activo = true };
        var mockRepo = new Mock<IUserRepository>();
        mockRepo.Setup(r => r.GetByIdAsync(7)).ReturnsAsync(user);

        var service = new UserService(mockRepo.Object);
        await service.SetStatusAsync(7, false);

        Assert.False(user.Activo);
        mockRepo.Verify(r => r.UpdateAsync(user), Times.Once);
    }
}
