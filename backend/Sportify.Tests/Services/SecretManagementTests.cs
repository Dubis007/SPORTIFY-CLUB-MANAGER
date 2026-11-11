using Microsoft.Extensions.Configuration;
using Sportify.Infrastructure.Security;

namespace Sportify.Tests.Services;

public class SecretManagementTests
{
    private static string FindRepoRoot()
    {
        var dir = new DirectoryInfo(AppContext.BaseDirectory);
        while (dir is not null && !File.Exists(Path.Combine(dir.FullName, ".gitignore")))
        {
            dir = dir.Parent;
        }
        return dir?.FullName ?? throw new DirectoryNotFoundException("No se encontró la raíz del repositorio.");
    }

    [Fact]
    public void GitIgnore_BloqueaArchivosEnvYCadenasDeConexionLocales()
    {
        var root = FindRepoRoot();
        var gitignoreContent = File.ReadAllText(Path.Combine(root, ".gitignore"));

        Assert.Contains(".env", gitignoreContent);
        Assert.Contains("**/.env", gitignoreContent);
        Assert.Contains("appsettings.Local.json", gitignoreContent);
        Assert.Contains("**/appsettings.Secrets.json", gitignoreContent);
        Assert.Contains("**/secrets.json", gitignoreContent);
    }

    [Fact]
    public void AppSettingsVersionado_NoContieneContrasenaDeMySqlHardcodeada()
    {
        var root = FindRepoRoot();
        var appSettingsPath = Path.Combine(root, "backend", "Sportify.Api", "appsettings.json");
        var json = File.ReadAllText(appSettingsPath);

        Assert.False(SecretConfigurationValidator.ContainsHardcodedPassword(json));
    }

    [Fact]
    public void ResolveMySqlConnectionString_UsaConfiguracionYEnmascaraCredenciales()
    {
        var config = new ConfigurationBuilder()
            .AddInMemoryCollection(new Dictionary<string, string?>
            {
                ["ConnectionStrings:DefaultConnection"] = "Server=db.internal;Port=3306;Database=sportify_db;Uid=admin;Pwd=SuperSecretDbPass2026!;"
            })
            .Build();

        var resolved = SecretConfigurationValidator.ResolveMySqlConnectionString(config);
        var masked = SecretConfigurationValidator.MaskConnectionString(resolved);

        Assert.Contains("Server=db.internal", resolved);
        Assert.DoesNotContain("SuperSecretDbPass2026!", masked);
        Assert.Contains("Pwd=***REDACTED***", masked);
    }
}
