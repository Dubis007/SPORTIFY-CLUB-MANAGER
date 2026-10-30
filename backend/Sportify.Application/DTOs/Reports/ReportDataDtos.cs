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

public class PaymentVoucherDataDto
{
    public int PagoId { get; set; }
    public int UsuarioId { get; set; }
    public string UsuarioNombre { get; set; } = string.Empty;
    public string UsuarioCorreo { get; set; } = string.Empty;
    public string SedeNombre { get; set; } = "Sede General";
    public string PlanNombre { get; set; } = "Cargo Administrativo / Membresía";
    public DateTime? FechaInicioMembresia { get; set; }
    public DateTime? FechaFinMembresia { get; set; }
    public decimal MontoCOP { get; set; }
    public string Estado { get; set; } = string.Empty;
    public DateTime FechaPago { get; set; }
    public DateTime? FechaAprobacion { get; set; }
    public string? AprobadoPorNombre { get; set; }
    public string? ComentarioRechazo { get; set; }
    public string CodigoVerificacion { get; set; } = string.Empty;
}
