using Sportify.Domain.Entities;

namespace Sportify.Application.Interfaces;

public interface IPaymentRepository
{
    Task<IEnumerable<Pago>> GetAllAsync();
    Task<Pago?> GetByIdAsync(int id);
    Task<Pago> CreateAsync(Pago pago);
    Task UpdateAsync(Pago pago);
    Task<Membresia?> GetMembresiaByIdAsync(int membresiaId);
    Task<IEnumerable<Usuario>> GetMembersForOptionsAsync();
    Task<IEnumerable<Membresia>> GetMembershipsForOptionsAsync();
    Task CreateComprobanteAsync(ComprobantePago comprobante);
    Task UpdateMembresiaAsync(Membresia membresia);
}
