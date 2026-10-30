using Moq;
using Sportify.Application.DTOs.MembershipPlans;
using Sportify.Application.Interfaces;
using Sportify.Application.Services;
using Sportify.Domain.Entities;

namespace Sportify.Tests.Services;

public class MembershipPlanServiceTests
{
    [Fact]
    public async Task CreateAsync_ValidPlan_ReturnsMappedPlanDto()
    {
        var mockRepo = new Mock<IMembershipPlanRepository>();
        mockRepo.Setup(r => r.AddAsync(It.IsAny<PlanMembresia>()))
            .ReturnsAsync((PlanMembresia p) =>
            {
                p.Id = 5;
                return p;
            });

        var service = new MembershipPlanService(mockRepo.Object);
        var created = await service.CreateAsync(new SaveMembershipPlanDto
        {
            Nombre = "Plan Trimestral Alto Rendimiento",
            Descripcion = "Acceso ilimitado a sesiones",
            PrecioCOP = 320000m,
            DuracionDias = 90,
            Activo = true
        });

        Assert.Equal(5, created.Id);
        Assert.Equal(320000m, created.PrecioCOP);
        Assert.Equal(90, created.DuracionDias);
    }

    [Fact]
    public async Task DeleteAsync_MissingPlan_ReturnsFalse()
    {
        var mockRepo = new Mock<IMembershipPlanRepository>();
        mockRepo.Setup(r => r.GetByIdAsync(99)).ReturnsAsync((PlanMembresia?)null);

        var service = new MembershipPlanService(mockRepo.Object);
        var deleted = await service.DeleteAsync(99);

        Assert.False(deleted);
    }
}
