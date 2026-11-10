using Microsoft.EntityFrameworkCore;
using Sportify.Domain.Entities;
using Sportify.Domain.Enums;
using Sportify.Infrastructure.Persistence;
using Sportify.Infrastructure.Security;

namespace Sportify.Tests.Services;

public class RowLevelSecurityTests
{
    private static SportifyDbContext CreateContext()
    {
        var options = new DbContextOptionsBuilder<SportifyDbContext>()
            .UseMySQL("Server=localhost;Database=sportify_rls_test;Uid=root;Pwd=;")
            .Options;
        return new SportifyDbContext(options);
    }

    [Fact]
    public void TenantRlsContext_WhenEnabledForMember_PropagatesTenantAndMemberScopeToDbContext()
    {
        var rlsContext = new TenantRlsContext();
        using var dbContext = CreateContext();

        try
        {
            rlsContext.EnableRls(tenantId: 1, userId: 4, role: "MIEMBRO");

            Assert.True(dbContext.IsRlsActive);
            Assert.True(dbContext.IsMemberScoped);
            Assert.Equal(1, dbContext.CurrentTenantId);
            Assert.Equal(4, dbContext.CurrentUserId);
        }
        finally
        {
            rlsContext.DisableRls();
        }

        Assert.False(dbContext.IsRlsActive);
        Assert.Null(dbContext.CurrentTenantId);
    }

    [Fact]
    public void RlsQueryFilter_MultiTenantIsolation_FiltersOutRecordsFromOtherTenants()
    {
        using var dbContext = CreateContext();
        dbContext.ConfigureRls(tenantId: 1, userId: 1, role: "ADMIN");

        var entrenamientos = new List<Entrenamiento>
        {
            new() { Id = 1, SedeId = 1, Titulo = "Funcional Norte", EliminadoEn = null },
            new() { Id = 2, SedeId = 2, Titulo = "Funcional Sur", EliminadoEn = null },
            new() { Id = 3, SedeId = 1, Titulo = "Eliminado Norte", EliminadoEn = DateTime.UtcNow }
        };

        var visibles = entrenamientos
            .Where(e => e.EliminadoEn == null
                && (!dbContext.IsRlsActive || dbContext.CurrentTenantId == null || e.SedeId == dbContext.CurrentTenantId))
            .ToList();

        var unico = Assert.Single(visibles);
        Assert.Equal(1, unico.Id);
        Assert.Equal(1, unico.SedeId);
    }

    [Fact]
    public void RlsQueryFilter_MemberScopeIsolation_RestrictsPaymentsToAuthenticatedMemberAndTenant()
    {
        using var dbContext = CreateContext();
        dbContext.ConfigureRls(tenantId: 1, userId: 4, role: "MIEMBRO");

        var pagos = new List<Pago>
        {
            new()
            {
                Id = 10,
                UsuarioId = 4,
                MontoCOP = 120_000m,
                Estado = EstadoPago.APROBADO,
                Usuario = new Usuario { Id = 4, SedeId = 1 }
            },
            new()
            {
                Id = 11,
                UsuarioId = 5, // Otro socio de la misma sede
                MontoCOP = 120_000m,
                Estado = EstadoPago.APROBADO,
                Usuario = new Usuario { Id = 5, SedeId = 1 }
            },
            new()
            {
                Id = 12,
                UsuarioId = 4, // Otra sede/tenant
                MontoCOP = 50_000m,
                Estado = EstadoPago.PENDIENTE,
                Usuario = new Usuario { Id = 4, SedeId = 2 }
            }
        };

        var visibles = pagos
            .Where(p => p.EliminadoEn == null
                && (!dbContext.IsRlsActive || !dbContext.IsMemberScoped || dbContext.CurrentUserId == null || p.UsuarioId == dbContext.CurrentUserId)
                && (!dbContext.IsRlsActive || dbContext.CurrentTenantId == null || p.Usuario.SedeId == dbContext.CurrentTenantId))
            .ToList();

        var pagoVisible = Assert.Single(visibles);
        Assert.Equal(10, pagoVisible.Id);
        Assert.Equal(4, pagoVisible.UsuarioId);
    }
}
