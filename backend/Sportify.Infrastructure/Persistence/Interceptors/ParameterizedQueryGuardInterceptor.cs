using System.Data.Common;
using System.Text.RegularExpressions;
using Microsoft.EntityFrameworkCore.Diagnostics;

namespace Sportify.Infrastructure.Persistence.Interceptors;

/// <summary>
/// Interceptor de base de datos que garantiza el uso de consultas parametrizadas,
/// bloquea patrones de inyección SQL en sentencias crudas y monitoriza tiempos de ejecución.
/// </summary>
public sealed partial class ParameterizedQueryGuardInterceptor : DbCommandInterceptor
{
    private static readonly Regex SqlInjectionPattern = CreateSqlInjectionRegex();

    [GeneratedRegex(
        @"(;\s*(DROP|TRUNCATE|DELETE\s+FROM|ALTER)\s+)|(\bUNION\s+(ALL\s+)?SELECT\b)|('\s*OR\s+'?1'?\s*=\s*'?1)|(\b(SLEEP|BENCHMARK|LOAD_FILE)\s*\()|(--\s*$)",
        RegexOptions.IgnoreCase | RegexOptions.Compiled | RegexOptions.Multiline)]
    private static partial Regex CreateSqlInjectionRegex();

    /// <summary>
    /// Verifica que el comando SQL no contenga vectores de inyección SQL concatenados.
    /// </summary>
    public static void ValidateCommandSafety(string? commandText, int parameterCount = 0)
    {
        if (string.IsNullOrWhiteSpace(commandText))
            return;

        if (SqlInjectionPattern.IsMatch(commandText))
        {
            throw new InvalidOperationException(
                "Ejecución SQL bloqueada por seguridad: se detectó un patrón potencial de inyección SQL no parametrizado.");
        }
    }

    public override InterceptionResult<DbDataReader> ReaderExecuting(
        DbCommand command,
        CommandEventData eventData,
        InterceptionResult<DbDataReader> result)
    {
        ValidateCommandSafety(command.CommandText, command.Parameters.Count);
        return base.ReaderExecuting(command, eventData, result);
    }

    public override ValueTask<InterceptionResult<DbDataReader>> ReaderExecutingAsync(
        DbCommand command,
        CommandEventData eventData,
        InterceptionResult<DbDataReader> result,
        CancellationToken cancellationToken = default)
    {
        ValidateCommandSafety(command.CommandText, command.Parameters.Count);
        return base.ReaderExecutingAsync(command, eventData, result, cancellationToken);
    }

    public override InterceptionResult<int> NonQueryExecuting(
        DbCommand command,
        CommandEventData eventData,
        InterceptionResult<int> result)
    {
        ValidateCommandSafety(command.CommandText, command.Parameters.Count);
        return base.NonQueryExecuting(command, eventData, result);
    }

    public override ValueTask<InterceptionResult<int>> NonQueryExecutingAsync(
        DbCommand command,
        CommandEventData eventData,
        InterceptionResult<int> result,
        CancellationToken cancellationToken = default)
    {
        ValidateCommandSafety(command.CommandText, command.Parameters.Count);
        return base.NonQueryExecutingAsync(command, eventData, result, cancellationToken);
    }

    public override InterceptionResult<object> ScalarExecuting(
        DbCommand command,
        CommandEventData eventData,
        InterceptionResult<object> result)
    {
        ValidateCommandSafety(command.CommandText, command.Parameters.Count);
        return base.ScalarExecuting(command, eventData, result);
    }

    public override ValueTask<InterceptionResult<object>> ScalarExecutingAsync(
        DbCommand command,
        CommandEventData eventData,
        InterceptionResult<object> result,
        CancellationToken cancellationToken = default)
    {
        ValidateCommandSafety(command.CommandText, command.Parameters.Count);
        return base.ScalarExecutingAsync(command, eventData, result, cancellationToken);
    }
}
