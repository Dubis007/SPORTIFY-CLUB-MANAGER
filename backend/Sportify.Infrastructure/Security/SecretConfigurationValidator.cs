using System.Text.RegularExpressions;
using Microsoft.Extensions.Configuration;

namespace Sportify.Infrastructure.Security;

/// <summary>
/// Resuelve de forma segura la cadena de conexión a MySQL y secretos desde variables de entorno o archivos locales no versionados,
/// evitando almacenar credenciales sensibles en el control de versiones.
/// </summary>
public static partial class SecretConfigurationValidator
{
    private const string LocalDevFallbackConnection = "Server=localhost;Port=3306;Database=sportify_db;Uid=root;Pwd=;";

    [GeneratedRegex(@"(?:Pwd|Password)\s*=\s*([^;]+)", RegexOptions.IgnoreCase | RegexOptions.Compiled)]
    private static partial Regex PasswordSegmentPattern();

    public static string ResolveMySqlConnectionString(IConfiguration configuration)
    {
        var envConn = Environment.GetEnvironmentVariable("SPORTIFY_MYSQL_CONNECTION")
                   ?? Environment.GetEnvironmentVariable("ConnectionStrings__DefaultConnection");

        if (!string.IsNullOrWhiteSpace(envConn))
            return envConn.Trim();

        var configured = configuration.GetConnectionString("DefaultConnection");
        if (!string.IsNullOrWhiteSpace(configured) && !configured.Contains("REEMPLAZAR", StringComparison.OrdinalIgnoreCase))
            return configured.Trim();

        return LocalDevFallbackConnection;
    }

    /// <summary>Longitud mínima de un secreto: 32 caracteres, lo que exige HMAC-SHA256 para firmar los JWT.</summary>
    public const int MinimumSecretLength = 32;

    public const string JwtSecretKey = "JwtSettings:Secret";
    public const string EncryptionMasterKeyKey = "EncryptionSettings:MasterKey";

    /// <summary>
    /// Valores que están o estuvieron escritos en el repositorio. Sirven para trabajar en local
    /// (appsettings.Development.json), pero cualquiera los conoce: fuera de Development se rechazan.
    /// </summary>
    private static readonly HashSet<string> PubliclyKnownSecrets = new(StringComparer.Ordinal)
    {
        "A_VERY_SECRET_KEY_THAT_NEEDS_TO_BE_AT_LEAST_32_CHARACTERS_LONG!",
        "SPORTIFY_AES256_DEFAULT_DATA_PROTECTION_KEY_2026!"
    };

    /// <summary>Secreto con el que se firman los JWT y los tokens anti-CSRF.</summary>
    public static string ResolveJwtSecret(IConfiguration configuration, bool isDevelopment)
        => ResolveRequiredSecret(configuration, JwtSecretKey, isDevelopment);

    /// <summary>Llave maestra del cifrado AES-256-GCM de los datos sensibles en reposo.</summary>
    public static string ResolveEncryptionMasterKey(IConfiguration configuration, bool isDevelopment)
        => ResolveRequiredSecret(configuration, EncryptionMasterKeyKey, isDevelopment);

    /// <summary>Indica si el valor es un marcador de ejemplo o una llave publicada en el repositorio.</summary>
    public static bool IsPubliclyKnownSecret(string? value)
    {
        if (string.IsNullOrWhiteSpace(value))
            return false;

        var candidate = value.Trim();
        return PubliclyKnownSecrets.Contains(candidate)
            || candidate.Contains("REEMPLAZAR", StringComparison.OrdinalIgnoreCase)
            || candidate.StartsWith("cambia_", StringComparison.OrdinalIgnoreCase);
    }

    /// <summary>
    /// Devuelve el secreto configurado o detiene el arranque con un mensaje que dice cómo corregirlo.
    /// No existe un valor por defecto en el código: una instalación sin llaves propias no llega a atender peticiones.
    /// </summary>
    private static string ResolveRequiredSecret(IConfiguration configuration, string key, bool isDevelopment)
    {
        var environmentVariable = key.Replace(":", "__");
        var value = configuration[key]?.Trim();

        if (string.IsNullOrEmpty(value))
        {
            throw new InvalidOperationException(
                $"Falta el secreto '{key}'. Defínelo con la variable de entorno {environmentVariable} " +
                "o en appsettings.Local.json (no se versiona). En local, ejecuta la API en el entorno Development " +
                "(dotnet run), que usa las llaves de desarrollo de appsettings.Development.json.");
        }

        if (value.Length < MinimumSecretLength)
        {
            throw new InvalidOperationException(
                $"El secreto '{key}' debe tener al menos {MinimumSecretLength} caracteres (tiene {value.Length}).");
        }

        if (!isDevelopment && IsPubliclyKnownSecret(value))
        {
            throw new InvalidOperationException(
                $"El secreto '{key}' usa un valor de ejemplo o de desarrollo que está publicado en el repositorio. " +
                $"Genera uno propio (por ejemplo: openssl rand -base64 48) y defínelo con la variable de entorno {environmentVariable}.");
        }

        return value;
    }

    public static bool ContainsHardcodedPassword(string? connectionString)
    {
        if (string.IsNullOrWhiteSpace(connectionString))
            return false;

        var match = PasswordSegmentPattern().Match(connectionString);
        if (!match.Success)
            return false;

        var pwdValue = match.Groups[1].Value.Trim();
        if (string.IsNullOrEmpty(pwdValue))
            return false;

        if (pwdValue.StartsWith("${") || pwdValue.Contains("REEMPLAZAR", StringComparison.OrdinalIgnoreCase))
            return false;

        return true;
    }

    public static string MaskConnectionString(string connectionString)
    {
        if (string.IsNullOrWhiteSpace(connectionString))
            return string.Empty;

        return PasswordSegmentPattern().Replace(connectionString, "Pwd=***REDACTED***");
    }
}
