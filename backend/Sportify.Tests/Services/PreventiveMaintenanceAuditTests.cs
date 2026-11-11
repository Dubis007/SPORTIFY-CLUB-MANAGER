namespace Sportify.Tests.Services;

public class PreventiveMaintenanceAuditTests
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
    public void FrontendPackageJson_NoContienePaquetesDeTercerosEnDesuso()
    {
        var root = FindRepoRoot();
        var pkgJson = File.ReadAllText(Path.Combine(root, "frontend", "package.json"));

        Assert.DoesNotContain("\"playwright\"", pkgJson);
        Assert.DoesNotContain("\"puppeteer-core\"", pkgJson);
        Assert.DoesNotContain("\"@typescript-eslint/eslint-plugin\"", pkgJson);
        Assert.DoesNotContain("\"@typescript-eslint/parser\"", pkgJson);
        Assert.DoesNotContain("\"@vitest/ui\"", pkgJson);
    }

    [Fact]
    public void ApiCsproj_EliminaPaquetesRedundantesYReduceSuperficieDeAtaque()
    {
        var root = FindRepoRoot();
        var csproj = File.ReadAllText(Path.Combine(root, "backend", "Sportify.Api", "Sportify.Api.csproj"));

        Assert.DoesNotContain("Include=\"Microsoft.EntityFrameworkCore\"", csproj);
        Assert.DoesNotContain("Include=\"Microsoft.EntityFrameworkCore.Relational\"", csproj);
    }

    [Fact]
    public void ScriptAuditoriaPreventiva_ExisteYContieneComandosDeEscaneo()
    {
        var root = FindRepoRoot();
        var scriptPath = Path.Combine(root, "scripts", "audit-dependencies.ps1");

        Assert.True(File.Exists(scriptPath));
        var scriptContent = File.ReadAllText(scriptPath);
        Assert.Contains("package --vulnerable", scriptContent);
        Assert.Contains("audit", scriptContent);
    }
}
