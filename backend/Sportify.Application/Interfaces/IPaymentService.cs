using Sportify.Application.DTOs.Payments;

namespace Sportify.Application.Interfaces;

/// <summary>Interfaz del servicio de gestión de pagos.</summary>
public interface IPaymentService
{
    Task<IEnumerable<PaymentDto>> GetAllAsync();
    Task<object> GetOptionsAsync();
    Task<PaymentDto> CreateAsync(int usuarioId, CreatePaymentDto dto);
    Task<PaymentDto> ManualRegisterAsync(int aprobadorId, ManualPaymentDto dto);
    Task<object> ManualWithReceiptAsync(ManualPaymentWithReceiptDto dto);
    Task<PaymentDto> ApproveAsync(int pagoId, int aprobadorId);
    Task<PaymentDto> RejectAsync(int pagoId, int aprobadorId, RejectPaymentDto dto);
}
