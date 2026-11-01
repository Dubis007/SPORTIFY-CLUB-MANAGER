using Moq;
using Sportify.Application.DTOs.Users;
using Sportify.Application.Interfaces;
using Sportify.Application.Services;
using Sportify.Domain.Entities;

namespace Sportify.Tests.Services;

public class UserServiceTests
{
    [Fact]
    public async Task CreateAsync_UniqueEmail_HashesPasswordAndMapsSedeRolesAndBirthDate()
    {
        var birthDate = new DateTime(2004, 11, 10, 0, 0, 0, DateTimeKind.Utc);
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
            SedeId = 1,
            FechaNacimiento = birthDate
        });

        Assert.Equal("nuevo@sportify.com", dto.Correo);
        Assert.Equal(1, dto.SedeId);
        Assert.Equal("Sede Norte", dto.SedeNombre);
        Assert.Equal(birthDate.Date, dto.FechaNacimiento);
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

    [Fact]
    public async Task GetUpcomingBirthdaysAsync_HandlesTodayYearWrapLeapYearAndExcludesInactive()
    {
        var refDate = new DateTime(2026, 12, 28, 0, 0, 0, DateTimeKind.Utc);
        var mockRepo = new Mock<IUserRepository>();
        mockRepo.Setup(r => r.GetAllAsync()).ReturnsAsync(new List<Usuario>
        {
            new()
            {
                Id = 1,
                Nombre = "Mario",
                Apellido = "Hoy",
                Activo = true,
                FechaNacimiento = new DateTime(2005, 12, 28)
            },
            new()
            {
                Id = 2,
                Nombre = "Camila",
                Apellido = "Enero",
                Activo = true,
                FechaNacimiento = new DateTime(2008, 1, 3)
            },
            new()
            {
                Id = 3,
                Nombre = "Bisiesto",
                Apellido = "Febrero",
                Activo = true,
                FechaNacimiento = new DateTime(2004, 2, 29)
            },
            new()
            {
                Id = 4,
                Nombre = "Inactivo",
                Apellido = "Excluido",
                Activo = false,
                FechaNacimiento = new DateTime(2000, 12, 29)
            },
            new()
            {
                Id = 5,
                Nombre = "Sin",
                Apellido = "Fecha",
                Activo = true,
                FechaNacimiento = null
            }
        });

        var service = new UserService(mockRepo.Object);
        var upcoming30 = (await service.GetUpcomingBirthdaysAsync(30, refDate)).ToList();

        Assert.Equal(2, upcoming30.Count);
        Assert.Equal("Mario Hoy", upcoming30[0].NombreCompleto);
        Assert.Equal(0, upcoming30[0].DiasFaltantes);
        Assert.Equal("Camila Enero", upcoming30[1].NombreCompleto);
        Assert.Equal(6, upcoming30[1].DiasFaltantes);

        var fullYear = (await service.GetUpcomingBirthdaysAsync(366, refDate)).ToList();
        Assert.Equal(3, fullYear.Count);
        var leap = fullYear.Single(b => b.UsuarioId == 3);
        Assert.Equal(new DateTime(2027, 2, 28, 0, 0, 0, DateTimeKind.Utc), leap.ProximaFecha);
    }
}
