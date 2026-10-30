namespace Sportify.Application.DTOs.Reports;

public class PaymentReportRowDto
{
    public int Id { get; set; }
    public string UsuarioNombre { get; set; } = string.Empty;
    public decimal MontoCOP { get; set; }
    public string Estado { get; set; } = string.Empty;
    public DateTime FechaPago { get; set; }
    public DateTime? FechaAprobacion { get; set; }
}

public class MemberReportRowDto
{
    public string NombreCompleto { get; set; } = string.Empty;
    public string Correo { get; set; } = string.Empty;
    public string Roles { get; set; } = string.Empty;
    public DateTime FechaRegistro { get; set; }
}

public class LocationReportRowDto
{
    public string Nombre { get; set; } = string.Empty;
    public string Ciudad { get; set; } = string.Empty;
    public string Direccion { get; set; } = string.Empty;
    public string? Telefono { get; set; }
    public bool Activo { get; set; }
    public DateTime CreadoEn { get; set; }
}
