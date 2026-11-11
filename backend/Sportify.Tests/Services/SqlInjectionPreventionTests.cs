using Sportify.Application.DTOs.Common;
using Sportify.Infrastructure.Persistence.Interceptors;

namespace Sportify.Tests.Services;

public class SqlInjectionPreventionTests
{
    [Theory]
    [InlineData("SELECT * FROM Usuarios WHERE Correo = 'admin@sportify.com' OR '1'='1'")]
    [InlineData("SELECT Id FROM Pagos WHERE Id = 1; DROP TABLE Usuarios;")]
    [InlineData("SELECT Id, Nombre FROM Sedes UNION SELECT Id, ContrasenaHash FROM Usuarios")]
    [InlineData("SELECT * FROM Usuarios WHERE Id = 1 AND SLEEP(5)")]
    [InlineData("SELECT * FROM Usuarios WHERE Correo = 'test' --")]
    public void ValidateCommandSafety_MaliciousConcatenatedSql_ThrowsInvalidOperationException(string maliciousSql)
    {
        Assert.Throws<InvalidOperationException>(() =>
            ParameterizedQueryGuardInterceptor.ValidateCommandSafety(maliciousSql));
    }

    [Theory]
    [InlineData("SELECT `u`.`Id`, `u`.`Correo`, `u`.`Nombre` FROM `Usuarios` AS `u` WHERE `u`.`Correo` = @__normalizedEmail_0 LIMIT 1")]
    [InlineData("INSERT INTO `Pagos` (`UsuarioId`, `MembresiaId`, `MontoCOP`, `Estado`) VALUES (@p0, @p1, @p2, @p3)")]
    [InlineData("UPDATE `Usuarios` SET `ContrasenaHash` = @p0 WHERE `Id` = @p1")]
    public void ValidateCommandSafety_ParameterizedEfCoreQuery_PassesSafely(string parameterizedSql)
    {
        var exception = Record.Exception(() =>
            ParameterizedQueryGuardInterceptor.ValidateCommandSafety(parameterizedSql, parameterCount: 2));

        Assert.Null(exception);
    }

    [Fact]
    public void ValidateCommandSafety_LoteEfCoreParametrizadoConVariosDelete_PasaSinBloqueo()
    {
        // Lote real que genera EF Core al eliminar un usuario junto con sus roles en un mismo SaveChanges.
        const string efBatch =
            "DELETE FROM `UsuarioRoles`\nWHERE `Id` = @p0;\nSELECT ROW_COUNT();\n\nDELETE FROM `Usuarios`\nWHERE `Id` = @p1;\nSELECT ROW_COUNT();";

        var exception = Record.Exception(() =>
            ParameterizedQueryGuardInterceptor.ValidateCommandSafety(efBatch, parameterCount: 2));

        Assert.Null(exception);
    }

    [Theory]
    [InlineData("SELECT Id FROM Pagos WHERE Id = 1; DELETE FROM Usuarios", 0)]
    [InlineData("SELECT * FROM Usuarios WHERE Nombre = 'x'; DELETE FROM Usuarios WHERE Id = @p0", 1)]
    public void ValidateCommandSafety_DeleteApiladoNoParametrizado_SigueBloqueado(string maliciousSql, int parameterCount)
    {
        Assert.Throws<InvalidOperationException>(() =>
            ParameterizedQueryGuardInterceptor.ValidateCommandSafety(maliciousSql, parameterCount));
    }

    [Fact]
    public void PaginationParams_MaliciousNegativeOrHugeValues_ClampsToSafeBounds()
    {
        var pagination = new PaginationParams
        {
            Page = -50,
            PageSize = 999999
        };

        Assert.Equal(1, pagination.Page);
        Assert.Equal(PaginationParams.MaxPageSize, pagination.PageSize);
        Assert.Equal(0, pagination.Skip);
    }
}
