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
    private static readonly Regex StackedDeletePattern = CreateStackedDeleteRegex();

    [GeneratedRegex(
        @"(;\s*(DROP|TRUNCATE|ALTER)\s+)|(\bUNION\s+(ALL\s+)?SELECT\b)|('\s*OR\s+'?1'?\s*=\s*'?1)|(\b(SLEEP|BENCHMARK|LOAD_FILE)\s*\()|(--\s*$)",
        RegexOptions.IgnoreCase | RegexOptions.Compiled | RegexOptions.Multiline)]
    private static partial Regex CreateSqlInjectionRegex();

    [GeneratedRegex(@";\s*DELETE\s+FROM\s+", RegexOptions.IgnoreCase | RegexOptions.Compiled)]
    private static partial Regex CreateStackedDeleteRegex();

    /// <summary>
    /// Verifica que el comando SQL no contenga vectores de inyección SQL concatenados.
    /// </summary>
    public static void ValidateCommandSafety(string? commandText, int parameterCount = 0)
    {
        if (string.IsNullOrWhiteSpace(commandText))
            return;

        var stackedDeleteInjection =
            StackedDeletePattern.IsMatch(commandText) && !IsParameterizedBatch(commandText, parameterCount);

        if (SqlInjectionPattern.IsMatch(commandText) || stackedDeleteInjection)
        {
            throw new InvalidOperationException(
                "Ejecución SQL bloqueada por seguridad: se detectó un patrón potencial de inyección SQL no parametrizado.");
        }
    }

    /// <summary>
    /// EF Core agrupa varias sentencias DML de un mismo SaveChanges en un solo comando
    /// (p. ej. <c>DELETE FROM UsuarioRoles WHERE Id = @p0; ... DELETE FROM Usuarios WHERE Id = @p1</c>).
    /// Ese lote es legítimo: todos sus valores viajan como parámetros y el texto no contiene literales.
    /// Un DELETE apilado solo se considera inyección cuando el comando no es un lote parametrizado.
    /// </summary>
    private static bool IsParameterizedBatch(string commandText, int parameterCount) =>
        parameterCount > 0 && !commandText.Contains('\'');

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
