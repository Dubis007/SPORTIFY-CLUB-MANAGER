namespace Sportify.Application.DTOs.Locations;

public class LocationDto
{
    public int Id { get; set; }
    public string? Nombre { get; set; }
    public string? Direccion { get; set; }
    public string? Ciudad { get; set; }
    public string? Telefono { get; set; }
    public bool Activo { get; set; }
    public DateTime CreadoEn { get; set; }
    public int UsuariosActivos { get; set; }
    public int Empleados { get; set; }
}

public class SaveLocationDto
{
    public string Nombre { get; set; } = string.Empty;
    public string Direccion { get; set; } = string.Empty;
    public string Ciudad { get; set; } = string.Empty;
    public string? Telefono { get; set; }
    public bool Activo { get; set; } = true;
}
