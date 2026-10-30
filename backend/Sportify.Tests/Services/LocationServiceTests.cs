using Moq;
using Sportify.Application.DTOs.Locations;
using Sportify.Application.Interfaces;
using Sportify.Application.Services;
using Sportify.Domain.Entities;

namespace Sportify.Tests.Services;

public class LocationServiceTests
{
    [Fact]
    public async Task CreateAsync_ValidLocation_PersistsAndReturnsLocationDto()
    {
        var mockRepo = new Mock<ILocationRepository>();
        mockRepo.Setup(r => r.AddAsync(It.IsAny<Sede>()))
            .ReturnsAsync((Sede s) =>
            {
                s.Id = 3;
                return s;
            });

        var service = new LocationService(mockRepo.Object);
        var created = await service.CreateAsync(new SaveLocationDto
        {
            Nombre = "Complejo Deportivo Occidente",
            Ciudad = "Bogotá",
            Direccion = "Av. Boyacá #72-10",
            Telefono = "3001234567",
            Activo = true
        });

        Assert.Equal(3, created.Id);
        Assert.Equal("Complejo Deportivo Occidente", created.Nombre);
        Assert.True(created.Activo);
    }

    [Fact]
    public async Task DeleteAsync_ExistingLocation_PerformsSoftDeactivation()
    {
        var sede = new Sede { Id = 2, Nombre = "Sede Sur", Activo = true };
        var mockRepo = new Mock<ILocationRepository>();
        mockRepo.Setup(r => r.GetByIdAsync(2)).ReturnsAsync(sede);

        var service = new LocationService(mockRepo.Object);
        var deleted = await service.DeleteAsync(2);

        Assert.True(deleted);
        Assert.False(sede.Activo);
        mockRepo.Verify(r => r.UpdateAsync(sede), Times.Once);
    }
}
