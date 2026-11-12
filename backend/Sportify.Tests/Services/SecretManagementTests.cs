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

    private static IConfiguration ConfigWith(string? jwtSecret, string? masterKey)
    {
        return new ConfigurationBuilder()
            .AddInMemoryCollection(new Dictionary<string, string?>
            {
                ["JwtSettings:Secret"] = jwtSecret,
                ["EncryptionSettings:MasterKey"] = masterKey
            })
            .Build();
    }

    private static IConfiguration LoadApiSettings(params string[] fileNames)
    {
        var apiFolder = Path.Combine(FindRepoRoot(), "backend", "Sportify.Api");
        var builder = new ConfigurationBuilder();
        foreach (var fileName in fileNames)
        {
            builder.AddJsonFile(Path.Combine(apiFolder, fileName), optional: false);
        }
        return builder.Build();
    }

    private const string SecretoPropio = "k9Qw2rT7yU1iO5pA8sD3fG6hJ0kL4zX9cV2bN7mQ1wE5";

    [Fact]
    public void AppSettingsVersionado_NoTraeLlavesJwtNiDeCifrado()
    {
        var config = LoadApiSettings("appsettings.json");

        Assert.True(string.IsNullOrEmpty(config["JwtSettings:Secret"]));
        Assert.True(string.IsNullOrEmpty(config["EncryptionSettings:MasterKey"]));
    }

    [Theory]
    [InlineData(true)]
    [InlineData(false)]
    public void ResolveSecretos_SinValorConfigurado_DetienenElArranqueEnCualquierEntorno(bool isDevelopment)
    {
        var config = ConfigWith(jwtSecret: "", masterKey: null);

        var jwt = Assert.Throws<InvalidOperationException>(
            () => SecretConfigurationValidator.ResolveJwtSecret(config, isDevelopment));
        var aes = Assert.Throws<InvalidOperationException>(
            () => SecretConfigurationValidator.ResolveEncryptionMasterKey(config, isDevelopment));

        Assert.Contains("JwtSettings__Secret", jwt.Message);
        Assert.Contains("EncryptionSettings__MasterKey", aes.Message);
    }

    [Fact]
    public void ResolveSecretos_SoloConElArchivoDeProduccion_NoArrancan()
    {
        // Lo que ve un despliegue que no definió sus variables: appsettings.json sin appsettings.Development.json
        var config = LoadApiSettings("appsettings.json");

        Assert.Throws<InvalidOperationException>(
            () => SecretConfigurationValidator.ResolveJwtSecret(config, isDevelopment: false));
        Assert.Throws<InvalidOperationException>(
            () => SecretConfigurationValidator.ResolveEncryptionMasterKey(config, isDevelopment: false));
    }

    [Fact]
    public void ResolveSecretos_EnDesarrollo_UsanLasLlavesLocalesDelRepositorio()
    {
        var config = LoadApiSettings("appsettings.json", "appsettings.Development.json");

        var jwt = SecretConfigurationValidator.ResolveJwtSecret(config, isDevelopment: true);
        var aes = SecretConfigurationValidator.ResolveEncryptionMasterKey(config, isDevelopment: true);

        Assert.True(jwt.Length >= SecretConfigurationValidator.MinimumSecretLength);
        Assert.True(aes.Length >= SecretConfigurationValidator.MinimumSecretLength);
        Assert.True(SecretConfigurationValidator.IsPubliclyKnownSecret(jwt));
        Assert.True(SecretConfigurationValidator.IsPubliclyKnownSecret(aes));
    }

    [Fact]
    public void ResolveSecretos_LlavesDeDesarrolloFueraDeDevelopment_SeRechazan()
    {
        // Alguien copió las llaves de desarrollo a un servidor: son públicas y permitirían falsificar sesiones
        var config = LoadApiSettings("appsettings.json", "appsettings.Development.json");

        var jwt = Assert.Throws<InvalidOperationException>(
            () => SecretConfigurationValidator.ResolveJwtSecret(config, isDevelopment: false));
        var aes = Assert.Throws<InvalidOperationException>(
            () => SecretConfigurationValidator.ResolveEncryptionMasterKey(config, isDevelopment: false));

        Assert.Contains("publicado en el repositorio", jwt.Message);
        Assert.Contains("publicado en el repositorio", aes.Message);
    }

    [Theory]
    [InlineData("cambia_este_secreto_de_al_menos_32_caracteres")]         // .env.example
    [InlineData("cambia_esta_llave_maestra_aes_256_de_32_bytes")]         // .env.example
    [InlineData("REEMPLAZAR_CON_SECRETO_JWT_DE_MINIMO_32_CARACTERES")]    // appsettings.Example.json
    [InlineData("REEMPLAZAR_CON_LLAVE_MAESTRA_AES_256_PARA_EL_CIFRADO")]
    public void ResolveSecretos_MarcadoresDeEjemploFueraDeDevelopment_SeRechazan(string placeholder)
    {
        var config = ConfigWith(placeholder, placeholder);

        Assert.Throws<InvalidOperationException>(
            () => SecretConfigurationValidator.ResolveJwtSecret(config, isDevelopment: false));
        Assert.Throws<InvalidOperationException>(
            () => SecretConfigurationValidator.ResolveEncryptionMasterKey(config, isDevelopment: false));
    }

    [Fact]
    public void ResolveSecretos_SecretoDemasiadoCorto_SeRechazaTambienEnDesarrollo()
    {
        var config = ConfigWith("solo-20-caracteres!!", "solo-20-caracteres!!");

        var ex = Assert.Throws<InvalidOperationException>(
            () => SecretConfigurationValidator.ResolveJwtSecret(config, isDevelopment: true));

        Assert.Contains("al menos 32", ex.Message);
    }

    [Fact]
    public void ResolveSecretos_ValoresPropios_SeAceptanEnProduccionSinEspaciosSobrantes()
    {
        var config = ConfigWith($"  {SecretoPropio}  ", SecretoPropio);

        Assert.Equal(SecretoPropio, SecretConfigurationValidator.ResolveJwtSecret(config, isDevelopment: false));
        Assert.Equal(SecretoPropio, SecretConfigurationValidator.ResolveEncryptionMasterKey(config, isDevelopment: false));
        Assert.False(SecretConfigurationValidator.IsPubliclyKnownSecret(SecretoPropio));
    }

    [Fact]
    public void CodigoFuente_NoContieneLlavesPorDefectoFueraDeLasDeDesarrollo()
    {
        var root = FindRepoRoot();
        string Read(params string[] parts) => File.ReadAllText(Path.Combine(new[] { root }.Concat(parts).ToArray()));

        // El secreto JWT solo puede aparecer donde se declara como llave de desarrollo o donde se rechaza
        Assert.DoesNotContain("A_VERY_SECRET_KEY", Read("backend", "Sportify.Api", "Program.cs"));
        Assert.DoesNotContain("A_VERY_SECRET_KEY", Read("backend", "Sportify.Infrastructure", "Authentication", "JwtTokenService.cs"));
        Assert.DoesNotContain("A_VERY_SECRET_KEY", Read("backend", "Sportify.Api", "appsettings.json"));
        Assert.DoesNotContain("SPORTIFY_AES256_DEFAULT", Read("backend", "Sportify.Api", "appsettings.json"));
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
