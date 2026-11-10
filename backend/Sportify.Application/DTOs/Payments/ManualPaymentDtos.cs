using System.ComponentModel.DataAnnotations;
using Microsoft.AspNetCore.Http;
using Sportify.Domain.Enums;

namespace Sportify.Application.DTOs.Payments;

public class ManualPaymentDto
{
    [Required(ErrorMessage = "El usuario es requerido")]
    [Range(1, int.MaxValue, ErrorMessage = "El identificador de usuario no es válido")]
    public int UsuarioId { get; set; }

    public int? MembresiaId { get; set; }

    [Required(ErrorMessage = "El monto es requerido")]
    [Range(1000, double.MaxValue, ErrorMessage = "El monto mínimo es de $1.000 COP")]
    public decimal MontoCOP { get; set; }
}

public class ManualPaymentWithReceiptDto
{
    [Range(1, int.MaxValue, ErrorMessage = "El identificador de usuario no es válido")]
    public int UsuarioId { get; set; }

    public int? MembresiaId { get; set; }

    [Required(ErrorMessage = "El monto es requerido")]
    [Range(1000, double.MaxValue, ErrorMessage = "El monto mínimo es de $1.000 COP")]
    public decimal MontoCOP { get; set; }

    [Required(ErrorMessage = "El archivo de comprobante es obligatorio")]
    public IFormFile Archivo { get; set; } = null!;
}

/// <summary>DTO tipado para listar opciones mínimas de miembros en formularios de pago (sin exponer credenciales).</summary>
public class PaymentMemberOptionDto
{
    public int Id { get; set; }
    public string Nombre { get; set; } = string.Empty;
    public string Apellido { get; set; } = string.Empty;
}

/// <summary>DTO tipado para listar opciones de membresías activas/pendientes en formularios de caja.</summary>
public class PaymentMembershipOptionDto
{
    public int Id { get; set; }
    public int UsuarioId { get; set; }
    public EstadoMembresia Estado { get; set; }
    public string? Plan { get; set; }
    public DateTime FechaInicio { get; set; }
    public DateTime FechaFin { get; set; }
}

/// <summary>DTO de respuesta con los catálogos estrictamente necesarios para el formulario de pagos.</summary>
public class PaymentOptionsDto
{
    public IEnumerable<PaymentMemberOptionDto> Members { get; set; } = [];
    public IEnumerable<PaymentMembershipOptionDto> Memberships { get; set; } = [];
}

/// <summary>DTO de respuesta al registrar un pago con comprobante adjunto.</summary>
public class PaymentReceiptResponseDto
{
    public string Message { get; set; } = string.Empty;
}
