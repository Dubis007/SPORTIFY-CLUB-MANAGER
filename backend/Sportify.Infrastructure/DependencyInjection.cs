using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Sportify.Application.Interfaces;
using Sportify.Infrastructure.Authentication;
using Sportify.Infrastructure.Persistence;
using Sportify.Infrastructure.Persistence.Interceptors;
using Sportify.Infrastructure.Reports;
using Sportify.Infrastructure.Repositories;
using Sportify.Infrastructure.Security;
using Sportify.Infrastructure.Storage;

namespace Sportify.Infrastructure;

public static class DependencyInjection
{
    /// <param name="encryptionMasterKey">
    /// Llave maestra AES ya validada por <see cref="SecretConfigurationValidator.ResolveEncryptionMasterKey"/>.
    /// Es obligatoria para que ningún anfitrión cifre datos con una llave por defecto.
    /// </param>
    public static IServiceCollection AddInfrastructure(
        this IServiceCollection services,
        IConfiguration configuration,
        string encryptionMasterKey)
    {
        if (string.IsNullOrWhiteSpace(encryptionMasterKey))
            throw new ArgumentException("La llave maestra de cifrado es obligatoria.", nameof(encryptionMasterKey));

        // Los conversores de EF cifran en reposo con esta llave (Direccion, Telefono, Observaciones, ComentarioRechazo)
        AesSensitiveDataProtector.ConfigureMasterKey(encryptionMasterKey);

        var connectionString = SecretConfigurationValidator.ResolveMySqlConnectionString(configuration);
        services.AddDbContextPool<SportifyDbContext>(options =>
            options.UseMySQL(connectionString)
                   .AddInterceptors(new ParameterizedQueryGuardInterceptor())
                   .ConfigureWarnings(w => w.Ignore(Microsoft.EntityFrameworkCore.Diagnostics.RelationalEventId.PendingModelChangesWarning)));

        // Repositories
        services.AddScoped<IUserRepository, UserRepository>();
        services.AddScoped<IPaymentRepository, PaymentRepository>();
        services.AddScoped<IEvaluationRepository, EvaluationRepository>();
        services.AddScoped<ITrainingRepository, TrainingRepository>();
        services.AddScoped<ICompetitionRepository, CompetitionRepository>();
        services.AddScoped<IRegistrationRepository, RegistrationRepository>();
        services.AddScoped<ILocationRepository, LocationRepository>();
        services.AddScoped<IMembershipPlanRepository, MembershipPlanRepository>();
        services.AddScoped<IMemberProfileRepository, MemberProfileRepository>();
        services.AddScoped<IMembershipRepository, MembershipRepository>();
        services.AddScoped<IReportRepository, ReportRepository>();
        services.AddScoped<IDashboardRepository, DashboardRepository>();

        // Infrastructure Adapters & Services
        services.AddSingleton<ISensitiveDataProtector, AesSensitiveDataProtector>();
        services.AddScoped<ITenantRlsContext, TenantRlsContext>();
        services.AddScoped<IJwtTokenService, JwtTokenService>();
        services.AddScoped<IPdfReportRenderer, QuestPdfReportRenderer>();
        services.AddScoped<IFileStorageService, FileStorageService>();
        services.AddScoped<IReceiptService, ReceiptService>();

        return services;
    }
}
