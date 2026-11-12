using System.Reflection;
using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Moq;
using Sportify.Api.Controllers;
using Sportify.Application.Interfaces;
using Sportify.Application.Security;
using Sportify.Domain.Entities;
using Sportify.Infrastructure.Persistence;
using Sportify.Infrastructure.Storage;

namespace Sportify.Tests.Services;

/// <summary>
/// Quién puede ver un comprobante de pago: el contador, el administrador y el deportista que lo envió.
/// Nadie más, y nunca sin sesión.
/// </summary>
public sealed class ReceiptAccessTests : IDisposable
{
    private const int PagoId = 10;
    private const int TitularId = 4;

    private readonly string _storageRoot;
    private readonly Mock<IPaymentRepository> _paymentRepository = new();
    private readonly SportifyDbContext _context;
    private readonly ReceiptService _service;

    public ReceiptAccessTests()
    {
        _storageRoot = Path.Combine(Path.GetTempPath(), "sportify-receipt-tests", Guid.NewGuid().ToString("N"));
        Directory.CreateDirectory(Path.Combine(_storageRoot, "receipts"));

        var configuration = new ConfigurationBuilder()
            .AddInMemoryCollection(new Dictionary<string, string?>
            {
                ["StorageSettings:ComprobantesPath"] = _storageRoot
            })
            .Build();

        // La lectura de comprobantes no consulta el contexto: no se abre ninguna conexión
        _context = new SportifyDbContext(new DbContextOptionsBuilder<SportifyDbContext>()
            .UseMySQL("Server=localhost;Database=sportify_receipts_test;Uid=root;Pwd=;")
            .Options);

        _service = new ReceiptService(_context, new FileStorageService(configuration), _paymentRepository.Object);
    }

    public void Dispose()
    {
        _context.Dispose();
        if (Directory.Exists(_storageRoot))
            Directory.Delete(_storageRoot, recursive: true);
    }

    private void GivenPagoConComprobante(string rutaArchivo, string contenido = "%PDF-1.7 comprobante", string tipoMimeDeclarado = "application/pdf")
    {
        var fullPath = Path.Combine(_storageRoot, rutaArchivo.Replace('/', Path.DirectorySeparatorChar));
        if (!rutaArchivo.Contains(".."))
            File.WriteAllText(fullPath, contenido);

        _paymentRepository.Setup(r => r.GetByIdAsync(PagoId)).ReturnsAsync(new Pago
        {
            Id = PagoId,
            UsuarioId = TitularId,
            Comprobante = new ComprobantePago
            {
                PagoId = PagoId,
                NombreArchivo = "soporte original.pdf",
                RutaArchivo = rutaArchivo,
                TipoMime = tipoMimeDeclarado
            }
        });
    }

    private static ReceiptsController BuildController(Mock<IReceiptService> receiptService, int userId, string role)
    {
        return new ReceiptsController(receiptService.Object)
        {
            ControllerContext = new ControllerContext
            {
                HttpContext = new DefaultHttpContext
                {
                    User = new ClaimsPrincipal(new ClaimsIdentity(new[]
                    {
                        new Claim(ClaimTypes.NameIdentifier, userId.ToString()),
                        new Claim(ClaimTypes.Role, role)
                    }, "TestAuth"))
                }
            }
        };
    }

    [Fact]
    public async Task GetReceiptAsync_DeportistaTitular_RecibeSuComprobante()
    {
        GivenPagoConComprobante("receipts/abc.pdf");

        var (contenido, tipoMime, nombreArchivo) = await _service.GetReceiptAsync(PagoId, restrictToUserId: TitularId);

        Assert.StartsWith("%PDF", System.Text.Encoding.UTF8.GetString(contenido));
        Assert.Equal("application/pdf", tipoMime);
        Assert.Equal("Comprobante_Pago_10.pdf", nombreArchivo);
    }

    [Fact]
    public async Task GetReceiptAsync_OtroDeportista_RespondeComoSiNoExistiera()
    {
        GivenPagoConComprobante("receipts/abc.pdf");

        var ex = await Assert.ThrowsAsync<KeyNotFoundException>(
            () => _service.GetReceiptAsync(PagoId, restrictToUserId: 99));

        Assert.Contains("No existe comprobante", ex.Message);
    }

    [Fact]
    public async Task GetReceiptAsync_PersonalContableSinRestriccion_RecibeElComprobanteDeCualquierPago()
    {
        GivenPagoConComprobante("receipts/foto.png", contenido: "imagen");

        var (_, tipoMime, nombreArchivo) = await _service.GetReceiptAsync(PagoId);

        Assert.Equal("image/png", tipoMime);
        Assert.Equal("Comprobante_Pago_10.png", nombreArchivo);
    }

    [Fact]
    public async Task GetReceiptAsync_PagoSinComprobante_LanzaKeyNotFound()
    {
        _paymentRepository.Setup(r => r.GetByIdAsync(PagoId))
            .ReturnsAsync(new Pago { Id = PagoId, UsuarioId = TitularId });

        await Assert.ThrowsAsync<KeyNotFoundException>(() => _service.GetReceiptAsync(PagoId));
    }

    [Fact]
    public async Task GetReceiptAsync_ArchivoFisicoAusente_LanzaKeyNotFoundEnLugarDeError500()
    {
        GivenPagoConComprobante("receipts/abc.pdf");
        File.Delete(Path.Combine(_storageRoot, "receipts", "abc.pdf"));

        var ex = await Assert.ThrowsAsync<KeyNotFoundException>(() => _service.GetReceiptAsync(PagoId));

        Assert.Contains("no se encontró", ex.Message);
    }

