namespace Sportify.Application.DTOs.MembershipPlans;

public class MembershipPlanDto
{
    public int Id { get; set; }
    public string Nombre { get; set; } = string.Empty;
    public string Descripcion { get; set; } = string.Empty;
    public decimal PrecioCOP { get; set; }
    public int DuracionDias { get; set; }
    public bool Activo { get; set; }
    public DateTime CreadoEn { get; set; }
}

public class SaveMembershipPlanDto
{
    public string Nombre { get; set; } = string.Empty;
    public string Descripcion { get; set; } = string.Empty;
    public decimal PrecioCOP { get; set; }
    public int DuracionDias { get; set; }
    public bool Activo { get; set; } = true;
}
