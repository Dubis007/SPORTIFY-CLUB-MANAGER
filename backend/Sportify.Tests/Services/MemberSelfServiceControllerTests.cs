using System.Reflection;
using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Moq;
using Sportify.Api.Controllers;
using Sportify.Application.DTOs.Memberships;
using Sportify.Application.Interfaces;

namespace Sportify.Tests.Services;

/// <summary>Autogestión del deportista: las acciones propias siempre toman el titular del JWT.</summary>
public class MemberSelfServiceControllerTests
{
    private static MembersController BuildController(
        int userIdFromToken,
        Mock<IMembershipService> membershipService)
    {
        return new MembersController(new Mock<IMemberProfileService>().Object, membershipService.Object)
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

        var controller = BuildController(userIdFromToken: 4, membershipService);
        var result = await controller.CancelMyMembership(id: 10);

        var ok = Assert.IsType<OkObjectResult>(result);
        var dto = Assert.IsType<MembershipDto>(ok.Value);
        Assert.Equal("SUSPENDIDA", dto.Estado);
        membershipService.Verify(s => s.CancelOwnMembershipAsync(10, 4), Times.Once);
    }
}
