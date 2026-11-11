using System.Reflection;
using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Moq;
using Sportify.Api.Controllers;
using Sportify.Application.Interfaces;

namespace Sportify.Tests.Services;

public class AccessControlAuthorizationTests
{
    [Theory]
    [InlineData(typeof(LocationsController))]
    [InlineData(typeof(MembershipPlansController))]
    public void ControladoresExclusivosAdmin_PoseenAtributoAuthorizeRolesAdmin(Type controllerType)
    {
        var attr = controllerType.GetCustomAttribute<AuthorizeAttribute>();
        Assert.NotNull(attr);
        Assert.NotNull(attr.Roles);
        Assert.Contains("ADMIN", attr.Roles, StringComparison.OrdinalIgnoreCase);
        Assert.Contains("Admin", attr.Roles);
    }

    [Theory]
    [InlineData(nameof(UsersController.Create))]
    [InlineData(nameof(UsersController.Update))]
    [InlineData(nameof(UsersController.Delete))]
    [InlineData(nameof(UsersController.SetStatus))]
    [InlineData(nameof(UsersController.ResetPassword))]
    public void UsersController_EndpointsCriticos_RequierenRolAdmin(string methodName)
    {
        var method = typeof(UsersController).GetMethod(methodName);
        Assert.NotNull(method);

        var attr = method.GetCustomAttribute<AuthorizeAttribute>();
        Assert.NotNull(attr);
        Assert.NotNull(attr.Roles);
        Assert.Contains("Admin", attr.Roles);
    }

    [Fact]
    public async Task MembershipsController_GetByUser_MiembroConsultandoOtroUsuario_RetornaForbid()
    {
        var serviceMock = new Mock<IMembershipService>();
        var controller = new MembershipsController(serviceMock.Object)
        {
            ControllerContext = new ControllerContext
            {
                HttpContext = new DefaultHttpContext
                {
                    User = new ClaimsPrincipal(new ClaimsIdentity(new[]
                    {
                        new Claim(ClaimTypes.NameIdentifier, "4"),
                        new Claim(ClaimTypes.Role, "MIEMBRO")
                    }, "TestAuth"))
                }
            }
        };

        var result = await controller.GetByUser(userId: 99);

        Assert.IsType<ForbidResult>(result);
        serviceMock.Verify(s => s.GetMembershipsByUserAsync(It.IsAny<int>()), Times.Never);
    }
}
