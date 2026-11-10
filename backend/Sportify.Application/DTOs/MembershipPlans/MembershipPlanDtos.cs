using System.ComponentModel.DataAnnotations;

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
    [Required(ErrorMessage = "El nombre del plan es requerido")]
    [MaxLength(100, ErrorMessage = "El nombre del plan no puede superar los 100 caracteres")]
    public string Nombre { get; set; } = string.Empty;

    [MaxLength(500, ErrorMessage = "La descripción no puede superar los 500 caracteres")]
    public string Descripcion { get; set; } = string.Empty;

    [Required(ErrorMessage = "El precio es requerido")]
    [Range(1000, double.MaxValue, ErrorMessage = "El precio del plan debe ser de al menos $1.000 COP")]
    public decimal PrecioCOP { get; set; }

    [Required(ErrorMessage = "La duración en días es requerida")]
    [Range(1, 3650, ErrorMessage = "La duración debe estar entre 1 y 3650 días")]
    public int DuracionDias { get; set; }

    public bool Activo { get; set; } = true;
}
