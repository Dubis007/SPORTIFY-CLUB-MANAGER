using Sportify.Application.DTOs.Common;
using Sportify.Application.DTOs.Payments;

namespace Sportify.Application.Interfaces;

/// <summary>Interfaz del servicio de gestión de pagos.</summary>
public interface IPaymentService
{
    Task<PagedResult<PaymentDto>> GetPagedAsync(PaginationParams pagination);
    Task<PaymentSummaryDto> GetSummaryAsync();
    Task<PaymentDto> CreateAsync(int usuarioId, CreatePaymentDto dto);
    Task<PaymentDto> ApproveAsync(int pagoId, int aprobadorId);
    Task<PaymentDto> RejectAsync(int pagoId, int aprobadorId, RejectPaymentDto dto);
}
