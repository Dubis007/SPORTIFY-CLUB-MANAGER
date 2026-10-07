using Sportify.Application.DTOs.Payments;
using Sportify.Application.Interfaces;
using Sportify.Domain.Entities;
using Sportify.Domain.Enums;

namespace Sportify.Application.Services;

/// <summary>Implementación del servicio de gestión de pagos.</summary>
public class PaymentService : IPaymentService
{
    private readonly IPaymentRepository _paymentRepository;
    private readonly IFileStorageService _fileStorageService;

    public PaymentService(IPaymentRepository paymentRepository, IFileStorageService fileStorageService)
    {
        _paymentRepository = paymentRepository;
        _fileStorageService = fileStorageService;
    }

    /// <inheritdoc/>
    public async Task<IEnumerable<PaymentDto>> GetAllAsync()
    {
        var pagos = await _paymentRepository.GetAllAsync();
        return pagos.Select(MapToDto);
    }

    public async Task<object> GetOptionsAsync()
    {
        var members = await _paymentRepository.GetMembersForOptionsAsync();
        var membersObj = members.Select(u => new { u.Id, u.Nombre, u.Apellido });

        var memberships = await _paymentRepository.GetMembershipsForOptionsAsync();
        var membershipsObj = memberships.Select(m => new { 
            m.Id, 
            m.UsuarioId, 
            m.Estado, 
            Plan = m.PlanMembresia?.Nombre,
            m.FechaInicio,
            m.FechaFin
        });

        return new { Members = membersObj, Memberships = membershipsObj };
    }

    public async Task<PaymentDto> ManualRegisterAsync(int aprobadorId, ManualPaymentDto dto)
    {
        var pago = new Pago
        {
            UsuarioId = dto.UsuarioId,
            MembresiaId = dto.MembresiaId,
            MontoCOP = dto.MontoCOP,
            Estado = EstadoPago.APROBADO,
            FechaPago = DateTime.UtcNow,
            FechaAprobacion = DateTime.UtcNow,
            AprobadoPorId = aprobadorId
        };

        await _paymentRepository.CreateAsync(pago);

        if (dto.MembresiaId.HasValue) 
        {
            var membresia = await _paymentRepository.GetMembresiaByIdAsync(dto.MembresiaId.Value);
            if (membresia != null && membresia.Estado != EstadoMembresia.ACTIVA)
            {
                membresia.Estado = EstadoMembresia.ACTIVA;
                await _paymentRepository.UpdateMembresiaAsync(membresia);
            }
        }
        
        return MapToDto(pago);
    }

    public async Task<object> ManualWithReceiptAsync(ManualPaymentWithReceiptDto dto)
    {
        if (dto.Archivo == null || dto.Archivo.Length == 0)
            throw new ArgumentException("Se requiere un archivo PDF/Imagen válido.", nameof(dto.Archivo));

        var relativePath = await _fileStorageService.SaveFileAsync(dto.Archivo, "receipts");

        var pago = new Pago
        {
            UsuarioId = dto.UsuarioId,
            MembresiaId = dto.MembresiaId,
            MontoCOP = dto.MontoCOP,
            Estado = EstadoPago.PENDIENTE,
            FechaPago = DateTime.UtcNow
        };
        await _paymentRepository.CreateAsync(pago);

        var comprobante = new ComprobantePago
        {
            PagoId = pago.Id,
            RutaArchivo = relativePath,
            NombreArchivo = dto.Archivo.FileName,
            TipoMime = dto.Archivo.ContentType,
            TamanoBytes = dto.Archivo.Length,
            SubidoEn = DateTime.UtcNow
        };
        await _paymentRepository.CreateComprobanteAsync(comprobante);

        return new { message = "Comprobante subido exitosamente y pago en estado PENDIENTE." };
    }

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
            if (pago.Membresia.PlanMembresia is not null)
            {
                if (pago.Membresia.FechaFin > DateTime.UtcNow)
                {
                    pago.Membresia.FechaFin = pago.Membresia.FechaFin.AddDays(pago.Membresia.PlanMembresia.DuracionDias);
                }
                else
                {
                    pago.Membresia.FechaInicio = DateTime.UtcNow;
                    pago.Membresia.FechaFin = DateTime.UtcNow.AddDays(pago.Membresia.PlanMembresia.DuracionDias);
                }
            }
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
            TieneComprobante = p.Comprobante != null,
            ComprobanteUrl = p.Comprobante?.RutaArchivo
        };
    }
}

