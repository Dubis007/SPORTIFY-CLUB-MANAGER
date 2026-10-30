using Moq;
using Sportify.Application.DTOs.Trainings;
using Sportify.Application.Interfaces;
using Sportify.Application.Services;
using Sportify.Domain.Entities;

namespace Sportify.Tests.Services;

public class TrainingServiceTests
{
    [Fact]
    public async Task CreateAsync_NonPositiveCapacity_DefaultsToTwentyAndPendienteState()
    {
        var mockRepo = new Mock<ITrainingRepository>();
        var service = new TrainingService(mockRepo.Object);

        var created = await service.CreateAsync(new SaveTrainingDto
        {
            SedeId = 1,
            EntrenadorId = 3,
            Titulo = "Sesión Táctica Sub-17",
            Descripcion = "Transiciones ofensivas",
            FechaHora = new DateTime(2026, 11, 2, 16, 0, 0, DateTimeKind.Utc),
            FechaFin = new DateTime(2026, 11, 2, 18, 0, 0, DateTimeKind.Utc),
            CapacidadMaxima = 0
        });

        Assert.Equal(20, created.CapacidadMaxima);
        Assert.Equal("PENDIENTE", created.Estado);
        mockRepo.Verify(r => r.AddAsync(It.IsAny<Entrenamiento>()), Times.Once);
    }

    [Fact]
    public async Task MarkAttendanceAsync_AlreadyPresent_RejectsDuplicateAttendance()
    {
        var mockRepo = new Mock<ITrainingRepository>();
        mockRepo.Setup(r => r.GetByIdAsync(10)).ReturnsAsync(new Entrenamiento { Id = 10 });
        mockRepo.Setup(r => r.GetAsistenciaAsync(10, 4))
            .ReturnsAsync(new Asistencia { EntrenamientoId = 10, UsuarioId = 4, Presente = true });

        var service = new TrainingService(mockRepo.Object);
        var (isSuccess, error) = await service.MarkAttendanceAsync(10, 4, "Puntual");

        Assert.False(isSuccess);
        Assert.Contains("ya tiene asistencia marcada", error);
    }

    [Fact]
    public async Task CloseTrainingAsync_ExistingTraining_TransitionsStateToCerrado()
    {
        var training = new Entrenamiento { Id = 12, Titulo = "Físico", Estado = "PENDIENTE" };
        var mockRepo = new Mock<ITrainingRepository>();
        mockRepo.Setup(r => r.GetByIdActiveAsync(12)).ReturnsAsync(training);

        var service = new TrainingService(mockRepo.Object);
        var closed = await service.CloseTrainingAsync(12);

        Assert.NotNull(closed);
        Assert.Equal("CERRADO", closed!.Estado);
        mockRepo.Verify(r => r.UpdateAsync(training), Times.Once);
    }
}
