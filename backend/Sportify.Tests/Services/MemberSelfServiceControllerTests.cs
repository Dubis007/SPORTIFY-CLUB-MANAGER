using System.Reflection;
using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Moq;
using Sportify.Api.Controllers;
using Sportify.Application.DTOs.Memberships;
using Sportify.Application.DTOs.Registrations;
using Sportify.Application.Interfaces;
using Sportify.Domain.Enums;

namespace Sportify.Tests.Services;

/// <summary>Autogestión del deportista: las acciones propias siempre toman el titular del JWT.</summary>
public class MemberSelfServiceControllerTests
{
    private static MembersController BuildController(
        int userIdFromToken,
        Mock<IMembershipService>? membershipService = null,
        Mock<IRegistrationService>? registrationService = null)
    {
        return new MembersController(
            new Mock<IMemberProfileService>().Object,
            (membershipService ?? new Mock<IMembershipService>()).Object,
            (registrationService ?? new Mock<IRegistrationService>()).Object)
        {
            ControllerContext = new ControllerContext
            {
                HttpContext = new DefaultHttpContext
                {
                    User = new ClaimsPrincipal(new ClaimsIdentity(new[]
                    {
                        new Claim(ClaimTypes.NameIdentifier, userIdFromToken.ToString()),
                        new Claim(ClaimTypes.Role, "MIEMBRO")
                    }, "TestAuth"))
                }
            }
        };
    }

    [Fact]
    public void MembersController_SoloAdmiteElRolMiembro()
    {
        var attr = typeof(MembersController).GetCustomAttribute<AuthorizeAttribute>();

        Assert.NotNull(attr);
        Assert.Equal("MIEMBRO", attr.Roles);
    }

    [Fact]
    public async Task CancelMyMembership_UsaElTitularDelTokenYDevuelveLaMembresiaSuspendida()
    {
        var membershipService = new Mock<IMembershipService>();
        membershipService
            .Setup(s => s.CancelOwnMembershipAsync(10, 4))
            .ReturnsAsync(new MembershipDto { Id = 10, UsuarioId = 4, Estado = "SUSPENDIDA" });

        var controller = BuildController(userIdFromToken: 4, membershipService: membershipService);
        var result = await controller.CancelMyMembership(id: 10);

        var ok = Assert.IsType<OkObjectResult>(result);
        var dto = Assert.IsType<MembershipDto>(ok.Value);
        Assert.Equal("SUSPENDIDA", dto.Estado);
        membershipService.Verify(s => s.CancelOwnMembershipAsync(10, 4), Times.Once);
    }

    [Fact]
    public async Task AcceptInvitation_UsaElTitularDelTokenYConfirmaLaInscripcion()
    {
        var registrationService = new Mock<IRegistrationService>();
        registrationService
            .Setup(s => s.RespondToInvitationAsync(7, 4, true))
            .ReturnsAsync(new RegistrationDto { Id = 7, UsuarioId = 4, Estado = EstadoInscripcion.CONFIRMADA });

        var controller = BuildController(userIdFromToken: 4, registrationService: registrationService);
        var result = await controller.AcceptInvitation(id: 7);

        var ok = Assert.IsType<OkObjectResult>(result);
        var dto = Assert.IsType<RegistrationDto>(ok.Value);
        Assert.Equal(EstadoInscripcion.CONFIRMADA, dto.Estado);
        registrationService.Verify(s => s.RespondToInvitationAsync(7, 4, true), Times.Once);
    }

    [Fact]
    public async Task DeclineInvitation_UsaElTitularDelTokenYCancelaLaInscripcion()
    {
        var registrationService = new Mock<IRegistrationService>();
        registrationService
            .Setup(s => s.RespondToInvitationAsync(7, 4, false))
            .ReturnsAsync(new RegistrationDto { Id = 7, UsuarioId = 4, Estado = EstadoInscripcion.CANCELADA });

        var controller = BuildController(userIdFromToken: 4, registrationService: registrationService);
        var result = await controller.DeclineInvitation(id: 7);

        var ok = Assert.IsType<OkObjectResult>(result);
        var dto = Assert.IsType<RegistrationDto>(ok.Value);
        Assert.Equal(EstadoInscripcion.CANCELADA, dto.Estado);
        registrationService.Verify(s => s.RespondToInvitationAsync(7, 4, false), Times.Once);
    }

    [Fact]
    public void RegistrationsController_SigueReservadoAlPersonalQueConvoca()
    {
        var attr = typeof(RegistrationsController).GetCustomAttribute<AuthorizeAttribute>();

        Assert.NotNull(attr);
        Assert.Equal("ADMIN,ENTRENADOR", attr.Roles);
    }
}
