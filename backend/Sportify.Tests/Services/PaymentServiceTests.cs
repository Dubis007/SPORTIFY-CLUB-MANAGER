using Moq;
using Sportify.Application.DTOs.Payments;
using Sportify.Application.Interfaces;
using Sportify.Application.Services;
using Sportify.Domain.Entities;
using Sportify.Domain.Enums;

namespace Sportify.Tests.Services;

/// <summary>Pruebas unitarias de <see cref="PaymentService"/> con el repositorio simulado.</summary>
public class PaymentServiceTests
{
    private readonly Mock<IPaymentRepository> _repositoryMock = new();
    private readonly PaymentService _service;

    public PaymentServiceTests()
    {
        _service = new PaymentService(_repositoryMock.Object);
    }

    [Fact]
    public async Task CreateAsync_CreaPagoPendiente_YLlamaAlRepositorio()
    {
        var dto = new CreatePaymentDto { MembresiaId = 5, MontoCOP = 80_000m };
        _repositoryMock
            .Setup(r => r.CreateAsync(It.IsAny<Pago>()))
            .ReturnsAsync((Pago p) => p);

        var result = await _service.CreateAsync(usuarioId: 7, dto);

        Assert.Equal("PENDIENTE", result.Estado);
        Assert.Equal(7, result.UsuarioId);
        Assert.Equal(80_000m, result.MontoCOP);
        _repositoryMock.Verify(r => r.CreateAsync(It.Is<Pago>(p =>
            p.UsuarioId == 7 &&
            p.MembresiaId == 5 &&
            p.MontoCOP == 80_000m &&
            p.Estado == EstadoPago.PENDIENTE)), Times.Once);
    }

    [Fact]
    public async Task ApproveAsync_PagoPendienteConMembresia_ApruebaYActivaMembresia()
    {
        var membresia = new Membresia { Id = 3, Estado = EstadoMembresia.PENDIENTE };
        var pago = new Pago
        {
            Id = 10,
            UsuarioId = 7,
            MembresiaId = membresia.Id,
            Membresia = membresia,
            MontoCOP = 80_000m,
            Estado = EstadoPago.PENDIENTE
        };
        _repositoryMock.Setup(r => r.GetByIdAsync(10)).ReturnsAsync(pago);

        var result = await _service.ApproveAsync(pagoId: 10, aprobadorId: 1);

        Assert.Equal("APROBADO", result.Estado);
        Assert.NotNull(result.FechaAprobacion);
        Assert.Equal(1, pago.AprobadoPorId);
        Assert.Equal(EstadoMembresia.ACTIVA, membresia.Estado);
        _repositoryMock.Verify(r => r.UpdateAsync(pago), Times.Once);
    }

    [Fact]
    public async Task RejectAsync_ComentarioMenorA10Caracteres_LanzaInvalidOperation()
    {
        var dto = new RejectPaymentDto { ComentarioRechazo = "Corto" };

        await Assert.ThrowsAsync<InvalidOperationException>(
            () => _service.RejectAsync(pagoId: 10, aprobadorId: 1, dto));

        _repositoryMock.Verify(r => r.GetByIdAsync(It.IsAny<int>()), Times.Never);
        _repositoryMock.Verify(r => r.UpdateAsync(It.IsAny<Pago>()), Times.Never);
    }
}
