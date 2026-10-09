namespace Sportify.Application.DTOs.Payments;

/// <summary>Totales de pagos calculados en servidor (independientes de la paginación).</summary>
public class PaymentSummaryDto
{
    public int Pendientes { get; set; }
    public decimal TotalAprobadoCOP { get; set; }
}
