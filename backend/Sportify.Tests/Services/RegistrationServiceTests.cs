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
    public async Task CreateAsync_NuevaConvocatoria_NaceSiemprePendienteAunqueElClienteEnvieOtroEstado()
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
        Assert.Equal(EstadoInscripcion.PENDIENTE, result.Estado);
        mockRepo.Verify(
            r => r.AddAsync(It.Is<InscripcionCompetencia>(i => i.Estado == EstadoInscripcion.PENDIENTE)),
            Times.Once);
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

    private static InscripcionCompetencia BuildInvitation(int usuarioId, EstadoInscripcion estado) => new()
    {
        Id = 7,
        CompetenciaId = 9,
        UsuarioId = usuarioId,
        Estado = estado
    };

    [Fact]
    public async Task RespondToInvitationAsync_AceptaConMembresiaActiva_QuedaConfirmada()
    {
        var invitation = BuildInvitation(usuarioId: 4, EstadoInscripcion.PENDIENTE);
        var mockRepo = new Mock<IRegistrationRepository>();
        mockRepo.Setup(r => r.GetByIdAsync(7)).ReturnsAsync(invitation);
        mockRepo.Setup(r => r.HasActiveMembershipAsync(4)).ReturnsAsync(true);

        var service = new RegistrationService(mockRepo.Object);
        var result = await service.RespondToInvitationAsync(registrationId: 7, userId: 4, accept: true);

        Assert.Equal(EstadoInscripcion.CONFIRMADA, result.Estado);
        mockRepo.Verify(r => r.UpdateAsync(invitation), Times.Once);
    }

    [Fact]
    public async Task RespondToInvitationAsync_AceptaSinMembresiaActiva_LanzaInvalidOperationYSiguePendiente()
    {
        var invitation = BuildInvitation(usuarioId: 4, EstadoInscripcion.PENDIENTE);
        var mockRepo = new Mock<IRegistrationRepository>();
        mockRepo.Setup(r => r.GetByIdAsync(7)).ReturnsAsync(invitation);
        mockRepo.Setup(r => r.HasActiveMembershipAsync(4)).ReturnsAsync(false);

        var service = new RegistrationService(mockRepo.Object);

        var ex = await Assert.ThrowsAsync<InvalidOperationException>(() =>
            service.RespondToInvitationAsync(registrationId: 7, userId: 4, accept: true));

        Assert.Contains("RN-03", ex.Message);
        Assert.Equal(EstadoInscripcion.PENDIENTE, invitation.Estado);
        mockRepo.Verify(r => r.UpdateAsync(It.IsAny<InscripcionCompetencia>()), Times.Never);
    }

    [Fact]
    public async Task RespondToInvitationAsync_Rechaza_QuedaCanceladaSinExigirMembresia()
    {
        var invitation = BuildInvitation(usuarioId: 4, EstadoInscripcion.PENDIENTE);
        var mockRepo = new Mock<IRegistrationRepository>();
        mockRepo.Setup(r => r.GetByIdAsync(7)).ReturnsAsync(invitation);

        var service = new RegistrationService(mockRepo.Object);
        var result = await service.RespondToInvitationAsync(registrationId: 7, userId: 4, accept: false);

        Assert.Equal(EstadoInscripcion.CANCELADA, result.Estado);
        mockRepo.Verify(r => r.HasActiveMembershipAsync(It.IsAny<int>()), Times.Never);
        mockRepo.Verify(r => r.UpdateAsync(invitation), Times.Once);
    }

    [Fact]
    public async Task RespondToInvitationAsync_ConvocatoriaDeOtroDeportista_RespondeNoEncontrada()
    {
        var invitation = BuildInvitation(usuarioId: 99, EstadoInscripcion.PENDIENTE);
        var mockRepo = new Mock<IRegistrationRepository>();
        mockRepo.Setup(r => r.GetByIdAsync(7)).ReturnsAsync(invitation);

        var service = new RegistrationService(mockRepo.Object);

        await Assert.ThrowsAsync<KeyNotFoundException>(() =>
            service.RespondToInvitationAsync(registrationId: 7, userId: 4, accept: true));

        Assert.Equal(EstadoInscripcion.PENDIENTE, invitation.Estado);
        mockRepo.Verify(r => r.UpdateAsync(It.IsAny<InscripcionCompetencia>()), Times.Never);
    }

    [Theory]
    [InlineData(EstadoInscripcion.CONFIRMADA)]
    [InlineData(EstadoInscripcion.CANCELADA)]
    [InlineData(EstadoInscripcion.PAGO)]
    public async Task RespondToInvitationAsync_ConvocatoriaYaRespondida_LanzaInvalidOperation(EstadoInscripcion estado)
    {
        var invitation = BuildInvitation(usuarioId: 4, estado);
        var mockRepo = new Mock<IRegistrationRepository>();
        mockRepo.Setup(r => r.GetByIdAsync(7)).ReturnsAsync(invitation);

        var service = new RegistrationService(mockRepo.Object);

        await Assert.ThrowsAsync<InvalidOperationException>(() =>
            service.RespondToInvitationAsync(registrationId: 7, userId: 4, accept: true));

        mockRepo.Verify(r => r.UpdateAsync(It.IsAny<InscripcionCompetencia>()), Times.Never);
    }
}
