using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Sportify.Application.Interfaces;
using Sportify.Infrastructure.Authentication;
using Sportify.Infrastructure.Persistence;
using Sportify.Infrastructure.Reports;
using Sportify.Infrastructure.Repositories;
using Sportify.Infrastructure.Storage;

namespace Sportify.Infrastructure;

public static class DependencyInjection
{
    public static IServiceCollection AddInfrastructure(this IServiceCollection services, IConfiguration configuration)
    {
        services.AddDbContext<SportifyDbContext>(options =>
            options.UseMySQL(configuration.GetConnectionString("DefaultConnection")!));

        // Repositories
        services.AddScoped<IUserRepository, UserRepository>();
        services.AddScoped<IPaymentRepository, PaymentRepository>();

        // Services
        services.AddScoped<IJwtTokenService, JwtTokenService>();
        services.AddScoped<IReportService, ReportService>();
        services.AddScoped<IFileStorageService, FileStorageService>();
        services.AddScoped<IMembershipService, Sportify.Infrastructure.Services.MembershipService>();

        return services;
    }
}
