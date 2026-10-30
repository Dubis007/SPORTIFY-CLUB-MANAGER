using Moq;
using Sportify.Application.DTOs.Registrations;
using Sportify.Application.Interfaces;
using Sportify.Application.Services;
using Sportify.Domain.Entities;
using Sportify.Domain.Enums;

namespace Sportify.Tests.Services;

public class RegistrationServiceTests
{
    [Fact]
    public async Task CreateAsync_NewRegistration_PersistsAndReturnsDto()
    {
        var mockRepo = new Mock<IRegistrationRepository>();
        mockRepo.Setup(r => r.ExistsAsync(4, 9)).ReturnsAsync(false);

        var service = new RegistrationService(mockRepo.Object);
        var result = await service.CreateAsync(new SaveRegistrationDto
        {
            UsuarioId = 4,
            CompetenciaId = 9,
            Estado = EstadoInscripcion.CONFIRMADA
        });

        Assert.NotNull(result);
        Assert.Equal(4, result!.UsuarioId);
        Assert.Equal(9, result.CompetenciaId);
        Assert.Equal(EstadoInscripcion.CONFIRMADA, result.Estado);
        mockRepo.Verify(r => r.AddAsync(It.IsAny<InscripcionCompetencia>()), Times.Once);
    }

    [Fact]
    public async Task CreateAsync_DuplicateUserAndCompetition_ReturnsNull()
    {
        var mockRepo = new Mock<IRegistrationRepository>();
        mockRepo.Setup(r => r.ExistsAsync(4, 9)).ReturnsAsync(true);

        var service = new RegistrationService(mockRepo.Object);
        var result = await service.CreateAsync(new SaveRegistrationDto
        {
            UsuarioId = 4,
            CompetenciaId = 9,
            Estado = EstadoInscripcion.PENDIENTE
        });

        Assert.Null(result);
        mockRepo.Verify(r => r.AddAsync(It.IsAny<InscripcionCompetencia>()), Times.Never);
    }
}
