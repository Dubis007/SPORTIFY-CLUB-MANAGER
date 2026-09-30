using Sportify.Domain.Enums;

namespace Sportify.Application.DTOs.Memberships;

public class MembershipDto
{
    public int Id { get; set; }
    public int UsuarioId { get; set; }
    public string UsuarioNombre { get; set; } = string.Empty;
    public int PlanMembresiaId { get; set; }
    public string PlanNombre { get; set; } = string.Empty;
    public DateTime FechaInicio { get; set; }
    public DateTime FechaFin { get; set; }
    public string Estado { get; set; } = string.Empty;
    public DateTime CreadoEn { get; set; }
}

public class CreateMembershipDto
{
    public int UsuarioId { get; set; }
    public int PlanMembresiaId { get; set; }
    public DateTime FechaInicio { get; set; }
}

public class UpdateMembershipStatusDto
{
    public EstadoMembresia Estado { get; set; }
}

public class PlanMembresiaDto
{
    public int Id { get; set; }
    public string Nombre { get; set; } = string.Empty;
    public string Descripcion { get; set; } = string.Empty;
    public decimal PrecioCOP { get; set; }
    public int DuracionDias { get; set; }
    public bool Activo { get; set; }
}
