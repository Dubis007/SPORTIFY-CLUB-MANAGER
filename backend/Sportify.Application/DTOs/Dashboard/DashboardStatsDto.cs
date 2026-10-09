namespace Sportify.Application.DTOs.Dashboard;

/// <summary>Métricas del dashboard de administración, calculadas en servidor.</summary>
public class DashboardStatsDto
{
    public int UsuariosActivos { get; set; }
    public int MembresiasActivas { get; set; }

    /// <summary>Suma de pagos APROBADO cuya FechaPago cae en el mes actual (UTC).</summary>
    public decimal IngresosMesCOP { get; set; }

    public int PagosPendientes { get; set; }

    /// <summary>Últimos 6 meses (incluido el actual), en orden cronológico; meses sin pagos en 0.</summary>
    public List<IngresoMensualDto> IngresosPorMes { get; set; } = [];

    /// <summary>Un elemento por cada valor de EstadoMembresia.</summary>
    public List<MembresiasPorEstadoDto> MembresiasPorEstado { get; set; } = [];

    /// <summary>Últimos 6 meses (incluido el actual), en orden cronológico; meses sin registros en 0.</summary>
    public List<UsuariosMensualDto> NuevosUsuariosPorMes { get; set; } = [];

    public DateTime GeneradoEn { get; set; }
}

public class IngresoMensualDto
{
    public int Anio { get; set; }
    public int Mes { get; set; }
    public decimal TotalCOP { get; set; }
}

public class MembresiasPorEstadoDto
{
    public string Estado { get; set; } = string.Empty;
    public int Cantidad { get; set; }
}

public class UsuariosMensualDto
{
    public int Anio { get; set; }
    public int Mes { get; set; }
    public int Cantidad { get; set; }
}
