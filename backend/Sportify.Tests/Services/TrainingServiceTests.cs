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
        var mockRepo = RepoConSedesYEntrenadores();
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

    // ---- Selector de sede y entrenador del formulario de sesiones ----

    private static Sede SedeNorte() => new() { Id = 1, Nombre = "Sede Principal Norte", Activo = true };
    private static Sede SedeSur() => new() { Id = 2, Nombre = "Sede Sur", Activo = true };
    private static Sede SedeCerrada() => new() { Id = 5, Nombre = "Sede Cerrada", Activo = false };
    private static Usuario EntrenadoraElena() => new() { Id = 3, Nombre = "Elena", Apellido = "Entrenadora", Activo = true };
    private static Usuario EntrenadorBruno() => new() { Id = 7, Nombre = "Bruno", Apellido = "Suárez", Activo = true };

    /// <summary>Sedes 1 y 2 activas, sede 5 inactiva; entrenadores 3 y 7. Cualquier otro id no existe.</summary>
    private static Mock<ITrainingRepository> RepoConSedesYEntrenadores()
    {
        var mockRepo = new Mock<ITrainingRepository>();
        mockRepo.Setup(r => r.GetSedeByIdAsync(1)).ReturnsAsync(SedeNorte());
        mockRepo.Setup(r => r.GetSedeByIdAsync(2)).ReturnsAsync(SedeSur());
        mockRepo.Setup(r => r.GetSedeByIdAsync(5)).ReturnsAsync(SedeCerrada());
        mockRepo.Setup(r => r.GetActiveCoachByIdAsync(3)).ReturnsAsync(EntrenadoraElena());
        mockRepo.Setup(r => r.GetActiveCoachByIdAsync(7)).ReturnsAsync(EntrenadorBruno());
        return mockRepo;
    }

    private static SaveTrainingDto SesionValida(int sedeId, int entrenadorId) => new()
    {
        SedeId = sedeId,
        EntrenadorId = entrenadorId,
        Titulo = "Técnica de carrera",
        Descripcion = "Series cortas",
        FechaHora = new DateTime(2026, 11, 20, 16, 0, 0, DateTimeKind.Utc),
        FechaFin = new DateTime(2026, 11, 20, 18, 0, 0, DateTimeKind.Utc),
        CapacidadMaxima = 15
    };

    private static Entrenamiento SesionExistente() => new()
    {
        Id = 12,
        SedeId = 1,
        EntrenadorId = 3,
        Titulo = "Físico",
        Estado = "PENDIENTE",
        Sede = SedeNorte(),
        Entrenador = EntrenadoraElena()
    };

    [Fact]
    public async Task CreateAsync_Administrador_GuardaLaSedeYElEntrenadorElegidosYDevuelveSusNombres()
    {
        Entrenamiento? guardado = null;
        var mockRepo = RepoConSedesYEntrenadores();
        mockRepo.Setup(r => r.AddAsync(It.IsAny<Entrenamiento>()))
            .Callback<Entrenamiento>(e => guardado = e)
            .Returns(Task.CompletedTask);

        var service = new TrainingService(mockRepo.Object);
        var creado = await service.CreateAsync(SesionValida(sedeId: 2, entrenadorId: 7));

        Assert.NotNull(guardado);
        Assert.Equal(2, guardado!.SedeId);
        Assert.Equal(7, guardado.EntrenadorId);
        Assert.Equal("Sede Sur", creado.SedeNombre);
        Assert.Equal("Bruno Suárez", creado.EntrenadorNombre);
    }

    [Fact]
    public async Task CreateAsync_Entrenador_QuedaComoResponsableAunqueEnvieElIdDeOtro()
    {
        Entrenamiento? guardado = null;
        var mockRepo = RepoConSedesYEntrenadores();
        mockRepo.Setup(r => r.AddAsync(It.IsAny<Entrenamiento>()))
            .Callback<Entrenamiento>(e => guardado = e)
            .Returns(Task.CompletedTask);

        var service = new TrainingService(mockRepo.Object);
        var creado = await service.CreateAsync(SesionValida(sedeId: 1, entrenadorId: 7), actingCoachId: 3);

        Assert.Equal(3, guardado!.EntrenadorId);
        Assert.Equal("Elena Entrenadora", creado.EntrenadorNombre);
        mockRepo.Verify(r => r.GetActiveCoachByIdAsync(7), Times.Never);
    }

    [Theory]
    [InlineData(0)]  // no se eligió ninguna
    [InlineData(99)] // no existe
    [InlineData(5)]  // existe, pero está inactiva
    public async Task CreateAsync_SedeAusenteInexistenteOInactiva_SeRechazaSinGuardar(int sedeId)
    {
        var mockRepo = RepoConSedesYEntrenadores();
        var service = new TrainingService(mockRepo.Object);

        var error = await Assert.ThrowsAsync<ArgumentException>(
            () => service.CreateAsync(SesionValida(sedeId, entrenadorId: 3)));

        Assert.Contains("sede activa", error.Message);
        mockRepo.Verify(r => r.AddAsync(It.IsAny<Entrenamiento>()), Times.Never);
    }

    [Theory]
    [InlineData(0)] // no se eligió ninguno
    [InlineData(4)] // es un miembro o está inactivo: el repositorio no lo entrega como entrenador
    public async Task CreateAsync_Administrador_EntrenadorAusenteONoValido_SeRechazaSinGuardar(int entrenadorId)
    {
        var mockRepo = RepoConSedesYEntrenadores();
        var service = new TrainingService(mockRepo.Object);

        var error = await Assert.ThrowsAsync<ArgumentException>(
            () => service.CreateAsync(SesionValida(sedeId: 1, entrenadorId)));

        Assert.Contains("entrenador activo", error.Message);
        mockRepo.Verify(r => r.AddAsync(It.IsAny<Entrenamiento>()), Times.Never);
    }

    [Fact]
    public async Task UpdateAsync_Administrador_CambiaLaSedeYReasignaElEntrenador()
    {
        var existente = SesionExistente();
        var mockRepo = RepoConSedesYEntrenadores();
        mockRepo.Setup(r => r.GetByIdActiveAsync(12)).ReturnsAsync(existente);

        var service = new TrainingService(mockRepo.Object);
        var actualizado = await service.UpdateAsync(12, SesionValida(sedeId: 2, entrenadorId: 7));

        Assert.NotNull(actualizado);
        Assert.Equal(2, existente.SedeId);
        Assert.Equal(7, existente.EntrenadorId);
        Assert.Equal("Sede Sur", actualizado!.SedeNombre);
        Assert.Equal("Bruno Suárez", actualizado.EntrenadorNombre);
        mockRepo.Verify(r => r.UpdateAsync(existente), Times.Once);
    }

    [Fact]
    public async Task UpdateAsync_Entrenador_CambiaLaSedePeroNoReasignaLaSesion()
    {
        var existente = SesionExistente();
        var mockRepo = RepoConSedesYEntrenadores();
        mockRepo.Setup(r => r.GetByIdActiveAsync(12)).ReturnsAsync(existente);

        var service = new TrainingService(mockRepo.Object);
        var actualizado = await service.UpdateAsync(12, SesionValida(sedeId: 2, entrenadorId: 7), actingCoachId: 3);

        Assert.Equal(2, existente.SedeId);
        Assert.Equal(3, existente.EntrenadorId);
        Assert.Equal("Elena Entrenadora", actualizado!.EntrenadorNombre);
        mockRepo.Verify(r => r.GetActiveCoachByIdAsync(It.IsAny<int>()), Times.Never);
    }

    [Fact]
    public async Task UpdateAsync_SinCambiarSedeNiEntrenador_ConservaLosAntiguosSinValidarlos()
    {
        // Sesión antigua: su sede se desactivó después y su responsable no figura como entrenador
        var existente = new Entrenamiento
        {
            Id = 12,
            SedeId = 5,
            EntrenadorId = 1,
            Titulo = "Físico",
            Estado = "PENDIENTE",
            Sede = SedeCerrada(),
            Entrenador = new Usuario { Id = 1, Nombre = "Ana", Apellido = "Admin" }
        };
        var mockRepo = RepoConSedesYEntrenadores();
        mockRepo.Setup(r => r.GetByIdActiveAsync(12)).ReturnsAsync(existente);

        var service = new TrainingService(mockRepo.Object);
        var actualizado = await service.UpdateAsync(12, SesionValida(sedeId: 5, entrenadorId: 1));

        Assert.Equal("Técnica de carrera", existente.Titulo);
        Assert.Equal("Sede Cerrada", actualizado!.SedeNombre);
        Assert.Equal("Ana Admin", actualizado.EntrenadorNombre);
        mockRepo.Verify(r => r.GetSedeByIdAsync(It.IsAny<int>()), Times.Never);
        mockRepo.Verify(r => r.GetActiveCoachByIdAsync(It.IsAny<int>()), Times.Never);
    }

    [Fact]
    public async Task UpdateAsync_SedeNuevaInactiva_SeRechazaSinTocarLaSesion()
    {
        var existente = SesionExistente();
        var mockRepo = RepoConSedesYEntrenadores();
        mockRepo.Setup(r => r.GetByIdActiveAsync(12)).ReturnsAsync(existente);

        var service = new TrainingService(mockRepo.Object);
        await Assert.ThrowsAsync<ArgumentException>(
            () => service.UpdateAsync(12, SesionValida(sedeId: 5, entrenadorId: 3)));

        Assert.Equal(1, existente.SedeId);
        Assert.Equal("Físico", existente.Titulo);
        mockRepo.Verify(r => r.UpdateAsync(It.IsAny<Entrenamiento>()), Times.Never);
    }

    [Fact]
    public async Task GetFormOptionsAsync_Administrador_RecibeSedesYEntrenadoresOrdenadosPorNombre()
    {
        var mockRepo = new Mock<ITrainingRepository>();
        mockRepo.Setup(r => r.GetActiveSedesAsync()).ReturnsAsync(new List<Sede> { SedeSur(), SedeNorte() });
        mockRepo.Setup(r => r.GetActiveCoachesAsync())
            .ReturnsAsync(new List<Usuario> { EntrenadoraElena(), EntrenadorBruno() });

        var service = new TrainingService(mockRepo.Object);
        var opciones = await service.GetFormOptionsAsync();

        Assert.Equal(new[] { "Sede Principal Norte", "Sede Sur" }, opciones.Sedes.Select(s => s.Nombre).ToArray());
        Assert.Equal(new[] { "Bruno Suárez", "Elena Entrenadora" }, opciones.Entrenadores.Select(e => e.Nombre).ToArray());
        Assert.Equal(new[] { 7, 3 }, opciones.Entrenadores.Select(e => e.Id).ToArray());
    }

    [Fact]
    public async Task GetFormOptionsAsync_Entrenador_SoloSeRecibeASiMismoComoResponsable()
    {
        var mockRepo = new Mock<ITrainingRepository>();
        mockRepo.Setup(r => r.GetActiveSedesAsync()).ReturnsAsync(new List<Sede> { SedeSur(), SedeNorte() });
        mockRepo.Setup(r => r.GetActiveCoachesAsync())
            .ReturnsAsync(new List<Usuario> { EntrenadoraElena(), EntrenadorBruno() });

        var service = new TrainingService(mockRepo.Object);
        var opciones = await service.GetFormOptionsAsync(actingCoachId: 3);

        var unico = Assert.Single(opciones.Entrenadores);
        Assert.Equal(3, unico.Id);
        Assert.Equal(2, opciones.Sedes.Count);
    }
}
