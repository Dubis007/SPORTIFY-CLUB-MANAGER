namespace Sportify.Application.DTOs.Dashboard;

/// <summary>Métricas del dashboard de administración, calculadas en servidor.</summary>
public class DashboardStatsDto
{
    public int UsuariosActivos { get; set; }
    public int MembresiasActivas { get; set; }

    /// <summary>Total de usuarios activos con rol deportivo MIEMBRO.</summary>
    public int TotalMiembrosDeportivos { get; set; }

    /// <summary>Porcentaje de miembros deportivos con membresía al día (0% cuando TotalMiembrosDeportivos == 0, evitando división 0/0).</summary>
    public decimal TasaMembresiasAlDiaPct { get; set; }

    /// <summary>Suma de pagos APROBADO cuya FechaPago cae en el mes actual (UTC).</summary>
    public decimal IngresosMesCOP { get; set; }

    /// <summary>Suma acumulada de pagos APROBADO en la ventana móvil de los últimos 12 meses.</summary>
    public decimal IngresosAnualesCOP { get; set; }

    public int PagosPendientes { get; set; }

    /// <summary>Últimos 6 meses (incluido el actual), en orden cronológico; meses sin pagos en 0.</summary>
    public List<IngresoMensualDto> IngresosPorMes { get; set; } = [];

    /// <summary>Últimos 12 meses (incluido el actual), en orden cronológico; meses sin pagos en 0 (VID1-RF-008 / VID2-RF-010).</summary>
    public List<IngresoMensualDto> IngresosUltimos12Meses { get; set; } = [];

    /// <summary>Un elemento por cada valor de EstadoMembresia.</summary>
    public List<MembresiasPorEstadoDto> MembresiasPorEstado { get; set; } = [];

    /// <summary>Últimos 6 meses (incluido el actual), en orden cronológico; meses sin registros en 0.</summary>
    public List<UsuariosMensualDto> NuevosUsuariosPorMes { get; set; } = [];

    /// <summary>Alertas operativas accionables para retención y cobranza (VID1-RF-008 / VID2-RF-010).</summary>
    public DashboardAlertsDto AlertasAccionables { get; set; } = new();

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

public class DashboardAlertsDto
{
    /// <summary>Miembros activos sin registro de asistencia presente en los últimos 21 días (&gt; 3 semanas).</summary>
    public int MiembrosSinAsistencia21Dias { get; set; }

    /// <summary>Membresías activas cuya FechaFin vence dentro de los próximos 7 días.</summary>
    public int MembresiasPorVencer7Dias { get; set; }

    /// <summary>Membresías vencidas o en mora registradas en el padrón.</summary>
    public int MembresiasVencidas { get; set; }

    /// <summary>Pagos radicados en estado PENDIENTE de conciliación contable.</summary>
    public int PagosPendientesRevision { get; set; }

    public int TotalAlertas =>
        MiembrosSinAsistencia21Dias +
        MembresiasPorVencer7Dias +
        MembresiasVencidas +
        PagosPendientesRevision;
}

/// <summary>Instantánea consolidada consumida por microservicio2 (:5102) en GET /api/dashboard/metrics.</summary>
public class DashboardLiveMetricsDto
{
    public int MiembrosActivos { get; set; }
    public int MembresiasVencidas { get; set; }
    public int MembresiasPendientes { get; set; }
    public decimal IngresosTotalesAprobados { get; set; }
    public int PagosPendientesRevision { get; set; }
    public int EntrenamientosProgramados { get; set; }
    public int CompetenciasActivas { get; set; }
    public decimal TasaAsistenciaPromedio { get; set; }
}
