using Moq;
using Sportify.Application.DTOs.Trainings;
using Sportify.Application.Interfaces;
using Sportify.Application.Services;
using Sportify.Domain.Entities;
using Sportify.Domain.Enums;

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

    [Theory]
    [InlineData(EstadoAsistencia.PRESENTE, true)]
    [InlineData(EstadoAsistencia.TARDE, true)]
    [InlineData(EstadoAsistencia.AUSENTE, false)]
    [InlineData(EstadoAsistencia.EXCUSA, false)]
    public async Task MarkAttendanceAsync_NewRecord_PersistsFourStatesAndSynchronizesPresenteFlag(
        EstadoAsistencia estado,
        bool expectedPresente)
    {
        Asistencia? captured = null;
        var mockRepo = new Mock<ITrainingRepository>();
        mockRepo.Setup(r => r.GetByIdAsync(10)).ReturnsAsync(new Entrenamiento { Id = 10, Estado = "PENDIENTE" });
        mockRepo.Setup(r => r.GetAsistenciaAsync(10, 4)).ReturnsAsync((Asistencia?)null);
        mockRepo.Setup(r => r.AddAsistenciaAsync(It.IsAny<Asistencia>()))
            .Callback<Asistencia>(a => captured = a)
            .Returns(Task.CompletedTask);

        var service = new TrainingService(mockRepo.Object);
        var (isSuccess, error) = await service.MarkAttendanceAsync(10, 4, estado, "  Observación opcional  ");

        Assert.True(isSuccess);
        Assert.Equal(string.Empty, error);
        Assert.NotNull(captured);
        Assert.Equal(estado, captured!.Estado);
        Assert.Equal(expectedPresente, captured.Presente);
        Assert.Equal("Observación opcional", captured.Observaciones);
    }

    [Fact]
    public async Task MarkAttendanceAsync_ExistingRecord_AllowsUpdatingStateAndOptionalComment()
    {
        var existing = new Asistencia
        {
            EntrenamientoId = 10,
            UsuarioId = 4,
            Estado = EstadoAsistencia.AUSENTE,
            Presente = false,
            Observaciones = null
        };

        var mockRepo = new Mock<ITrainingRepository>();
        mockRepo.Setup(r => r.GetByIdAsync(10)).ReturnsAsync(new Entrenamiento { Id = 10, Estado = "PENDIENTE" });
        mockRepo.Setup(r => r.GetAsistenciaAsync(10, 4)).ReturnsAsync(existing);

        var service = new TrainingService(mockRepo.Object);
        var (isSuccess, _) = await service.MarkAttendanceAsync(10, 4, EstadoAsistencia.TARDE, "Llegó 15 minutos tarde");

        Assert.True(isSuccess);
        Assert.Equal(EstadoAsistencia.TARDE, existing.Estado);
        Assert.True(existing.Presente);
        Assert.Equal("Llegó 15 minutos tarde", existing.Observaciones);
        mockRepo.Verify(r => r.SaveChangesAsync(), Times.Once);
    }

    [Fact]
    public async Task MarkAttendanceAsync_ClosedTraining_RejectsAttendanceChanges()
    {
        var mockRepo = new Mock<ITrainingRepository>();
        mockRepo.Setup(r => r.GetByIdAsync(10)).ReturnsAsync(new Entrenamiento { Id = 10, Estado = "CERRADO" });

        var service = new TrainingService(mockRepo.Object);
        var (isSuccess, error) = await service.MarkAttendanceAsync(10, 4, EstadoAsistencia.EXCUSA, "Cita médica");

        Assert.False(isSuccess);
        Assert.Contains("cerrado", error, StringComparison.OrdinalIgnoreCase);
    }

    [Fact]
    public async Task GetAttendanceAsync_MapsRecordedStateAndLeavesUnmarkedNull()
    {
        var mockRepo = new Mock<ITrainingRepository>();
        mockRepo.Setup(r => r.GetActiveMembersAsync()).ReturnsAsync(new List<Usuario>
        {
            new() { Id = 4, Nombre = "Mario", Apellido = "Miembro" },
            new() { Id = 5, Nombre = "Laura", Apellido = "Atleta" }
        });
        mockRepo.Setup(r => r.GetAsistenciasByEntrenamientoIdAsync(10)).ReturnsAsync(new List<Asistencia>
        {
            new()
            {
                EntrenamientoId = 10,
                UsuarioId = 4,
                Estado = EstadoAsistencia.EXCUSA,
                Presente = false,
                Observaciones = "Incapacidad médica"
            }
        });

        var service = new TrainingService(mockRepo.Object);
        var list = (await service.GetAttendanceAsync(10)).ToList();

        Assert.Equal(2, list.Count);
        Assert.Equal("EXCUSA", list[0].Estado);
        Assert.False(list[0].Asistio);
        Assert.Equal("Incapacidad médica", list[0].Observaciones);
        Assert.Null(list[1].Estado);
        Assert.False(list[1].Asistio);
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

    [Fact]
    public async Task GetAllAsync_EntregaElNombreDeLaSedeParaElCalendario()
    {
        var mockRepo = new Mock<ITrainingRepository>();
        mockRepo.Setup(r => r.GetAllActiveAsync()).ReturnsAsync(new List<Entrenamiento>
        {
            new()
            {
                Id = 1,
                SedeId = 1,
                Sede = new Sede { Id = 1, Nombre = "Sede Principal Norte" },
                Titulo = "Funcional",
                FechaHora = new DateTime(2026, 11, 20, 16, 0, 0, DateTimeKind.Utc)
            },
            // Una sede que ya no se puede cargar no rompe el listado: el nombre llega vacío
            new()
            {
                Id = 2,
                SedeId = 9,
                Sede = null,
                Titulo = "Técnica",
                FechaHora = new DateTime(2026, 11, 19, 16, 0, 0, DateTimeKind.Utc)
            }
        });

        var service = new TrainingService(mockRepo.Object);
        var list = (await service.GetAllAsync()).ToList();

        Assert.Equal("Sede Principal Norte", list.Single(t => t.Id == 1).SedeNombre);
        Assert.Null(list.Single(t => t.Id == 2).SedeNombre);
    }
}
