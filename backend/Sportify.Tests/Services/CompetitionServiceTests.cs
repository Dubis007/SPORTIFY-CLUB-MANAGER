using Moq;
using Sportify.Application.DTOs.Competitions;
using Sportify.Application.Interfaces;
using Sportify.Application.Services;
using Sportify.Domain.Entities;

namespace Sportify.Tests.Services;

public class CompetitionServiceTests
{
    [Fact]
    public async Task CreateAsync_ValidCompetition_PersistsAndMapsDto()
    {
        var mockRepo = new Mock<ICompetitionRepository>();
        var service = new CompetitionService(mockRepo.Object);

        var dto = await service.CreateAsync(new SaveCompetitionDto
        {
            Nombre = "Copa Metropolitana 2026",
            Descripcion = "Torneo oficial interclubes",
            Ubicacion = "Estadio Norte",
            FechaInicio = new DateTime(2026, 11, 15, 14, 0, 0, DateTimeKind.Utc),
            FechaFin = new DateTime(2026, 11, 15, 17, 0, 0, DateTimeKind.Utc)
        });

        Assert.Equal("Copa Metropolitana 2026", dto.Nombre);
        Assert.Equal("Estadio Norte", dto.Ubicacion);
        mockRepo.Verify(r => r.AddAsync(It.IsAny<Competencia>()), Times.Once);
    }

    [Fact]
    public async Task DeleteAsync_ActiveCompetition_SetsEliminadoEnTimestamp()
    {
        var comp = new Competencia { Id = 7, Nombre = "Torneo Clausura", EliminadoEn = null };
        var mockRepo = new Mock<ICompetitionRepository>();
        mockRepo.Setup(r => r.GetByIdAsync(7)).ReturnsAsync(comp);

        var service = new CompetitionService(mockRepo.Object);
        var deleted = await service.DeleteAsync(7);

        Assert.True(deleted);
        Assert.NotNull(comp.EliminadoEn);
        mockRepo.Verify(r => r.UpdateAsync(comp), Times.Once);
    }
}
