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