    [Fact]
    public async Task GetReceiptAsync_TipoMimeDeclaradoPorElCliente_NoSeUsaAlEntregarElArchivo()
    {
        // Un cliente pudo declarar text/html al subir: lo que se sirve depende solo de la extensión validada
        GivenPagoConComprobante("receipts/abc.pdf", contenido: "<script>alert(1)</script>", tipoMimeDeclarado: "text/html");

        var (_, tipoMime, _) = await _service.GetReceiptAsync(PagoId);

        Assert.Equal("application/pdf", tipoMime);
    }

    [Fact]
    public async Task GetReceiptAsync_RutaQueEscapaDeLaCarpetaDeComprobantes_NoEntregaElArchivo()
    {
        File.WriteAllText(Path.Combine(Path.GetDirectoryName(_storageRoot)!, "secreto.pdf"), "fuera de la carpeta");
        try
        {
            GivenPagoConComprobante("../secreto.pdf");

            await Assert.ThrowsAsync<InvalidOperationException>(() => _service.GetReceiptAsync(PagoId));
        }
        finally
        {
            File.Delete(Path.Combine(Path.GetDirectoryName(_storageRoot)!, "secreto.pdf"));
        }
    }

    [Theory]
    [InlineData("receipts/a.pdf", "application/pdf")]
    [InlineData("receipts/a.PNG", "image/png")]
    [InlineData("receipts/a.jpg", "image/jpeg")]
    [InlineData("receipts/a.jpeg", "image/jpeg")]
    [InlineData("receipts/a.html", "application/octet-stream")]
    [InlineData("receipts/sin_extension", "application/octet-stream")]
    [InlineData(null, "application/octet-stream")]
    public void ResolveContentType_SoloReconoceLosFormatosPermitidos(string? ruta, string esperado)
    {
        Assert.Equal(esperado, FileUploadValidator.ResolveContentType(ruta));
    }

    [Fact]
    public void Preview_AdmiteAlContadorAlAdministradorYAlDeportista()
    {
        var attr = typeof(ReceiptsController)
            .GetMethod(nameof(ReceiptsController.Preview))!
            .GetCustomAttribute<AuthorizeAttribute>();

        Assert.NotNull(attr);
        Assert.Equal(
            new[] { "ADMIN", "CONTADOR", "MIEMBRO" },
            attr.Roles!.Split(',').Select(r => r.Trim()).OrderBy(r => r).ToArray());
    }

    [Fact]
    public async Task Preview_Deportista_ConsultaRestringidoAlTitularDelToken()
    {
        var receiptService = new Mock<IReceiptService>();
        receiptService
            .Setup(s => s.GetReceiptAsync(PagoId, TitularId))
            .ReturnsAsync((new byte[] { 1, 2, 3 }, "application/pdf", "Comprobante_Pago_10.pdf"));

        var controller = BuildController(receiptService, userId: TitularId, role: "MIEMBRO");
        var result = await controller.Preview(PagoId);

        var file = Assert.IsType<FileContentResult>(result);
        Assert.Equal("application/pdf", file.ContentType);
        Assert.Equal("no-store", controller.Response.Headers.CacheControl.ToString());
        receiptService.Verify(s => s.GetReceiptAsync(PagoId, TitularId), Times.Once);
    }

    [Theory]
    [InlineData("CONTADOR")]
    [InlineData("ADMIN")]
    public async Task Preview_PersonalContable_ConsultaSinRestriccionDeTitular(string role)
    {
        var receiptService = new Mock<IReceiptService>();
        receiptService
            .Setup(s => s.GetReceiptAsync(PagoId, null))
            .ReturnsAsync((new byte[] { 1 }, "image/png", "Comprobante_Pago_10.png"));

        var controller = BuildController(receiptService, userId: 2, role: role);
        var result = await controller.Preview(PagoId);

        Assert.IsType<FileContentResult>(result);
        receiptService.Verify(s => s.GetReceiptAsync(PagoId, null), Times.Once);
    }

    [Fact]
    public async Task Preview_RolQueNoEsPersonalContable_NuncaConsultaSinRestriccion()
    {
        // Aunque un rol distinto llegara al método, solo vería comprobantes de sus propios pagos
        var receiptService = new Mock<IReceiptService>();
        receiptService
            .Setup(s => s.GetReceiptAsync(PagoId, 3))
            .ThrowsAsync(new KeyNotFoundException());

        var controller = BuildController(receiptService, userId: 3, role: "ENTRENADOR");

        await Assert.ThrowsAsync<KeyNotFoundException>(() => controller.Preview(PagoId));
        receiptService.Verify(s => s.GetReceiptAsync(PagoId, null), Times.Never);
    }

    [Fact]
    public void LosComprobantes_NoSeGuardanEnWwwrootNiSeSirvenComoArchivosEstaticos()
    {
        var root = FindRepoRoot();
        var appSettings = new ConfigurationBuilder()
            .AddJsonFile(Path.Combine(root, "backend", "Sportify.Api", "appsettings.json"))
            .Build();
        var program = File.ReadAllText(Path.Combine(root, "backend", "Sportify.Api", "Program.cs"));

        Assert.DoesNotContain("wwwroot", FileStorageService.ResolveBasePath(appSettings), StringComparison.OrdinalIgnoreCase);
        Assert.DoesNotContain("wwwroot", FileStorageService.DefaultComprobantesPath, StringComparison.OrdinalIgnoreCase);
        Assert.DoesNotContain("app.UseStaticFiles", program);
    }

    private static string FindRepoRoot()
    {
        var dir = new DirectoryInfo(AppContext.BaseDirectory);
        while (dir is not null && !File.Exists(Path.Combine(dir.FullName, ".gitignore")))
        {
            dir = dir.Parent;
        }
        return dir?.FullName ?? throw new DirectoryNotFoundException("No se encontró la raíz del repositorio.");
    }
}
