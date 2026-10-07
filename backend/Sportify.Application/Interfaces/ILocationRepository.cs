namespace Sportify.Application.Interfaces;

using Sportify.Domain.Entities;
using System.Collections.Generic;
using System.Threading.Tasks;

public interface ILocationRepository
{
    Task<IEnumerable<LocationDto>> GetAllWithStatsAsync();
    Task<Sede?> GetByIdAsync(int id);
    Task<Sede> AddAsync(Sede sede);
    Task UpdateAsync(Sede sede);
}

public class LocationDto
{
    public int Id { get; set; }
    public string? Nombre { get; set; }
    public string? Direccion { get; set; }
    public string? Ciudad { get; set; }
    public string? Telefono { get; set; }
    public bool Activo { get; set; }
    public int UsuariosActivos { get; set; }
    public int Empleados { get; set; }
}
