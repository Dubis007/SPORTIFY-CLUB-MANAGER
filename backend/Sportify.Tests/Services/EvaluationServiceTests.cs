using Moq;
using Sportify.Application.DTOs.Common;
using Sportify.Application.DTOs.Evaluations;
using Sportify.Application.Interfaces;
using Sportify.Application.Services;
using Sportify.Domain.Entities;

namespace Sportify.Tests.Services;

public class EvaluationServiceTests
{
    [Fact]
    public async Task CreateAsync_UniqueInscripcion_PersistsEvaluationWithCurrentCoachId()
    {
        var mockRepo = new Mock<IEvaluationRepository>();
        mockRepo.Setup(r => r.ExistsByInscripcionIdAsync(21)).ReturnsAsync(false);

        var service = new EvaluationService(mockRepo.Object);
        var (isSuccess, error, dto) = await service.CreateAsync(new SaveEvaluationDto
        {
            InscripcionId = 21,
            Puntaje = 9.2m,
            Posicion = 1,
            Desempeno = "Sobresaliente",
            Comentarios = "Excelente lectura táctica"
        }, currentUserId: 3);

        Assert.True(isSuccess);
        Assert.Equal(string.Empty, error);
        Assert.NotNull(dto);
        Assert.Equal(3, dto!.EvaluadoPorId);
        Assert.Equal(9.2m, dto.Puntaje);
    }

    [Fact]
    public async Task CreateAsync_ExistingEvaluationForInscripcion_RejectsDuplicate()
    {
        var mockRepo = new Mock<IEvaluationRepository>();
        mockRepo.Setup(r => r.ExistsByInscripcionIdAsync(21)).ReturnsAsync(true);

        var service = new EvaluationService(mockRepo.Object);
        var (isSuccess, error, dto) = await service.CreateAsync(new SaveEvaluationDto
        {
            InscripcionId = 21,
            Puntaje = 8.0m
        }, currentUserId: 3);

        Assert.False(isSuccess);
        Assert.Contains("ya tiene una evaluación", error);
        Assert.Null(dto);
    }

    [Fact]
    public async Task GetPagedAsync_ReturnsPagedEvaluationsWithMetadata()
    {
        var items = new List<EvaluacionCompetencia>
        {
            new()
            {
                Id = 1,
                InscripcionId = 21,
                Puntaje = 8.8m,
                EvaluadoPorId = 3,
                Inscripcion = new InscripcionCompetencia
                {
                    Usuario = new Usuario { Nombre = "Mario", Apellido = "Gómez" },
                    Competencia = new Competencia { Nombre = "Copa Norte" }
                }
            }
        };

        var mockRepo = new Mock<IEvaluationRepository>();
        mockRepo.Setup(r => r.GetPagedWithIncludesAsync(0, 10, 3)).ReturnsAsync((items, 1));

        var service = new EvaluationService(mockRepo.Object);
        var paged = await service.GetPagedAsync(new PaginationParams { Page = 1, PageSize = 10 }, evaluadoPorId: 3);

        Assert.Single(paged.Items);
        Assert.Equal(1, paged.TotalCount);
        Assert.Equal("Mario Gómez", paged.Items.First().UsuarioNombre);
    }
}
