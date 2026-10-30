using Moq;
using Sportify.Application.DTOs.Memberships;
using Sportify.Application.Interfaces;
using Sportify.Application.Services;
using Sportify.Domain.Entities;
using Sportify.Domain.Enums;

namespace Sportify.Tests.Services;

public class MembershipServiceTests
{
    [Fact]
    public async Task CreateMembershipAsync_ValidRequest_ComputesEndDateFromPlanDuration()
    {
        var startDate = new DateTime(2026, 10, 1, 0, 0, 0, DateTimeKind.Utc);
        var plan = new PlanMembresia { Id = 2, Nombre = "Plan Mensual", DuracionDias = 30, PrecioCOP = 120000m };

        var mockRepo = new Mock<IMembershipRepository>();
        mockRepo.Setup(r => r.UserExistsAsync(4)).ReturnsAsync(true);
        mockRepo.Setup(r => r.HasActiveOrPendingMembershipAsync(4)).ReturnsAsync(false);
        mockRepo.Setup(r => r.GetPlanByIdAsync(2)).ReturnsAsync(plan);
        mockRepo.Setup(r => r.AddAsync(It.IsAny<Membresia>()))
            .ReturnsAsync((Membresia m) =>
            {
                m.Id = 50;
                m.Usuario = new Usuario { Nombre = "Mario", Apellido = "Gómez" };
                m.PlanMembresia = plan;
                return m;
            });

        var service = new MembershipService(mockRepo.Object);
        var result = await service.CreateMembershipAsync(new CreateMembershipDto
        {
            UsuarioId = 4,
            PlanMembresiaId = 2,
            FechaInicio = startDate
        });

        Assert.Equal(50, result.Id);
        Assert.Equal("ACTIVA", result.Estado);
        Assert.Equal(startDate.AddDays(30), result.FechaFin);
    }

    [Fact]
    public async Task CreateMembershipAsync_DuplicateActiveOrPendingMembership_ThrowsInvalidOperationException()
    {
        var mockRepo = new Mock<IMembershipRepository>();
        mockRepo.Setup(r => r.UserExistsAsync(4)).ReturnsAsync(true);
        mockRepo.Setup(r => r.HasActiveOrPendingMembershipAsync(4)).ReturnsAsync(true);

        var service = new MembershipService(mockRepo.Object);

        await Assert.ThrowsAsync<InvalidOperationException>(() =>
            service.CreateMembershipAsync(new CreateMembershipDto
            {
                UsuarioId = 4,
                PlanMembresiaId = 2,
                FechaInicio = DateTime.UtcNow
            }));
    }

    [Fact]
    public async Task UpdateMembershipStatusAsync_ValidId_UpdatesStatus()
    {
        var entity = new Membresia
        {
            Id = 10,
            UsuarioId = 4,
            PlanMembresiaId = 2,
            Estado = EstadoMembresia.ACTIVA,
            Usuario = new Usuario { Nombre = "Mario", Apellido = "Gómez" },
            PlanMembresia = new PlanMembresia { Nombre = "Plan Mensual" }
        };

        var mockRepo = new Mock<IMembershipRepository>();
        mockRepo.Setup(r => r.GetByIdWithDetailsAsync(10)).ReturnsAsync(entity);

        var service = new MembershipService(mockRepo.Object);
        var updated = await service.UpdateMembershipStatusAsync(10, new UpdateMembershipStatusDto
        {
            Estado = EstadoMembresia.SUSPENDIDA
        });

        Assert.Equal("SUSPENDIDA", updated.Estado);
        mockRepo.Verify(r => r.UpdateAsync(entity), Times.Once);
    }
}
