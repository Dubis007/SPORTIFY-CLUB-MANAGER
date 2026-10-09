using Sportify.Application.DTOs.Common;
using Sportify.Application.DTOs.Payments;
using Sportify.Application.Interfaces;
using Sportify.Domain.Entities;
using Sportify.Domain.Enums;

namespace Sportify.Application.Services;

/// <summary>Implementación del servicio de gestión de pagos.</summary>
public class PaymentService : IPaymentService
{
    private readonly IPaymentRepository _paymentRepository;

    public PaymentService(IPaymentRepository paymentRepository)
    {
        _paymentRepository = paymentRepository;
    }

    /// <inheritdoc/>
    public async Task<PagedResult<PaymentDto>> GetPagedAsync(PaginationParams pagination)
    {
        var (pagos, total) = await _paymentRepository.GetPagedAsync(pagination.Skip, pagination.PageSize);
        return new PagedResult<PaymentDto>
        {
            Items = pagos.Select(MapToDto).ToList(),
            Page = pagination.Page,
            PageSize = pagination.PageSize,
            TotalCount = total
        };
    }

    /// <inheritdoc/>
    public Task<PaymentSummaryDto> GetSummaryAsync() => _paymentRepository.GetSummaryAsync();

    /// <inheritdoc/>
    public async Task<PaymentDto> CreateAsync(int usuarioId, CreatePaymentDto dto)
    {
        var pago = new Pago
        {
            UsuarioId = usuarioId,
            MembresiaId = dto.MembresiaId,
            MontoCOP = dto.MontoCOP,
            Estado = EstadoPago.PENDIENTE,
            FechaPago = DateTime.UtcNow
        };

        await _paymentRepository.CreateAsync(pago);

        return MapToDto(pago);
    }

    /// <inheritdoc/>
    public async Task<PaymentDto> ApproveAsync(int pagoId, int aprobadorId)
    {
        var pago = await _paymentRepository.GetByIdAsync(pagoId)
            ?? throw new KeyNotFoundException($"Pago con Id={pagoId} no encontrado");

        if (pago.Estado != EstadoPago.PENDIENTE)
            throw new InvalidOperationException("Solo se pueden aprobar pagos en estado PENDIENTE");

        pago.Estado = EstadoPago.APROBADO;
        pago.FechaAprobacion = DateTime.UtcNow;
        pago.AprobadoPorId = aprobadorId;

        // Si el pago tiene membresía asociada, activa la membresía
        if (pago.MembresiaId.HasValue && pago.Membresia is not null)
        {
            pago.Membresia.Estado = EstadoMembresia.ACTIVA;
        }

        await _paymentRepository.UpdateAsync(pago);

        return MapToDto(pago);
    }

    /// <inheritdoc/>
    public async Task<PaymentDto> RejectAsync(int pagoId, int aprobadorId, RejectPaymentDto dto)
    {
        if (string.IsNullOrWhiteSpace(dto.ComentarioRechazo) || dto.ComentarioRechazo.Length < 10)
            throw new InvalidOperationException("El comentario de rechazo es obligatorio y debe tener al menos 10 caracteres (RN-05)");

        var pago = await _paymentRepository.GetByIdAsync(pagoId)
            ?? throw new KeyNotFoundException($"Pago con Id={pagoId} no encontrado");

        if (pago.Estado != EstadoPago.PENDIENTE)
            throw new InvalidOperationException("Solo se pueden rechazar pagos en estado PENDIENTE");

        pago.Estado = EstadoPago.RECHAZADO;
        pago.ComentarioRechazo = dto.ComentarioRechazo;
        pago.AprobadoPorId = aprobadorId;
        pago.FechaAprobacion = DateTime.UtcNow;

        await _paymentRepository.UpdateAsync(pago);

        return MapToDto(pago);
    }

    /// <summary>Elimina lógicamente un pago estableciendo EliminadoEn.</summary>
    public async Task DeleteAsync(int pagoId)
    {
        var pago = await _paymentRepository.GetByIdAsync(pagoId)
            ?? throw new KeyNotFoundException($"Pago con Id={pagoId} no encontrado");

        pago.EliminadoEn = DateTime.UtcNow;
        await _paymentRepository.UpdateAsync(pago);
    }

    // ──────────────────────────────────────────────
    // Métodos auxiliares
    // ──────────────────────────────────────────────

    private static PaymentDto MapToDto(Pago p)
    {
        var nombreUsuario = p.Usuario is not null
            ? $"{p.Usuario.Nombre} {p.Usuario.Apellido}".Trim()
            : string.Empty;

        var nombreAprobador = p.AprobadoPor is not null
            ? $"{p.AprobadoPor.Nombre} {p.AprobadoPor.Apellido}".Trim()
            : null;

        return new PaymentDto
        {
            Id = p.Id,
            UsuarioId = p.UsuarioId,
            NombreUsuario = nombreUsuario,
            MontoCOP = p.MontoCOP,
            Estado = p.Estado.ToString(),
            FechaPago = p.FechaPago,
            FechaAprobacion = p.FechaAprobacion,
            NombreAprobador = nombreAprobador,
            ComentarioRechazo = p.ComentarioRechazo,
            TieneComprobante = p.Comprobante != null
        };
    }
}
