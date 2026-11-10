using System.Reflection;
using Moq;
using Sportify.Application.DTOs.MemberProfile;
using Sportify.Application.DTOs.Payments;
using Sportify.Application.DTOs.Users;
using Sportify.Application.Interfaces;
using Sportify.Application.Services;
using Sportify.Domain.Entities;

namespace Sportify.Tests.Services;

public class ApiDtoContractTests
{
    [Fact]
    public void UserAndProfileDtos_DoNotContainSensitiveDatabaseFields()
    {
        var userDtoProps = typeof(UserDto).GetProperties(BindingFlags.Public | BindingFlags.Instance)
            .Select(p => p.Name)
            .ToHashSet(StringComparer.OrdinalIgnoreCase);

        var profileDtoProps = typeof(MemberProfileDto).GetProperties(BindingFlags.Public | BindingFlags.Instance)
            .Select(p => p.Name)
            .ToHashSet(StringComparer.OrdinalIgnoreCase);

        Assert.DoesNotContain("ContrasenaHash", userDtoProps);
        Assert.DoesNotContain("PasswordResetTokens", userDtoProps);
        Assert.DoesNotContain("ContrasenaHash", profileDtoProps);
        Assert.DoesNotContain("SolicitaCambioClave", profileDtoProps);
    }

    [Fact]
    public async Task PaymentService_GetOptionsAsync_ReturnsStrictlyMinimalDtoWithoutCredentials()
    {
        var mockRepo = new Mock<IPaymentRepository>();
        mockRepo.Setup(r => r.GetMembersForOptionsAsync()).ReturnsAsync(new List<Usuario>
        {
            new()
            {
                Id = 4,
                Nombre = "Mario",
                Apellido = "Miembro",
                Correo = "miembro@sportify.com",
                ContrasenaHash = "$2a$11$secret_hash_should_never_leak"
            }
        });
        mockRepo.Setup(r => r.GetMembershipsForOptionsAsync()).ReturnsAsync(new List<Membresia>());

        var service = new PaymentService(mockRepo.Object, new Mock<IFileStorageService>().Object);
        var options = await service.GetOptionsAsync();

        Assert.IsType<PaymentOptionsDto>(options);
        var memberOption = Assert.Single(options.Members);
        Assert.Equal(4, memberOption.Id);
        Assert.Equal("Mario", memberOption.Nombre);

        var optionProps = typeof(PaymentMemberOptionDto).GetProperties().Select(p => p.Name).ToList();
        Assert.DoesNotContain("ContrasenaHash", optionProps);
        Assert.DoesNotContain("Correo", optionProps);
    }

    [Fact]
    public void ApplicationServiceInterfaces_NeverReturnRawObjectsOrDomainEntities()
    {
        var serviceInterfaces = new[]
        {
            typeof(IAuthService),
            typeof(IUserService),
            typeof(IPaymentService),
            typeof(IRegistrationService),
            typeof(IEvaluationService),
            typeof(ITrainingService),
            typeof(ICompetitionService),
            typeof(IMembershipService),
            typeof(IMembershipPlanService),
            typeof(ILocationService),
            typeof(IMemberProfileService)
        };

        foreach (var iface in serviceInterfaces)
        {
            foreach (var method in iface.GetMethods())
            {
                var returnType = method.ReturnType;
                if (returnType.IsGenericType && returnType.GetGenericTypeDefinition() == typeof(Task<>))
                {
                    var innerType = returnType.GetGenericArguments()[0];
                    Assert.NotEqual(typeof(object), innerType);
                    Assert.NotEqual(typeof(IEnumerable<object>), innerType);
                    Assert.NotEqual(typeof(Usuario), innerType);
                    Assert.NotEqual(typeof(Pago), innerType);
                }
            }
        }
    }
}
