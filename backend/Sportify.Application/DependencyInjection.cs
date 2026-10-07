using Microsoft.Extensions.DependencyInjection;
using Sportify.Application.Interfaces;
using Sportify.Application.Services;

namespace Sportify.Application;

public static class DependencyInjection
{
    public static IServiceCollection AddApplication(this IServiceCollection services)
    {
        services.AddScoped<IAuthService, AuthService>();
        services.AddScoped<IPaymentService, PaymentService>();
        services.AddScoped<IUserService, UserService>();
        services.AddScoped<IEvaluationService, EvaluationService>();
        services.AddScoped<ITrainingService, TrainingService>();
        services.AddScoped<ICompetitionService, CompetitionService>();
        services.AddScoped<IRegistrationService, RegistrationService>();
        services.AddScoped<ILocationService, LocationService>();
        services.AddScoped<IMembershipPlanService, MembershipPlanService>();
        services.AddScoped<IMemberProfileService, MemberProfileService>();
        
        return services;
    }
}
