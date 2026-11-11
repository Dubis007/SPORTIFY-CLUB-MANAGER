using System.Security.Claims;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Moq;
using Sportify.Api.Controllers;
using Sportify.Application.Interfaces;
using Sportify.Application.Security;

namespace Sportify.Tests.Services;

public class FileUploadValidationTests
{
    private static IFormFile CreateMockFormFile(string fileName, long lengthBytes, string contentType = "image/jpeg")
    {
        var fileMock = new Mock<IFormFile>();
        fileMock.Setup(f => f.FileName).Returns(fileName);
        fileMock.Setup(f => f.Length).Returns(lengthBytes);
        fileMock.Setup(f => f.ContentType).Returns(contentType);
        return fileMock.Object;
    }

    [Theory]
    [InlineData(512 * 1024)]
    [InlineData(3 * 1024 * 1024)]
    [InlineData(5 * 1024 * 1024)]
    public void Validate_ArchivoJpgValidoDeHasta5MB_RetornaTrue(long lengthBytes)
    {
        var file = CreateMockFormFile("comprobante_pago.jpg", lengthBytes, "image/jpeg");

        var (isValid, error) = FileUploadValidator.Validate(file);

        Assert.True(isValid);
        Assert.Equal(string.Empty, error);
    }

    [Fact]
    public void Validate_ArchivoMayorA5MB_RetornaFalseYMensajeDeLimite()
    {
        var file = CreateMockFormFile("comprobante_pesado.jpg", (5 * 1024 * 1024) + 1024, "image/jpeg");

        var (isValid, error) = FileUploadValidator.Validate(file);

        Assert.False(isValid);
        Assert.Contains("5 MB", error);
    }

    [Fact]
    public void LimiteDePeticion_DejaMargenSobreElArchivoParaResponder400Legible()
    {
        Assert.Equal(5 * 1024 * 1024, FileUploadValidator.DefaultMaxFileSizeBytes);
        Assert.True(FileUploadValidator.MaxRequestBodyBytes > FileUploadValidator.DefaultMaxFileSizeBytes);
    }

    [Theory]
    [InlineData("malware.exe", "application/x-msdownload")]
    [InlineData("script.php.jpg", "image/jpeg")]
    [InlineData("../../etc/passwd.jpg", "image/jpeg")]
    [InlineData("vector.svg", "image/svg+xml")]
    public void Validate_ExtensionesPeligrosasODobleExtension_RetornaFalse(string fileName, string contentType)
    {
        var file = CreateMockFormFile(fileName, 1024, contentType);

        var (isValid, _) = FileUploadValidator.Validate(file);

        Assert.False(isValid);
    }

    [Fact]
    public async Task ReceiptsController_Upload_ArchivoExcede5MB_RechazaCon400AntesDeGuardar()
    {
        var receiptServiceMock = new Mock<IReceiptService>();
        var controller = new ReceiptsController(receiptServiceMock.Object)
        {
            ControllerContext = new ControllerContext
            {
                HttpContext = new DefaultHttpContext
                {
                    User = new ClaimsPrincipal(new ClaimsIdentity(new[]
                    {
                        new Claim(ClaimTypes.NameIdentifier, "4"),
                        new Claim(ClaimTypes.Role, "MIEMBRO")
                    }, "TestAuth"))
                }
            }
        };

        var oversizedFile = CreateMockFormFile("soporte.jpg", 6 * 1024 * 1024, "image/jpeg");

        var result = await controller.Upload(pagoId: 1, archivo: oversizedFile);

        Assert.IsType<BadRequestObjectResult>(result);
        receiptServiceMock.Verify(
            s => s.SaveReceiptAsync(It.IsAny<int>(), It.IsAny<IFormFile>(), It.IsAny<int?>()),
            Times.Never);
    }
}
